import Link from "next/link";
import { CompanionSettingsClient } from "@/components/companion-settings-client";
import { StatusBadge } from "@/components/status-badge";

export default function CompanionPage() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 border-b border-cyan/15 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <Link href="/dashboard" className="text-sm uppercase tracking-[0.18em] text-cyan">← 控制台</Link>
          <h1 className="mt-4 font-orbitron text-4xl font-black uppercase text-white">Companion Mode</h1>
          <p className="mt-3 text-muted">設定小助手語氣，設定值保存在 localStorage。</p>
        </div>
        <StatusBadge status="calm" />
      </div>
      <CompanionSettingsClient />
    </div>
  );
}
