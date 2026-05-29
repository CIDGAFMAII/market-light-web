"use client";

import { OLEDPreview, type OLEDPreviewProps } from "./oled-preview";
import { StatusBadge } from "./status-badge";
import { usePriceColorMode } from "./price-color-mode-toggle";
import type { MarketStatus } from "@/lib/market-status";

export function ColorAwareStatusBadge({ status }: { status: MarketStatus }) {
  const { priceColorMode } = usePriceColorMode();
  return <StatusBadge status={status} colorMode={priceColorMode} />;
}

export function ColorAwareOLEDPreview(props: OLEDPreviewProps) {
  const { priceColorMode } = usePriceColorMode();
  return <OLEDPreview {...props} colorMode={priceColorMode} />;
}
