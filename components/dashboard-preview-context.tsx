"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { petFaces, type MarketStatus } from "@/lib/market-status";
import type { MarketSource } from "@/lib/market/types";

export type PreviewMarketItem = {
  symbol: string;
  displayName: string;
  price: number;
  changePercent: number;
  status: MarketStatus;
  tradeTime: string;
  source: MarketSource;
  stale?: boolean;
};

type DashboardPreviewContextValue = {
  selectedPreviewItem: PreviewMarketItem | null;
  previewWarnings: string[];
  setSelectedPreviewItem: (item: PreviewMarketItem, warnings?: string[]) => void;
};

const defaultPreviewItem: PreviewMarketItem = {
  symbol: "2330",
  displayName: "TSMC",
  price: 1075,
  changePercent: 1.8,
  status: "up_alert",
  tradeTime: "13:30",
  source: "DEMO",
  stale: false,
};

const DashboardPreviewContext = createContext<DashboardPreviewContextValue | null>(null);

export function DashboardPreviewProvider({ children }: { children: ReactNode }) {
  const [selectedPreviewItem, updateSelectedPreviewItem] = useState<PreviewMarketItem | null>(defaultPreviewItem);
  const [previewWarnings, setPreviewWarnings] = useState<string[]>([]);

  const value = useMemo<DashboardPreviewContextValue>(
    () => ({
      selectedPreviewItem,
      previewWarnings,
      setSelectedPreviewItem: (item, warnings = []) => {
        updateSelectedPreviewItem(item);
        setPreviewWarnings(warnings);
      },
    }),
    [selectedPreviewItem, previewWarnings],
  );

  return <DashboardPreviewContext.Provider value={value}>{children}</DashboardPreviewContext.Provider>;
}

export function useDashboardPreview() {
  const context = useContext(DashboardPreviewContext);

  if (!context) {
    throw new Error("useDashboardPreview must be used inside DashboardPreviewProvider");
  }

  return context;
}

export function formatPreviewLines(item: PreviewMarketItem | null) {
  if (!item) {
    return {
      line1: "尚無可預覽資料",
      line2: "-- --%",
      line3: "(-_-) calm --",
      line4: "NO DATA",
      status: "calm" as MarketStatus,
    };
  }

  const sign = item.changePercent > 0 ? "+" : "";

  return {
    line1: `${item.symbol} ${item.displayName}`,
    line2: `${item.price.toLocaleString()} ${sign}${item.changePercent.toFixed(2)}%`,
    line3: `${petFaces[item.status]} ${item.status} ${item.tradeTime}`,
    line4: `${item.source}${item.stale ? " STALE" : ""}`,
    status: item.status,
  };
}
