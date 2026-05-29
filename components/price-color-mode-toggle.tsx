"use client";

import { useEffect, useState } from "react";
import {
  defaultPriceColorMode,
  isPriceColorMode,
  priceColorModeChangeEvent,
  priceColorModeStorageKey,
  type PriceColorMode,
} from "@/lib/market/color";

type PriceColorModeToggleProps = {
  mode: PriceColorMode;
  onChange: (mode: PriceColorMode) => void;
  label?: string;
  className?: string;
};

export function usePriceColorMode() {
  const [priceColorMode, setPriceColorModeState] = useState<PriceColorMode>(defaultPriceColorMode);

  useEffect(() => {
    function readSavedMode() {
      const saved = window.localStorage.getItem(priceColorModeStorageKey);
      if (isPriceColorMode(saved)) {
        setPriceColorModeState(saved);
      }
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === priceColorModeStorageKey && isPriceColorMode(event.newValue)) {
        setPriceColorModeState(event.newValue);
      }
    }

    function handleModeChange(event: Event) {
      const nextMode = (event as CustomEvent<PriceColorMode>).detail;
      if (isPriceColorMode(nextMode)) {
        setPriceColorModeState(nextMode);
      }
    }

    readSavedMode();
    window.addEventListener("storage", handleStorage);
    window.addEventListener(priceColorModeChangeEvent, handleModeChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(priceColorModeChangeEvent, handleModeChange);
    };
  }, []);

  function setPriceColorMode(mode: PriceColorMode) {
    setPriceColorModeState(mode);
    window.localStorage.setItem(priceColorModeStorageKey, mode);
    window.dispatchEvent(new CustomEvent(priceColorModeChangeEvent, { detail: mode }));
  }

  return { priceColorMode, setPriceColorMode };
}

export function PriceColorModeToggle({
  mode,
  onChange,
  label = "Color:",
  className = "",
}: PriceColorModeToggleProps) {
  return (
    <div className={`segmented-control ${className}`}>
      <span className="segmented-label">{label}</span>
      <button
        type="button"
        onClick={() => onChange("international")}
        className={`segmented-option ${mode === "international" ? "segmented-option-active" : ""}`}
      >
        綠漲紅跌
      </button>
      <button
        type="button"
        onClick={() => onChange("taiwan")}
        className={`segmented-option ${mode === "taiwan" ? "segmented-option-active" : ""}`}
      >
        紅漲綠跌
      </button>
    </div>
  );
}
