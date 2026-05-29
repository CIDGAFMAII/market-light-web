import Link from "next/link";
import { CompanionSettingsClient } from "@/components/companion-settings-client";
import { StatusBadge } from "@/components/status-badge";

export default function CompanionPage() {
  return (
    <div>
      <div className="page-header mb-8">
        <div>
          <Link href="/dashboard" className="back-link">← 控制台</Link>
          <h1 className="page-title mt-4">Companion Mode</h1>
          <p className="page-copy mt-3">設定小助手語氣，維持提醒清楚、輕量且不打擾。</p>
        </div>
        <StatusBadge status="calm" />
      </div>
      <CompanionSettingsClient />
    </div>
  );
}
