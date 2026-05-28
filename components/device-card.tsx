import { dashboardMock } from "@/lib/demo-data";
import { OLEDPreview } from "./oled-preview";
import { StatusBadge } from "./status-badge";

export function DeviceCard() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[var(--border-cyan)] bg-black/30 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-orbitron text-sm uppercase tracking-[0.22em] text-cyan">裝置狀態</h3>
          <StatusBadge status="calm" />
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-4"><span className="text-muted">名稱</span><span>{dashboardMock.deviceName}</span></div>
          <div className="flex justify-between gap-4"><span className="text-muted">綁定</span><span>{dashboardMock.bindStatus}</span></div>
          <div className="flex justify-between gap-4"><span className="text-muted">代碼</span><span className="text-yellow">{dashboardMock.deviceCode}</span></div>
          <div className="flex justify-between gap-4"><span className="text-muted">最後連線</span><span>{dashboardMock.lastSeenAt}</span></div>
        </div>
      </div>
      <OLEDPreview
        line1="2330 TSMC"
        line2="1075.00 +1.80%"
        line3="(^o^) 成交 13:30"
        line4="更新 8s"
        status="up_alert"
      />
    </div>
  );
}
