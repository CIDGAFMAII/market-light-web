"use client";

import { useEffect, useState } from "react";

type UserProfile = {
  id: string;
  displayName: string;
  email: string;
};

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userId: string) => void;
};

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [accountInput, setAccountInput] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    async function fetchUsers() {
      try {
        const usersRes = await fetch("/api/public/users");
        const data = await usersRes.json();
        if (data.success && Array.isArray(data.users)) {
          setUsers(data.users);
        }
      } catch (e) {
        console.error("Failed to load users for login modal", e);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [isOpen]);

  if (!isOpen) return null;

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== "demo1234") {
      setError("密碼錯誤！請使用預設密碼 demo1234");
      return;
    }

    const inputClean = accountInput.trim().toLowerCase();

    // Resolve input to seeded users
    const matchedUser = users.find((u) => {
      const emailClean = u.email.toLowerCase();
      const nameClean = u.displayName.toLowerCase();

      if (emailClean === inputClean) return true;
      if (nameClean === inputClean) return true;

      // Support User1 / User2 aliases
      if (inputClean === "user1" && (emailClean.includes("demo@") || nameClean.includes("user 1"))) return true;
      if (inputClean === "user2" && (emailClean.includes("user2") || nameClean.includes("user 2"))) return true;

      return false;
    });

    if (!matchedUser) {
      setError("帳號不存在！請輸入預設帳戶：User1 或 User2");
      return;
    }

    onLoginSuccess(matchedUser.id);
    onClose();
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

        {loading ? (
          <div className="text-center py-6 text-indigo-300 font-mono text-sm">
            正在加載 Demo 帳號...
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <label className="block text-sm font-semibold text-slate-300">
              使用者帳號 【預設 User1、User2】
              <input
                type="text"
                placeholder="請輸入 User1 或 User2"
                value={accountInput}
                onChange={(e) => setAccountInput(e.target.value)}
                className="field mt-1.5 w-full"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                💡 提示：請輸入 <b>User1</b> 或 <b>User2</b> 以切換對應 Demo 帳戶
              </p>
            </label>

            <label className="block text-sm font-semibold text-slate-300">
              請輸入密碼
              <input
                type="password"
                placeholder="密碼 (預設 demo1234)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field mt-1.5 w-full"
                required
              />
            </label>

            {error ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-200">
                ⚠️ {error}
              </div>
            ) : null}

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="btn border border-slate-700/80 hover:border-slate-500 px-4 py-2 text-sm text-slate-300 rounded-lg hover:text-slate-100 transition"
              >
                取消
              </button>
              <button
                type="submit"
                className="btn-primary px-4 py-2 text-sm"
              >
                確認登入
              </button>
            </div>

            <div className="border-t border-slate-800 pt-3 mt-2 text-center">
              <p className="text-[11px] text-slate-500">
                提示：本專案為 Demo 實作。User1/User2 密碼皆為 <b>demo1234</b>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
