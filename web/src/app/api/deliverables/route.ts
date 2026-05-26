import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://createwhiz.ai/api/ext/deliverables";
const SUPER_TOKEN = process.env.CREATEWHIZ_SUPER_TOKEN!;

export async function GET(req: NextRequest) {
  const guid = req.nextUrl.searchParams.get("guid");
  if (!guid) {
    return NextResponse.json({ error: "Missing ?guid= parameter" }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_BASE}/${guid}`, {
      headers: { "x-super-token": SUPER_TOKEN },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `CreateWhiz API: ${res.status} ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
