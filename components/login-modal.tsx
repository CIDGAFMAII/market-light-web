"use client";

import { useState } from "react";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userId: string) => void;
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account: accountInput,
          password: password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        onLoginSuccess(data.user.id);
        onClose();
      } else {
        setError(data.message || "登入失敗，請稍後再試。");
      }
    } catch (err) {
      console.error("Login verification failed:", err);
      setError("無法連線至伺服器，請檢查網路或資料庫設定。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/60 bg-slate-900/95 p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            🔑 帳戶登入 (Demo Switcher)
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 font-bold transition text-lg p-1"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <label className="block text-sm font-semibold text-slate-300">
            使用者帳號 【預設 User1、User2】
            <input
              type="text"
              placeholder="請輸入 User1 或 User2"
              value={accountInput}
              onChange={(e) => setAccountInput(e.target.value)}
              className="field mt-1.5 w-full text-slate-100 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2.5 outline-none transition"
              required
              disabled={submitting}
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              💡 提示：請輸入 <b>User1</b> 或 <b>User2</b> 以切換對應 Demo 帳戶
            </p>
          </label>

          <label className="block text-sm font-semibold text-slate-300">
            請輸入密碼
            <input
              type="text"
              placeholder="密碼 (預設 demo1234)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field mt-1.5 w-full text-slate-100 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2.5 outline-none transition"
              required
              disabled={submitting}
            />
          </label>

          {error ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-200">
              ⚠️ {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-3 mt-6">
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
              className="btn-primary px-4 py-2 text-sm font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 transition"
              disabled={submitting}
            >
              {submitting ? "正在驗證..." : "確認登入"}
            </button>
          </div>

          <div className="border-t border-slate-800 pt-3 mt-2 text-center">
            <p className="text-[11px] text-slate-500">
              提示：本專案為 Demo 實作。User1/User2 密碼皆為 <b>demo1234</b>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
