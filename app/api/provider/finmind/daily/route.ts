import { NextResponse } from "next/server";
import { fetchFinMindDailyStock } from "@/lib/market/providers/finmind";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStoreResponse = {
  headers: {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "2330";
  const includeDebug = searchParams.get("debug") === "true";

  try {
    const result = await fetchFinMindDailyStock({ symbol });

    if (result.success && result.data) {
      return NextResponse.json(
        {
          success: true,
          ...result.data,
          warning: result.warning,
          updatedAt: new Date().toISOString(),
          ...(includeDebug ? { debug: result.debug } : {}),
        },
        noStoreResponse,
      );
    }

    return NextResponse.json(
      {
        success: false,
        source: "FINMIND",
        message: result.message || "FinMind daily request failed",
        ...(includeDebug ? { debug: result.debug } : {}),
      },
      { status: 200, ...noStoreResponse },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        source: "FINMIND",
        message: error instanceof Error ? error.message : "FinMind daily route failed",
      },
      { status: 200, ...noStoreResponse },
    );
  }
}
