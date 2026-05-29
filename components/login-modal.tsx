"use client";

import { useState } from "react";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userId: string, displayName: string) => void;
};

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [accountInput, setAccountInput] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/public/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: accountInput, password }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.user) {
        onLoginSuccess(data.user.id, data.user.displayName || data.user.email);
      } else {
        setError(data.message || "登入失敗");
      }
    } catch {
      setError("無法連線至伺服器，請檢查網路或資料庫連線。");
    } finally {
      setSubmitting(false);
    }
  }

  /** Quick demo switch: auto-fill and submit */
  async function quickLogin(alias: string) {
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: alias, password: "demo1234" }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        onLoginSuccess(data.user.id, data.user.displayName || data.user.email);
      } else {
        setError(data.message || "快速切換失敗");
      }
    } catch {
      setError("無法連線至伺服器");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/60 bg-slate-900/95 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            🔑 帳戶登入
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 font-bold transition text-lg p-1"
          >
            &times;
          </button>
        </div>

        {/* Demo Quick Switch */}
        <div className="mb-5 rounded-xl border border-indigo-500/25 bg-indigo-500/5 p-3.5">
          <p className="text-xs font-semibold text-indigo-300 mb-2.5">⚡ Demo 快速切換</p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => quickLogin("User1")}
              className="flex-1 rounded-lg border border-indigo-500/30 bg-indigo-600/20 px-3 py-2 text-sm font-medium text-indigo-200 hover:bg-indigo-600/40 hover:text-white transition disabled:opacity-50"
            >
              👤 Demo User 1
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => quickLogin("User2")}
              className="flex-1 rounded-lg border border-cyan-500/30 bg-cyan-600/20 px-3 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-600/40 hover:text-white transition disabled:opacity-50"
            >
              👤 Demo User 2
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 border-t border-slate-700/60"></div>
          <span className="text-[11px] text-slate-500">或手動輸入帳號密碼</span>
          <div className="flex-1 border-t border-slate-700/60"></div>
        </div>

        {/* Manual Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <label className="block text-sm font-semibold text-slate-300">
            使用者帳號
            <input
              type="text"
              placeholder="輸入 User1、User2 或 Email"
              value={accountInput}
              onChange={(e) => setAccountInput(e.target.value)}
              className="field mt-1.5 w-full"
              required
              disabled={submitting}
            />
          </label>

          <label className="block text-sm font-semibold text-slate-300">
            密碼
            <input
              type="text"
              placeholder="預設密碼 demo1234"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field mt-1.5 w-full"
              required
              disabled={submitting}
            />
          </label>

          {error ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-200">
              ⚠️ {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn border border-slate-700/80 hover:border-slate-500 px-4 py-2 text-sm text-slate-300 rounded-lg hover:text-slate-100 transition"
              disabled={submitting}
            >
              取消
            </button>
            <button
              type="submit"
              className="btn-primary px-4 py-2 text-sm"
              disabled={submitting}
            >
              {submitting ? "驗證中..." : "確認登入"}
            </button>
          </div>
        </form>

        <div className="border-t border-slate-800 pt-3 mt-4 text-center">
          <p className="text-[11px] text-slate-500">
            本專案為 Demo 實作。User1 / User2 密碼皆為 <b>demo1234</b>
          </p>
        </div>
      </div>
    </div>
  );
}
