// src/components/auth/authStorage.js
import {
    clearTokens,
    setAccessToken,
    setRefreshToken,
} from "@/helpers/tokenStorage";

const STORAGE_KEY = "ytrc_portal_auth";

export function saveAuth(auth) {
    try {
        if (!auth) {
            localStorage.removeItem(STORAGE_KEY);
            clearTokens();
            return;
        }

        // เก็บ auth object เต็ม ๆ (user + token ต่าง ๆ)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));

        // ดึง access / refresh จาก response ให้ครอบคลุมหลายรูปแบบ
        const access =
            auth.access_token ||
            auth.token ||
            auth.accessToken ||
            null;

        const refresh =
            auth.refresh_token ||
            auth.refreshToken ||
            auth.token_refresh ||
            null;

        if (access) {
            setAccessToken(access);
        } else {
            setAccessToken(null);
        }

        if (refresh) {
            setRefreshToken(refresh);
        } else {
            setRefreshToken(null);
        }
    } catch {
        // ignore
    }
}

export function loadAuth() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw);

        const access =
            parsed?.access_token ||
            parsed?.token ||
            parsed?.accessToken ||
            null;

        const refresh =
            parsed?.refresh_token ||
            parsed?.refreshToken ||
            parsed?.token_refresh ||
            null;

        if (access) {
            setAccessToken(access);
        }
        if (refresh) {
            setRefreshToken(refresh);
        }

        return parsed;
    } catch {
        return null;
    }
}

export function clearAuth() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // ignore
    }
    clearTokens();
}