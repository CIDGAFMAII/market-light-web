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
          <p className="page-copy mt-3">網站文案沙盒；ESP32 最終三鍵 Flirt Mode 以 /demo 規格為準。</p>
        </div>
        <StatusBadge status="calm" />
      </div>
      <CompanionSettingsClient />
    </div>
  );
}
