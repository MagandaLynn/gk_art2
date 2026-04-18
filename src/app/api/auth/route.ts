import { NextResponse } from "next/server";

const DEFAULT_ACCESS_CODE = "artist-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let accessCode: string | undefined;
  try {
    const body = (await request.json()) as { accessCode?: string };
    accessCode = body.accessCode;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!accessCode) {
    return NextResponse.json({ error: "Missing access code" }, { status: 400 });
  }

  const adminAccessCode = process.env.ADMIN_ACCESS_CODE || DEFAULT_ACCESS_CODE;
  if (accessCode !== adminAccessCode) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
