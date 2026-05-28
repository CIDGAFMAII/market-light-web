import { fetchWithTimeout } from "../../fetch-with-timeout";
import type { ProviderResult } from "../types";

export type OkxInstrumentItem = {
  instId: string;
  instType: string;
  baseCcy: string;
  quoteCcy: string;
  state: string;
  tickSz: string;
  lotSz: string;
  minSz: string;
  listTime: string;
};

type OkxInstrumentRaw = OkxInstrumentItem & {
  [key: string]: unknown;
};

type OkxInstrumentsResponse = {
  code?: string;
  msg?: string;
  data?: OkxInstrumentRaw[];
};

export async function fetchOkxInstruments({
  instType,
  instId,
  instFamily,
}: {
  instType: string;
  instId?: string;
  instFamily?: string;
}): Promise<ProviderResult<{ type: "instruments"; items: OkxInstrumentItem[] }>> {
  if (!instType) {
    return {
      success: false,
      source: "OKX",
      message: "instType is required",
    };
  }

  const params = new URLSearchParams({ instType });
  if (instFamily) params.set("instFamily", instFamily);
  const url = `https://www.okx.com/api/v5/public/instruments?${params.toString()}`;

  try {
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      return {
        success: false,
        source: "OKX",
        message: `OKX instruments HTTP ${response.status}`,
      };
    }

    const payload = (await response.json()) as OkxInstrumentsResponse;

    if (payload.code !== "0") {
      return {
        success: false,
        source: "OKX",
        message: payload.msg || `OKX instruments code ${payload.code}`,
      };
    }

    const data = payload.data ?? [];
    const filtered = instId
      ? data.filter((item) => item.instId.toUpperCase() === instId.toUpperCase())
      : data;

    return {
      success: true,
      source: "OKX",
      data: {
        type: "instruments",
        items: filtered.map(normalizeInstrument),
      },
    };
  } catch (error) {
    return {
      success: false,
      source: "OKX",
      message: error instanceof Error ? error.message : "OKX instruments fetch failed",
    };
  }
}

function normalizeInstrument(item: OkxInstrumentRaw): OkxInstrumentItem {
  return {
    instId: item.instId,
    instType: item.instType,
    baseCcy: item.baseCcy,
    quoteCcy: item.quoteCcy,
    state: item.state,
    tickSz: item.tickSz,
    lotSz: item.lotSz,
    minSz: item.minSz,
    listTime: item.listTime,
  };
}
