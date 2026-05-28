export type MarketStatus =
  | "calm"
  | "up"
  | "up_alert"
  | "down"
  | "down_alert"
  | "error"
  | "closed"
  | "quiet";

export type StatusInput = {
  changePercent: number;
  apiError?: boolean;
  marketClosed?: boolean;
};

export function getMarketStatus({
  changePercent,
  apiError,
  marketClosed,
}: StatusInput): MarketStatus {
  if (apiError) return "error";
  if (marketClosed) return "closed";
  if (Math.abs(changePercent) < 0.5) return "calm";
  if (changePercent >= 1.5) return "up_alert";
  if (changePercent > 0) return "up";
  if (changePercent <= -1.5) return "down_alert";
  if (changePercent < 0) return "down";
  return "calm";
}

export const statusLabels: Record<MarketStatus, string> = {
  calm: "平穩",
  up: "上漲",
  up_alert: "上漲提醒",
  down: "下跌",
  down_alert: "下跌提醒",
  error: "API 異常",
  closed: "休市",
  quiet: "安靜模式",
};

export const petFaces: Record<MarketStatus, string> = {
  calm: "(-_-)",
  up: "(^_^)",
  up_alert: "(^o^)",
  down: "(._.)",
  down_alert: "(T_T)",
  error: "(?)",
  closed: "(-_-)zZ",
  quiet: "(-_-)",
};

export function statusTone(status: MarketStatus) {
  if (status === "up" || status === "up_alert") return "red";
  if (status === "down" || status === "down_alert") return "green";
  if (status === "error") return "yellow";
  if (status === "quiet" || status === "closed") return "muted";
  return "cyan";
}
