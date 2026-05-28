import Link from "next/link";
import { StocksSettingsClient } from "@/components/stocks-settings-client";
import { StatusBadge } from "@/components/status-badge";

export default function StocksPage() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 border-b border-cyan/15 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <Link href="/dashboard" className="text-sm uppercase tracking-[0.18em] text-cyan">← 控制台</Link>
          <h1 className="mt-4 font-orbitron text-4xl font-black uppercase text-white">股票設定</h1>
          <p className="mt-3 text-muted">第一階段提供 mock 設定表單，支援 TWSE 測試與 OKX instrument 驗證。</p>
        </div>
        <StatusBadge status="calm" />
      </div>
      <StocksSettingsClient />
    </div>
  );
}
