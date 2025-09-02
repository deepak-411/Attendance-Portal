"use client";

export const ADMIN_EMAIL = "dk3624897@gmail.com";
export const ADMIN_PASSWORD = "deepak411";
const ADMIN_SESSION_KEY = "holy_writ_admin_auth";

export function loginAdmin(email, password) {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    }
    return true;
  }
  return false;
}

export function logoutAdmin() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  }
}

export function checkAdminAuth() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}
