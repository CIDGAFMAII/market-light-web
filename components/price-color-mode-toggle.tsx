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
    <div className={`flex flex-wrap items-center gap-1 rounded border border-white/10 bg-black/35 px-2 py-1 text-xs uppercase tracking-[0.12em] text-muted ${className}`}>
      <span className="px-1">{label}</span>
      <button
        type="button"
        onClick={() => onChange("international")}
        className={`rounded px-2 py-1 transition ${
          mode === "international"
            ? "bg-cyan/15 text-cyan"
            : "text-muted hover:bg-white/5 hover:text-cyan"
        }`}
      >
        綠漲紅跌
      </button>
      <button
        type="button"
        onClick={() => onChange("taiwan")}
        className={`rounded px-2 py-1 transition ${
          mode === "taiwan"
            ? "bg-cyan/15 text-cyan"
            : "text-muted hover:bg-white/5 hover:text-cyan"
        }`}
      >
        紅漲綠跌
      </button>
    </div>
  );
}
