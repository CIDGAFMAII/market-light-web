"use client";

import { useEffect, useState } from "react";
import { formatPreviewLines, useDashboardPreview } from "./dashboard-preview-context";
import { OLEDPreview } from "./oled-preview";
import { StatusBadge } from "./status-badge";
import { LoginModal } from "./login-modal";

type DeviceStats = {
  deviceName: string;
  bindStatus: string;
  deviceCode: string;
  lastSeenAt: string;
};

export function DeviceCard() {
  const { selectedPreviewItem, previewWarnings } = useDashboardPreview();
  
  const [deviceInfo, setDeviceInfo] = useState<DeviceStats | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDevice() {
      const userId = window.localStorage.getItem("ml_auth_user_id");
      if (!userId) {
        setIsLoggedIn(false);
        setDeviceInfo(null);
        setLoading(false);
        return;
      }

      try {
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
          setIsLoggedIn(true);
        } else {
          setDeviceInfo(null);
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error("Failed to load device info for card", err);
        setDeviceInfo(null);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    }
    loadDevice();
  }, []);

  function handleLoginSuccess(userId: string) {
    window.localStorage.setItem("ml_auth_user_id", userId);
    window.location.reload();
  }

  function handleLogout() {
    window.localStorage.removeItem("ml_auth_user_id");
    window.location.reload();
  }

  const preview = formatPreviewLines(selectedPreviewItem);
  const oledLines = isLoggedIn
    ? preview
    : {
        line1: "  MARKET LIGHT  ",
        line2: "  UNAUTHORIZED  ",
        line3: " PLEASE LOG IN  ",
        line4: "  [ LOCK MODE ] ",
        status: "error" as const,
      };

  return (
    <div className="space-y-4">
      <div className="soft-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">裝置狀態</h3>
          <StatusBadge status={oledLines.status} />
        </div>
        
        {loading ? (
          <div className="py-4 text-center text-xs text-indigo-300 font-mono">
            正在連線...
          </div>
        ) : isLoggedIn && deviceInfo ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-4"><span className="text-slate-400">名稱</span><span className="text-slate-100">{deviceInfo.deviceName}</span></div>
            <div className="flex justify-between gap-4"><span className="text-slate-400">綁定</span><span className="text-slate-100">{deviceInfo.bindStatus}</span></div>
            <div className="flex justify-between gap-4"><span className="text-slate-400">代碼</span><span className="font-mono text-amber-200">{deviceInfo.deviceCode}</span></div>
            <div className="flex justify-between gap-4"><span className="text-slate-400">最後連線</span><span className="text-slate-100">{deviceInfo.lastSeenAt}</span></div>
          </div>
        ) : (
          <div className="space-y-2 text-sm text-center py-2">
            <div className="text-xs text-slate-400 mb-2">未檢測到登入帳號</div>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="w-full btn-primary py-2 text-xs font-semibold rounded-lg shadow-indigo"
            >
              🔑 帳戶登入
            </button>
          </div>
        )}
      </div>

      <OLEDPreview
        line1={oledLines.line1}
        line2={oledLines.line2}
        line3={oledLines.line3}
        line4={oledLines.line4}
        status={oledLines.status}
      />

      {isLoggedIn && selectedPreviewItem ? (
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
      ) : isLoggedIn ? (
        <div className="soft-card p-3 text-sm text-slate-400">尚無可預覽資料</div>
      ) : null}

      {isLoggedIn && previewWarnings.length > 0 ? (
        <div className="rounded-xl border border-amber-400/25 bg-amber-500/10 p-3 text-xs leading-5 text-amber-200">
          {previewWarnings.join("；")}
        </div>
      ) : null}

      {isLoggedIn ? (
        <button
          onClick={handleLogout}
          className="w-full border border-red-500/40 bg-red-950/20 text-red-300 hover:bg-red-500/20 hover:text-red-100 py-2 text-xs font-semibold rounded-lg transition"
        >
          🚪 登出帳戶
        </button>
      ) : null}

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
