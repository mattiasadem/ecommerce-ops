import { loadIkasStoreOverview, type IkasStoreResult } from "@/lib/ikas";
import { NextResponse } from "next/server";

// This is a server-side route. The access token never leaves the server.
// Cache: no-store — every refresh shows the operator fresh numbers.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(): Promise<NextResponse<IkasStoreResult>> {
  const result = await loadIkasStoreOverview();
  // HTTP 200 even for the "error" envelope — the UI wants to render the
  // reason, not get bounced by a hard error. Distinguish via the `ok` flag
  // in the JSON body. The only non-200 status is for an off-the-rails crash.
  return NextResponse.json(result, {
    status: result.ok ? 200 : 503,
    headers: {
      "cache-control": "no-store",
    },
  });
}
