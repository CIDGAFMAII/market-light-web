"use client";

import { useEffect, useState } from "react";
import { formatPreviewLines, useDashboardPreview } from "./dashboard-preview-context";
import { OLEDPreview } from "./oled-preview";
import { StatusBadge } from "./status-badge";

type DeviceStats = {
  deviceName: string;
  bindStatus: string;
  deviceCode: string;
  lastSeenAt: string;
};

export function DeviceCard() {
  const { selectedPreviewItem, previewWarnings } = useDashboardPreview();
  const preview = formatPreviewLines(selectedPreviewItem);

  const [deviceInfo, setDeviceInfo] = useState<DeviceStats | null>(null);

  useEffect(() => {
    async function loadDevice() {
      try {
        const userId = window.localStorage.getItem("ml_auth_user_id") || "clx1a2b3c0000qwer1234abcd";
        const res = await fetch("/api/web/dashboard", {
          headers: {
            "x-user-id": userId,
          },
        });
        const data = await res.json();
        if (data.success) {
          setDeviceInfo({
            deviceName: data.deviceName,
            bindStatus: data.bindStatus,
            deviceCode: data.deviceCode,
            lastSeenAt: data.lastSeenAt,
          });
        }
      } catch (err) {
        console.error("Failed to load device info for card", err);
      }
    }
    loadDevice();
  }, []);

  const d = deviceInfo || {
    deviceName: "Market Light",
    bindStatus: "已綁定",
    deviceCode: "ML-ESP32-DEMO",
    lastSeenAt: "無紀錄",
  };

  return (
    <div className="space-y-4">
      <div className="soft-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">裝置狀態</h3>
          <StatusBadge status={preview.status} />
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-4"><span className="text-slate-400">名稱</span><span className="text-slate-100">{d.deviceName}</span></div>
          <div className="flex justify-between gap-4"><span className="text-slate-400">綁定</span><span className="text-slate-100">{d.bindStatus}</span></div>
          <div className="flex justify-between gap-4"><span className="text-slate-400">代碼</span><span className="font-mono text-amber-200">{d.deviceCode}</span></div>
          <div className="flex justify-between gap-4"><span className="text-slate-400">最後連線</span><span className="text-slate-100">{d.lastSeenAt}</span></div>
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
        <div className="soft-card p-3 text-xs">
          <div className="mb-2 flex flex-wrap gap-2">
            <span className="badge border-indigo-400/30 bg-indigo-500/10 text-indigo-200">{selectedPreviewItem.source}</span>
            {selectedPreviewItem.stale ? <span className="badge border-amber-400/30 bg-amber-500/10 text-amber-200">STALE</span> : null}
            {selectedPreviewItem.source === "DEMO" ? <span className="badge border-slate-500/30 bg-slate-800 text-slate-300">DEMO</span> : null}
          </div>
          <div className="text-slate-400">
            {selectedPreviewItem.symbol} / {selectedPreviewItem.displayName} / {selectedPreviewItem.tradeTime}
          </div>
        </div>
      ) : (
        <div className="soft-card p-3 text-sm text-slate-400">尚無可預覽資料</div>
      )}
      {previewWarnings.length > 0 ? (
        <div className="rounded-xl border border-amber-400/25 bg-amber-500/10 p-3 text-xs leading-5 text-amber-200">
          {previewWarnings.join("；")}
        </div>
      ) : null}
    </div>
  );
}
