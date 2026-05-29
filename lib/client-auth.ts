"use client";

const storageKey = "ml_auth_user_id";

export function getActiveUserId() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(storageKey) || "";
}

export function setActiveUserId(userId: string) {
  window.localStorage.setItem(storageKey, userId);
  window.dispatchEvent(new CustomEvent("ml-auth-change", { detail: { userId } }));
}

export function authHeaders(extra?: HeadersInit): HeadersInit {
  const userId = getActiveUserId();
  return {
    ...(userId ? { "x-user-id": userId } : {}),
    ...(extra || {}),
  };
}

export function fetchWithAuth(input: RequestInfo | URL, init: RequestInit = {}) {
  return fetch(input, {
    ...init,
    headers: authHeaders(init.headers),
  });
}
