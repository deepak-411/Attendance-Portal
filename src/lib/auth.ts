
"use client";

export const ADMIN_EMAIL = "dk3624897@gmail.com";
export const ADMIN_PASSWORD = "deepak411";
const ADMIN_SESSION_KEY = "holy_writ_admin_auth";

export const VICE_PRINCIPAL_EMAIL = "VP2025";
export const VICE_PRINCIPAL_PASSWORD = "HWS@2025";
const VICE_PRINCIPAL_SESSION_KEY = "holy_writ_vp_auth";


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


export function loginVicePrincipal(email, password) {
  if (email === VICE_PRINCIPAL_EMAIL && password === VICE_PRINCIPAL_PASSWORD) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(VICE_PRINCIPAL_SESSION_KEY, "true");
    }
    return true;
  }
  return false;
}

export function logoutVicePrincipal() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(VICE_PRINCIPAL_SESSION_KEY);
  }
}

export function checkVicePrincipalAuth() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(VICE_PRINCIPAL_SESSION_KEY) === "true";
}
