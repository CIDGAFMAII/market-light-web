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
              className={`rounded-xl border px-4 py-3 text-left transition duration-200 hover:-translate-y-0.5 ${
                mode === item
                  ? "border-indigo-400/45 bg-indigo-500/15 text-indigo-100 shadow-indigo"
                  : "border-slate-700/70 bg-slate-950/75 text-slate-300 hover:border-slate-500 hover:bg-slate-900/90 hover:text-slate-50"
              }`}
            >
              <span className="block text-sm font-semibold capitalize">{item}</span>
              <span className="mt-2 block text-xs leading-5">
                {item === "normal" ? "清楚、穩定的市場提醒" : item === "flirt" ? "有點撩、有趣、舒壓" : "低干擾、少說話"}
              </span>
            </button>
          ))}
        </div>
      </TerminalPanel>

      <TerminalPanel title="Message Preview" label="LOCAL">
        <div className="grid gap-5 lg:grid-cols-[260px_1fr] lg:items-center">
          <div className="soft-card p-6 text-center">
            <div className="font-mono text-5xl text-indigo-200">{petFaces[status]}</div>
            <div className="mt-4 flex justify-center">
              <StatusBadge status={status} />
            </div>
          </div>
          <div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as MarketStatus)}
              className="field w-full"
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-900/80 p-4 text-lg font-medium text-slate-100">
              {message}
            </div>
          </div>
        </div>
      </TerminalPanel>
    </div>
  );
}
