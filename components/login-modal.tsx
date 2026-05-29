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
  const [selectedUserId, setSelectedUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    async function fetchUsers() {
      try {
        const res = await fetch("/api/public/users");
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          setUsers(data.users);
          if (data.users.length > 0) {
            setSelectedUserId(data.users[0].id);
          }
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

    onLoginSuccess(selectedUserId);
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
              選擇帳號
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="field mt-1.5 w-full cursor-pointer"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.displayName} ({u.email})
                  </option>
                ))}
              </select>
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
