import type { MarketStatus } from "./market-status";

export type CompanionMode = "normal" | "flirt" | "quiet";

export const companionModes: CompanionMode[] = ["normal", "flirt", "quiet"];

export function isCompanionMode(value: string): value is CompanionMode {
  return companionModes.includes(value as CompanionMode);
}

export function companionMessage(status: MarketStatus, mode: CompanionMode) {
  if (mode === "quiet") {
    return "我在旁邊安靜看著，有需要再叫我。";
  }

  if (mode === "flirt") {
    switch (status) {
      case "down_alert":
        return "股票跌沒關係，我還站你這邊。";
      case "down":
        return "它有點往下，但你先別急，我陪你看完。";
      case "up_alert":
        return "它漲得很快，但我看你的眼神更快。";
      case "up":
        return "市場在往上，你今天也很有光。";
      case "calm":
        return "市場很安靜，剛好適合想你。";
      case "closed":
        return "市場休息了，換我值班陪你。";
      case "error":
        return "資料有點鬧脾氣，但我沒有。";
      default:
        return "我把聲音放低，陪你慢慢看。";
    }
  }

  switch (status) {
    case "down_alert":
      return "跌幅偏大，先看風險再決定下一步。";
    case "down":
      return "市場偏弱，保持冷靜觀察。";
    case "up_alert":
      return "動能偏強，留意追價風險。";
    case "up":
      return "市場走升，節奏看起來不錯。";
    case "calm":
      return "市場平穩，適合慢慢檢查清單。";
    case "closed":
      return "市場目前休息，可以整理自選股。";
    case "error":
      return "資料來源異常，請稍後再試。";
    default:
      return "安靜模式中，提醒會減少。";
  }
}
