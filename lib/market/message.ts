import type { MarketStatus } from "../market-status";

export function statusMessage(status: MarketStatus) {
  switch (status) {
    case "up_alert":
      return "Momentum strong";
    case "up":
      return "Market rising";
    case "down_alert":
      return "Downside alert";
    case "down":
      return "Market weak";
    case "closed":
      return "Market closed";
    case "error":
      return "Provider error";
    case "quiet":
      return "Quiet mode";
    default:
      return "Market calm";
  }
}

export function roundNumber(value: number, digits = 2) {
  if (!Number.isFinite(value)) return 0;
  const base = 10 ** digits;
  return Math.round(value * base) / base;
}
