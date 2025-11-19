// src/components/auth/authStorage.js
import { clearTokens, setAccessToken } from "@/helpers/tokenStorage";

const STORAGE_KEY = "ytrc_portal_auth";

export function saveAuth(auth) {
    try {
        if (!auth) {
            localStorage.removeItem(STORAGE_KEY);
            clearTokens();
            return;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));

        const token = auth.access_token || auth.token || null;
        if (token) {
            setAccessToken(token);
        }
    } catch { }
}

export function loadAuth() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw);

        const token = parsed?.access_token || parsed?.token;
        if (token) {
            setAccessToken(token);
        }

        return parsed;
    } catch {
        return null;
    }
}

export function clearAuth() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch { }
    clearTokens();
}