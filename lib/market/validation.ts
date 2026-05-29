import { fetchOkxInstruments } from "./providers/okx-instruments";
import type { MarketData, MarketName } from "./types";

type OkxValidationResult = {
  valid: boolean;
  message: string;
};

const okxInstrumentCacheTtlMs = 5 * 60_000;

const globalForValidation = globalThis as typeof globalThis & {
  __marketLightOkxSpotInstrumentCache?: {
    expiresAt: number;
    symbols: Set<string>;
  };
};

export async function validateOkxSymbol(symbol: string): Promise<boolean> {
  const result = await getOkxSymbolValidation(symbol);
  return result.valid;
}

export async function validateMarketSymbol(market: MarketName, symbol: string): Promise<boolean> {
  if (market === "TWSE") return /^\d+$/.test(symbol);
  return validateOkxSymbol(symbol);
}

export async function getOkxSymbolValidation(symbol: string): Promise<OkxValidationResult> {
  const normalizedSymbol = symbol.trim().toUpperCase();

  if (!/^[A-Z0-9]+-[A-Z0-9]+$/.test(normalizedSymbol)) {
    return {
      valid: false,
      message: "Invalid OKX instrument format",
    };
  }

  let instruments: Set<string>;
  try {
    instruments = await getOkxSpotInstrumentSymbols();
  } catch (error) {
    return {
      valid: false,
      message: error instanceof Error ? error.message : "OKX instruments validation failed",
    };
  }

  const valid = instruments.has(normalizedSymbol);

  return {
    valid,
    message: valid ? "Valid OKX instrument" : "Invalid OKX instrument",
  };
}

export function createOkxErrorMarketData({
  symbol,
  displayName,
  message,
}: {
  symbol: string;
  displayName?: string;
  message: string;
}): MarketData {
  return {
    symbol,
    market: "OKX",
    displayName: displayName || symbol.split("-")[0] || symbol,
    price: 0,
    yesterday: 0,
    change: 0,
    changePercent: 0,
    high: 0,
    low: 0,
    volume: 0,
    tradeTime: "--",
    source: "OKX",
    quoteQuality: "fallback",
    status: "error",
    message,
    stale: true,
    updatedAt: new Date().toISOString(),
  };
}

async function getOkxSpotInstrumentSymbols() {
  const cached = globalForValidation.__marketLightOkxSpotInstrumentCache;
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return cached.symbols;
  }

  const result = await fetchOkxInstruments({ instType: "SPOT" });

  if (!result.success || !result.data) {
    if (cached) return cached.symbols;
    throw new Error(result.message || "OKX instruments validation failed");
  }

  const symbols = new Set(
    result.data.items
      .filter((item) => item.state === "live")
      .map((item) => item.instId.toUpperCase()),
  );

  globalForValidation.__marketLightOkxSpotInstrumentCache = {
    expiresAt: now + okxInstrumentCacheTtlMs,
    symbols,
  };

  return symbols;
}
