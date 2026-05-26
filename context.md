# Tami Dash — Context

## 2026-05-26 — Project Init

### Tujuan
Buat dashboard untuk monitor:
1. User yang punya langganan/kredit CreateWhiz
2. Sisa kredit CreateWhiz per user
3. Data deliverables dari API CreateWhiz

### Sumber Data
- **User & Credit:** Supabase — `credit_manager_transactions` + `credit_manager_users`
- **Deliverables:** CreateWhiz API `/api/ext/deliverables/{id}`

### Keputusan
- Next.js 16 + Supabase + Tailwind v4
- Server component untuk fetching data (service_role key)
- API route sebagai proxy ke createwhiz (supaya token ga bocor ke client)
- Deploy ke Vercel nanti

### Files Created
- `web/` — Next.js app (config, components, API routes)
- `knowledge.md` — Catatan teknis & reference
- `context.md` — Ringkasan diskusi ini
