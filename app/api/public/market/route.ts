import { NextResponse } from "next/server";
import { defaultMarketList } from "@/lib/market/default-list";
import { getMarketCollection } from "@/lib/market/service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const demoMode = searchParams.get("demoMode") === "true";

  try {
    const result = await getMarketCollection({
      targets: defaultMarketList,
      demoMode,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        updatedAt: new Date().toISOString(),
        sourceMode: "REAL_WITH_FALLBACK",
        items: [],
        warnings: [error instanceof Error ? error.message : "Public market route failed"],
      },
      { status: 200 },
    );
  }
}
