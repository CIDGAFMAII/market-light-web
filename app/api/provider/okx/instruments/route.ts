import { NextResponse } from "next/server";
import { fetchOkxInstruments } from "@/lib/market/providers/okx-instruments";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const instType = searchParams.get("instType") || "";
  const instId = searchParams.get("instId") || undefined;
  const instFamily = searchParams.get("instFamily") || undefined;

  try {
    const result = await fetchOkxInstruments({ instType, instId, instFamily });

    if (!result.success) {
      return NextResponse.json(result, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      source: "OKX",
      type: "instruments",
      items: result.data?.items ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        source: "OKX",
        type: "instruments",
        message: error instanceof Error ? error.message : "OKX instruments route failed",
      },
      { status: 200 },
    );
  }
}
