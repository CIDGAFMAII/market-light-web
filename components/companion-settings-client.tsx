"use client";

import { useEffect, useState } from "react";
import { companionMessage, isCompanionMode, type CompanionMode } from "@/lib/companion";
import { petFaces, type MarketStatus } from "@/lib/market-status";
import { StatusBadge } from "./status-badge";
import { TerminalPanel } from "./terminal-panel";

const storageKey = "market-light-companion-mode-v1";
const statuses: MarketStatus[] = ["calm", "up", "up_alert", "down", "down_alert", "closed", "error"];

export function CompanionSettingsClient() {
  const [mode, setMode] = useState<CompanionMode>("normal");
  const [status, setStatus] = useState<MarketStatus>("calm");
  const message = companionMessage(status, mode);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved && isCompanionMode(saved)) {
      setMode(saved);
    }
  }, []);

  function updateMode(nextMode: CompanionMode) {
    setMode(nextMode);
    window.localStorage.setItem(storageKey, nextMode);
  }

  return (
    <div className="grid gap-5">
      <TerminalPanel title="Companion Mode" label={mode.toUpperCase()}>
        <div className="grid gap-3 md:grid-cols-3">
          {(["normal", "flirt", "quiet"] as CompanionMode[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => updateMode(item)}
              className={`rounded border px-4 py-3 text-left transition ${
                mode === item
                  ? "border-[var(--border-cyan)] bg-cyan/10 text-cyan"
                  : "border-white/10 text-muted hover:border-cyan/40 hover:text-cyan"
              }`}
            >
              <span className="block font-orbitron text-sm uppercase tracking-[0.16em]">{item}</span>
              <span className="mt-2 block text-xs">
                {item === "normal" ? "清楚、穩定的市場提醒" : item === "flirt" ? "有點撩、有趣、舒壓" : "低干擾、少說話"}
              </span>
            </button>
          ))}
        </div>
      </TerminalPanel>

      <TerminalPanel title="Message Preview" label="LOCAL">
        <div className="grid gap-5 lg:grid-cols-[260px_1fr] lg:items-center">
          <div className="rounded-lg border border-cyan/20 bg-black/45 p-6 text-center">
            <div className="font-mono text-5xl text-cyan">{petFaces[status]}</div>
            <div className="mt-4 flex justify-center">
              <StatusBadge status={status} />
            </div>
          </div>
          <div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as MarketStatus)}
              className="w-full rounded border border-cyan/20 bg-black/40 px-3 py-2 text-cyan"
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <div className="mt-4 rounded border border-white/10 bg-black/35 p-4 text-lg text-white">
              {message}
            </div>
          </div>
        </div>
      </TerminalPanel>
    </div>
  );
}
