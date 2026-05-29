"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SettingRow } from "./setting-row";
import { StatusBadge } from "./status-badge";
import { TerminalPanel } from "./terminal-panel";

type DashboardStats = {
  database: string;
  auth: string;
  deviceName: string;
  bindStatus: string;
  deviceCode: string;
  lastSeenAt: string;
  stockCount: number;
  quietMode: string;
  demoMode: string;
  petName: string;
  apiStatus: string;
};

export function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const userId = window.localStorage.getItem("ml_auth_user_id");
      if (!userId) {
        setIsLoggedIn(false);
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
          setStats(data);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center font-mono text-sm text-indigo-300">
        正在載入控制台數據...
      </div>
    );
  }

  if (!isLoggedIn || !stats) {
    return (
      <div>
        <div className="page-header">
          <div>
            <Link href="/" className="back-link">← 首頁</Link>
            <h1 className="page-title">控制台</h1>
            <p className="page-copy">系統設定總覽，目前已啟用遠端 Neon PostgreSQL 資料庫保存設定。</p>
          </div>
          <StatusBadge status="error" />
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 soft-card bg-slate-950/40 border-slate-800/80">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">控制台已被鎖定</h2>
          <p className="text-sm text-slate-400 max-w-sm mb-6">
            此功能需要先登入您的 Demo 帳號以啟用遠端資料庫連線。請點選右側「裝置狀態」面板中的 <b>🔑 帳戶登入</b>。
          </p>
        </div>
      </div>
    );
  }

  const d = stats;

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/" className="back-link">← 首頁</Link>
          <h1 className="page-title">控制台</h1>
          <p className="page-copy">系統設定總覽，目前已啟用遠端 Neon PostgreSQL 資料庫保存設定。</p>
        </div>
        <StatusBadge status="calm" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <TerminalPanel title="總覽" label="裝置">
          <SettingRow label="裝置名稱" value={d.deviceName} />
          <SettingRow label="綁定狀態" value={d.bindStatus} />
          <SettingRow label="裝置代碼" value={d.deviceCode} />
          <SettingRow label="最後連線" value={d.lastSeenAt} />
          <SettingRow label="股票數量" value={d.stockCount.toString()} />
        </TerminalPanel>

        <TerminalPanel title="執行狀態" label="模擬">
          <SettingRow label="安靜模式" value={d.quietMode} hint="暫停主動提醒行為。" />
          <SettingRow label="展示模式" value={d.demoMode} hint="只使用本機模擬資料。" />
          <SettingRow label="小助手名稱" value={d.petName} />
          <SettingRow label="API 狀態" value={d.apiStatus} />
        </TerminalPanel>

        <TerminalPanel title="API 偵錯" label="PING" className="xl:col-span-2">
          <pre className="code-block">
            {JSON.stringify(
              {
                phase: 2,
                providers: ["TWSE", "OKX", "DEMO"],
                database: d.database,
                auth: d.auth,
                esp32Firmware: "已產生",
                apiStatus: d.apiStatus,
                deviceId: d.deviceCode,
              },
              null,
              2,
            )}
          </pre>
        </TerminalPanel>
      </div>
    </div>
  );
}
