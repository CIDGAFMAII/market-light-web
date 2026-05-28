"use client";

import { useState } from "react";

type CopyJsonButtonProps = {
  value: unknown;
};

export function CopyJsonButton({ value }: CopyJsonButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded border border-[var(--border-cyan)] px-3 py-2 text-sm uppercase tracking-[0.16em] text-cyan transition hover:bg-cyan/10"
    >
      {copied ? "已複製" : "複製 JSON"}
    </button>
  );
}
