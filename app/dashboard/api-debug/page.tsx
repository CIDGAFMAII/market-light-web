import Link from "next/link";
import { ApiDebugClient } from "@/components/api-debug-client";
import { StatusBadge } from "@/components/status-badge";

export default function ApiDebugPage() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 border-b border-cyan/15 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <Link href="/dashboard" className="text-sm uppercase tracking-[0.18em] text-cyan">← 控制台</Link>
          <h1 className="mt-4 font-orbitron text-4xl font-black uppercase text-white">API 偵錯</h1>
          <p className="mt-3 text-muted">測試 TWSE、OKX instruments、OKX ticker 與市場聚合 API。</p>
        </div>
        <StatusBadge status="calm" />
      </div>
      <ApiDebugClient />
    </div>
  );
}
