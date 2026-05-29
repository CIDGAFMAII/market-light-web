import Link from "next/link";
import { ApiDebugClient } from "@/components/api-debug-client";
import { StatusBadge } from "@/components/status-badge";

export default function ApiDebugPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/dashboard" className="back-link">← 控制台</Link>
          <h1 className="page-title">API 偵錯</h1>
          <p className="page-copy">測試 TWSE、OKX instruments、OKX ticker 與市場聚合 API。</p>
        </div>
        <StatusBadge status="calm" />
      </div>
      <ApiDebugClient />
    </div>
  );
}
