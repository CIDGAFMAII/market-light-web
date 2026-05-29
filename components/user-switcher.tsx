"use client";

import { useEffect, useState } from "react";
import { getActiveUserId, setActiveUserId } from "@/lib/client-auth";
import { LoginModal } from "./login-modal";

type UserProfile = {
  id: string;
  displayName: string | null;
  email: string;
};

export function UserSwitcher() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeUserId, setActiveUserIdState] = useState("");
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/public/users", { cache: "no-store" });
        const data = await res.json();
        if (data.success && Array.isArray(data.users) && data.users.length > 0) {
          setUsers(data.users);

          const storedUserId = getActiveUserId();
          const exists = data.users.some((user: UserProfile) => user.id === storedUserId);
          const nextUserId = exists ? storedUserId : data.users[0].id;

          setActiveUserId(nextUserId);
          setActiveUserIdState(nextUserId);
        }
      } catch (error) {
        console.error("Failed to load users for switcher", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  function handleUserChange(newUserId: string) {
    setActiveUserId(newUserId);
    setActiveUserIdState(newUserId);
    window.location.reload();
  }

  function handleLoginSuccess(userId: string) {
    setActiveUserId(userId);
    setActiveUserIdState(userId);
    setLoginOpen(false);
    window.location.reload();
  }

  const activeUser = users.find((user) => user.id === activeUserId);

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <div className="text-xs font-semibold text-slate-400">目前帳號</div>
          <div className="mt-1 truncate text-sm font-semibold text-indigo-200">
            {loading ? "載入中..." : activeUser?.displayName || activeUser?.email || "未登入"}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setLoginOpen(true)}
          className="rounded-lg border border-indigo-400/35 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-100 transition hover:border-indigo-300 hover:bg-indigo-500/20"
        >
          帳號登入
        </button>
      </div>

      {users.length > 0 ? (
        <label className="block text-xs font-semibold text-slate-400">
          Demo 使用者
          <select
            value={activeUserId}
            onChange={(event) => handleUserChange(event.target.value)}
            className="mt-1 w-full cursor-pointer rounded border border-slate-700/60 bg-slate-900 px-2 py-1 text-xs font-medium text-indigo-300 focus:border-indigo-500 focus:outline-none"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.displayName || user.email}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
