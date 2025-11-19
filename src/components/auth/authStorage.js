// src/auth/authStorage.js

const STORAGE_KEY = "ytrc_portal_auth";

/**
 * อ่าน auth จาก localStorage
 * return: { access_token, refresh_token, user, token_type } | null
 */
export function loadAuth() {
    if (typeof window === "undefined") return null;

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        const data = JSON.parse(raw);

        // เช็คโครงคร่าว ๆ กันของเสีย
        if (!data || typeof data !== "object") return null;
        if (!data.access_token || !data.user) return null;

        return data;
    } catch (err) {
        console.error("[authStorage] loadAuth error:", err);
        return null;
    }
}

/**
 * บันทึก auth ลง localStorage
 */
export function saveAuth(auth) {
    if (typeof window === "undefined") return;

    try {
        if (!auth) {
            window.localStorage.removeItem(STORAGE_KEY);
            return;
        }
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } catch (err) {
        console.error("[authStorage] saveAuth error:", err);
    }
}

/**
 * ล้าง auth ทิ้งจาก localStorage
 */
export function clearAuth() {
    if (typeof window === "undefined") return;

    try {
        window.localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
        console.error("[authStorage] clearAuth error:", err);
    }
}