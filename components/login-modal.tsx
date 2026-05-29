"use client";

import { useState } from "react";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userId: string, displayName: string) => void;
};

const demoUsers = [
  { alias: "User1", label: "Demo User 1", tone: "indigo" },
  { alias: "User2", label: "Demo User 2", tone: "cyan" },
] as const;

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [accountInput, setAccountInput] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  async function submitLogin(account: string, nextPassword: string) {
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/public/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account, password: nextPassword }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.user) {
        onLoginSuccess(data.user.id, data.user.displayName || data.user.email);
      } else {
        setError(data.message || "登入失敗");
      }
    } catch {
      setError("登入 API 呼叫失敗，請確認伺服器與 Neon 資料庫連線");
    } finally {
      setSubmitting(false);
    }
  }

  function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    void submitLogin(accountInput, password);
  }

  function quickLogin(alias: string) {
    setAccountInput(alias);
    setPassword("demo1234");
    void submitLogin(alias, "demo1234");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/60 bg-slate-900/95 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100">帳號登入</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-lg font-bold text-slate-400 transition hover:text-slate-100"
            aria-label="關閉登入視窗"
          >
            &times;
          </button>
        </div>

        <div className="mb-5 rounded-xl border border-indigo-500/25 bg-indigo-500/5 p-3.5">
          <p className="mb-2.5 text-xs font-semibold text-indigo-300">Demo 快速切換</p>
          <div className="flex gap-2">
            {demoUsers.map((user) => (
              <button
                key={user.alias}
                type="button"
                disabled={submitting}
                onClick={() => quickLogin(user.alias)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${
                  user.tone === "indigo"
                    ? "border-indigo-500/30 bg-indigo-600/20 text-indigo-200 hover:bg-indigo-600/40 hover:text-white"
                    : "border-cyan-500/30 bg-cyan-600/20 text-cyan-200 hover:bg-cyan-600/40 hover:text-white"
                }`}
              >
                {user.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex-1 border-t border-slate-700/60" />
          <span className="text-[11px] text-slate-500">或手動登入</span>
          <div className="flex-1 border-t border-slate-700/60" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <label className="block text-sm font-semibold text-slate-300">
            帳號
            <input
              type="text"
              placeholder="User1、User2 或 Email"
              value={accountInput}
              onChange={(event) => setAccountInput(event.target.value)}
              className="field mt-1.5 w-full"
              required
              disabled={submitting}
            />
          </label>

          <label className="block text-sm font-semibold text-slate-300">
            密碼
            <input
              type="password"
              placeholder="Demo 密碼 demo1234"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field mt-1.5 w-full"
              required
              disabled={submitting}
            />
          </label>

          {error ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-200">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700/80 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
              disabled={submitting}
            >
              取消
            </button>
            <button type="submit" className="btn-primary px-4 py-2 text-sm" disabled={submitting}>
              {submitting ? "登入中..." : "登入"}
            </button>
          </div>
        </form>

        <p className="mt-4 border-t border-slate-800 pt-3 text-center text-[11px] text-slate-500">
          Demo 帳號：User1 / User2，密碼：<b>demo1234</b>
        </p>
      </div>
    </div>
  );
}
