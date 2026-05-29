import Link from "next/link";
import { StocksSettingsClient } from "@/components/stocks-settings-client";
import { StatusBadge } from "@/components/status-badge";

export default function StocksPage() {
  return (
    <div>
      <div className="page-header mb-8">
        <div>
          <Link href="/dashboard" className="back-link">← 控制台</Link>
          <h1 className="page-title mt-4">股票設定</h1>
          <p className="page-copy mt-3">檢查資料來源與資產格式，保持主流程簡潔。</p>
        </div>
        <StatusBadge status="calm" />
      </div>
      <StocksSettingsClient />
    </div>
  );
}
