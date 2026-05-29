"use client";

import { dashboardMock } from "@/lib/demo-data";
import { formatPreviewLines, useDashboardPreview } from "./dashboard-preview-context";
import { OLEDPreview } from "./oled-preview";
import { StatusBadge } from "./status-badge";

export function DeviceCard() {
  const { selectedPreviewItem, previewWarnings } = useDashboardPreview();
  const preview = formatPreviewLines(selectedPreviewItem);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[var(--border-cyan)] bg-black/30 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-orbitron text-sm uppercase tracking-[0.22em] text-cyan">裝置狀態</h3>
          <StatusBadge status={preview.status} />
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-4"><span className="text-muted">名稱</span><span>{dashboardMock.deviceName}</span></div>
          <div className="flex justify-between gap-4"><span className="text-muted">綁定</span><span>{dashboardMock.bindStatus}</span></div>
          <div className="flex justify-between gap-4"><span className="text-muted">代碼</span><span className="text-yellow">{dashboardMock.deviceCode}</span></div>
          <div className="flex justify-between gap-4"><span className="text-muted">最後連線</span><span>{dashboardMock.lastSeenAt}</span></div>
        </div>
      </div>
      <OLEDPreview
        line1={preview.line1}
        line2={preview.line2}
        line3={preview.line3}
        line4={preview.line4}
        status={preview.status}
      />
      {selectedPreviewItem ? (
        <div className="rounded border border-cyan/10 bg-black/30 p-3 text-xs">
          <div className="mb-2 flex flex-wrap gap-2">
            <span className="rounded border border-cyan/35 px-2 py-1 text-cyan">{selectedPreviewItem.source}</span>
            {selectedPreviewItem.stale ? <span className="rounded border border-yellow-400/40 px-2 py-1 text-yellow">STALE</span> : null}
            {selectedPreviewItem.source === "DEMO" ? <span className="rounded border border-gray-500/40 px-2 py-1 text-muted">DEMO</span> : null}
          </div>
          <div className="text-muted">
            {selectedPreviewItem.symbol} / {selectedPreviewItem.displayName} / {selectedPreviewItem.tradeTime}
          </div>
        </div>
      ) : (
        <div className="rounded border border-white/10 bg-black/30 p-3 text-sm text-muted">尚無可預覽資料</div>
      )}
      {previewWarnings.length > 0 ? (
        <div className="rounded border border-yellow-400/35 bg-yellow/10 p-3 text-xs leading-5 text-yellow">
          {previewWarnings.join("；")}
        </div>
      ) : null}
    </div>
  );
}
