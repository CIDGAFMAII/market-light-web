"use client";

import { useEffect, useState } from "react";

type UserProfile = {
  id: string;
  displayName: string;
  email: string;
};

export function UserSwitcher() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeUserId, setActiveUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/public/users");
        const data = await res.json();
        if (data.success && Array.isArray(data.users) && data.users.length > 0) {
          setUsers(data.users);
          
          const storedUserId = window.localStorage.getItem("ml_auth_user_id");
          const exists = data.users.some((u: UserProfile) => u.id === storedUserId);
          
          if (storedUserId && exists) {
            setActiveUserId(storedUserId);
          } else {
            const defaultId = data.users[0].id;
            window.localStorage.setItem("ml_auth_user_id", defaultId);
            setActiveUserId(defaultId);
          }
        }
      } catch (e) {
        console.error("Failed to load users for switcher", e);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  function handleUserChange(newUserId: string) {
    window.localStorage.setItem("ml_auth_user_id", newUserId);
    setActiveUserId(newUserId);
    window.location.reload();
  }

  if (loading || users.length === 0) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-center text-xs text-slate-500">
        正在載入帳號...
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3">
      <label className="block text-xs font-semibold text-slate-400 mb-1">
        切換展示帳號
      </label>
      <select
        value={activeUserId}
        onChange={(e) => handleUserChange(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700/60 rounded px-2 py-1 text-xs text-indigo-300 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.displayName || u.email}
          </option>
        ))}
      </select>
    </div>
  );
}
