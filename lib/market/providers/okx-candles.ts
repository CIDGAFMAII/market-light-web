import { fetchWithTimeout } from "../../fetch-with-timeout";
import { buildSparkline } from "../sparkline";

export type DetailChartRange = "5m" | "15m" | "1h" | "24h";

export type MarketChartData = {
  symbol: string;
  market: "OKX" | "TWSE";
  range: DetailChartRange;
  source: "OKX" | "DEMO";
  points: number[];
  sparkline: string;
  updatedAt: string;
  stale?: boolean;
  warning?: string;
};

type OkxCandlesResponse = {
  code?: string;
  msg?: string;
  data?: string[][];
};

type CachedChart = MarketChartData & {
  cachedAt: number;
};

const chartRangeParams: Record<DetailChartRange, { bar: string; limit: number }> = {
  "5m": { bar: "1m", limit: 5 },
  "15m": { bar: "1m", limit: 15 },
  "1h": { bar: "5m", limit: 12 },
  "24h": { bar: "1H", limit: 24 },
};

const chartCacheTtlMs = 60_000;

const globalForOkxChart = globalThis as typeof globalThis & {
  __marketLightOkxChartCache?: Map<string, CachedChart>;
};

const chartCache = globalForOkxChart.__marketLightOkxChartCache ?? new Map<string, CachedChart>();
globalForOkxChart.__marketLightOkxChartCache = chartCache;

export function isDetailChartRange(value: string | null): value is DetailChartRange {
  return value === "5m" || value === "15m" || value === "1h" || value === "24h";
}

export async function fetchOkxCandlesChart({
  symbol,
  range,
}: {
  symbol: string;
  range: DetailChartRange;
}): Promise<MarketChartData> {
  const normalizedSymbol = symbol.trim().toUpperCase();
  const cacheKey = getOkxChartCacheKey(normalizedSymbol, range);
  const cached = chartCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.cachedAt < chartCacheTtlMs) {
    return toPublicChart(cached);
  }

  try {
    const params = chartRangeParams[range];
    const url = new URL("https://www.okx.com/api/v5/market/candles");
    url.searchParams.set("instId", normalizedSymbol);
    url.searchParams.set("bar", params.bar);
    url.searchParams.set("limit", String(params.limit));

    const response = await fetchWithTimeout(url, {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(`OKX candles HTTP ${response.status}`);
    }

    const payload = (await response.json()) as OkxCandlesResponse;

    if (payload.code !== "0") {
      throw new Error(payload.msg || `OKX candles code ${payload.code}`);
    }

    const rows = payload.data ?? [];
    const points = rows
      .map((row) => Number(row[4]))
      .filter((point) => Number.isFinite(point))
      .reverse();

    if (points.length === 0) {
      throw new Error("OKX candles response missing close prices");
    }

    const chart: CachedChart = {
      symbol: normalizedSymbol,
      market: "OKX",
      range,
      source: "OKX",
      points,
      sparkline: buildSparkline(points),
      updatedAt: new Date().toISOString(),
      cachedAt: now,
    };

    chartCache.set(cacheKey, chart);
    return toPublicChart(chart);
  } catch (error) {
    if (cached) {
      return {
        ...toPublicChart(cached),
        stale: true,
        warning: error instanceof Error ? error.message : "OKX candles fetch failed",
      };
    }

    return buildDemoChart({
      symbol: normalizedSymbol,
      market: "OKX",
      range,
      warning: error instanceof Error ? error.message : "OKX candles fetch failed",
    });
  }
}

export function buildDemoChart({
  symbol,
  market,
  range,
  warning,
}: {
  symbol: string;
  market: "OKX" | "TWSE";
  range: DetailChartRange;
  warning?: string;
}): MarketChartData {
  const points = getDemoPoints(range, symbol);

  return {
    symbol,
    market,
    range,
    source: "DEMO",
    points,
    sparkline: buildSparkline(points),
    updatedAt: new Date().toISOString(),
    stale: Boolean(warning),
    warning,
  };
}

function getOkxChartCacheKey(symbol: string, range: DetailChartRange) {
  return `OKX_CHART:${symbol}:${range}`;
}

function toPublicChart(chart: CachedChart): MarketChartData {
  return {
    symbol: chart.symbol,
    market: chart.market,
    range: chart.range,
    source: chart.source,
    points: [...chart.points],
    sparkline: chart.sparkline,
    updatedAt: chart.updatedAt,
    stale: chart.stale,
    warning: chart.warning,
  };
}

function getDemoPoints(range: DetailChartRange, symbol: string) {
  const length = chartRangeParams[range].limit;
  const seed = symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const base = 100 + (seed % 40);

  return Array.from({ length }, (_, index) => {
    const wave = Math.sin((index + seed) / 2.4) * 4;
    const trend = (index - length / 2) * 0.65;
    return Number((base + wave + trend).toFixed(2));
  });
}
