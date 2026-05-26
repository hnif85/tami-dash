import { createAdminClient } from "@/lib/supabase";
import type { CreateWhizUser } from "@/lib/types";
import DeliverableModal from "@/components/DeliverableModal";

const AGENT_ID = "9ba95f62-7f26-4922-9b84-3fa0822b34ac";

async function getUsers(): Promise<CreateWhizUser[]> {
  const supabase = createAdminClient();

  const { data: txns, error: txnErr } = await supabase
    .from("credit_manager_transactions")
    .select("user_id, type, amount")
    .eq("agent", AGENT_ID);

  if (txnErr) {
    console.error("Supabase error (txns):", txnErr);
    return [];
  }

  const guidSet = new Set<string>();
  for (const t of txns) guidSet.add(t.user_id);
  const guids = Array.from(guidSet);

  const { data: customers } = await supabase
    .from("cms_customers")
    .select("guid, full_name, email, username, phone_number")
    .in("guid", guids)

  const customerMap = new Map<string, { full_name: string | null; email: string | null; username: string | null; phone: string | null }>();
  if (customers) {
    for (const c of customers) {
      customerMap.set(c.guid, {
        full_name: c.full_name || c.username || null,
        email: c.email || null,
        username: c.username || null,
        phone: c.phone_number || null,
      });
    }
  }

  const { data: excludedRows } = await supabase
    .from("demo_excluded_emails")
    .select("email")
    .eq("is_active", true);
  const excludedEmails = new Set((excludedRows ?? []).map((r) => r.email));

  const creditMap = new Map<string, CreateWhizUser>();

  for (const txn of txns) {
    if (!creditMap.has(txn.user_id)) {
      const c = customerMap.get(txn.user_id);
      creditMap.set(txn.user_id, {
        user_id: txn.user_id,
        full_name: c?.full_name ?? null,
        email: c?.email ?? null,
        phone: c?.phone ?? null,
        guid: txn.user_id,
        total_credits: 0,
        total_debits: 0,
        balance: 0,
      });
    }

    const entry = creditMap.get(txn.user_id)!;
    const amt = Number(txn.amount) || 0;
    if (txn.type === "credit") {
      entry.total_credits += amt;
      entry.balance += amt;
    } else {
      entry.total_debits += amt;
      entry.balance -= amt;
    }
  }

  return Array.from(creditMap.values())
    .filter((u) => (u.email ? !excludedEmails.has(u.email) : true))
    .sort((a, b) => b.total_debits - a.total_debits);
}

export default async function Dashboard() {
  const users = await getUsers();

  const totalCredits = users.reduce((s, u) => s + u.total_credits, 0);
  const totalDebits = users.reduce((s, u) => s + u.total_debits, 0);
  const totalBalance = users.reduce((s, u) => s + u.balance, 0);

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Tami Dash</h1>
        <p className="text-gray-500 mt-1">CreateWhiz — User, Credit &amp; Deliverables Monitor</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <SummaryCard label="Total Users" value={users.length} />
        <SummaryCard label="Total Credits Issued" value={totalCredits.toLocaleString()} />
        <SummaryCard label="Total Credits Used" value={totalDebits.toLocaleString()} />
        <SummaryCard label="Remaining Balance" value={totalBalance.toLocaleString()} />
      </div>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold">Users with CreateWhiz Credits</h2>
          <p className="text-sm text-gray-400">{users.length} users found</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wider">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium text-right">Credits</th>
                <th className="px-6 py-3 font-medium text-right">Used</th>
                <th className="px-6 py-3 font-medium text-right">Balance</th>
                <th className="px-6 py-3 font-medium text-center">Deliverables</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.slice(0, 100).map((u) => (
                  <tr key={u.user_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium">{u.full_name || "—"}</td>
                    <td className="px-6 py-3 text-gray-500">{u.email || "—"}</td>
                    <td className="px-6 py-3 text-right">{u.total_credits}</td>
                    <td className="px-6 py-3 text-right">{u.total_debits}</td>
                    <td className="px-6 py-3 text-right font-semibold">{u.balance}</td>
                    <td className="px-6 py-3 text-center">
                      {u.guid ? <DeliverableModal guid={u.guid} email={u.email} phone={u.phone} userName={u.full_name} /> : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
