import type { MarketStatus } from "../market-status";

export type PriceColorMode = "international" | "taiwan";
export type DirectionRgbColor = "green" | "red" | "cyan" | "yellow" | "muted";

export const priceColorModeStorageKey = "market-light-price-color-mode-v1";
export const priceColorModeChangeEvent = "market-light-price-color-mode-change";
export const defaultPriceColorMode: PriceColorMode = "international";

export function isPriceColorMode(value: string | null): value is PriceColorMode {
  return value === "international" || value === "taiwan";
}

export function getDirectionTextClass(changePercent: number, mode: PriceColorMode) {
  if (changePercent === 0) return "text-cyan";

  if (mode === "taiwan") {
    return changePercent > 0 ? "text-red-300" : "text-green-300";
  }

  return changePercent > 0 ? "text-green-300" : "text-red-300";
}

export function getDirectionRgbColor(status: MarketStatus, mode: PriceColorMode): DirectionRgbColor {
  if (status === "up" || status === "up_alert") {
    return mode === "taiwan" ? "red" : "green";
  }

  if (status === "down" || status === "down_alert") {
    return mode === "taiwan" ? "green" : "red";
  }

  if (status === "error") return "yellow";
  if (status === "quiet" || status === "closed") return "muted";
  return "cyan";
}
