import { NextRequest, NextResponse } from "next/server";

const CW_BASE = "https://createwhiz.ai";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return new NextResponse("Missing ?url=", { status: 400 });
  }

  const fullUrl = url.startsWith("http") ? url : `${CW_BASE}${url}`;

  try {
    const res = await fetch(fullUrl, { cache: "no-store" });

    if (!res.ok) {
      return new NextResponse(`Upstream ${res.status}`, { status: res.status });
    }

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=600",
      },
    });
  } catch {
    return new NextResponse("Proxy error", { status: 502 });
  }
}
