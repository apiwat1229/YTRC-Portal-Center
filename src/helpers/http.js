// src/helpers/http.js
import axios from "axios";
import {
    clearTokens,
    getAccessToken,
    getRefreshToken,
    setAccessToken,
    setRefreshToken,
} from "./tokenStorage";

// =======================
// CONFIG: API BASE
// =======================
const API_BASE =
    import.meta.env.VITE_TAURI_API_BASE_URL || // ถ้าอยาก override สำหรับ Tauri เฉพาะ
    import.meta.env.VITE_API_BASE_URL ||       // จาก .env / .env.production
    "https://database-system.ytrc.co.th/api";  // fallback สุดท้าย

console.log("[HTTP] API_BASE =", API_BASE);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

// =======================
// axios instances
// =======================
export const http = axios.create({
    baseURL: API_BASE,
    withCredentials: false,
});

export const httpPlain = axios.create({
    baseURL: API_BASE,
    withCredentials: false,
});

// =======================
// Request interceptor
// =======================
http.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// =======================
// Response interceptor (401 → refresh)
// =======================
http.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        // ถ้าไม่มี response เลย → network error จริง ๆ
        if (!error.response) {
            console.error("[HTTP] NETWORK ERROR:", error.message);
            return Promise.reject(error);
        }

        // ไม่ใช่ 401 หรือเคย retry ไปแล้ว
        if (error.response.status !== 401 || original._retry) {
            return Promise.reject(error);
        }

        original._retry = true;

        const currentRefresh = getRefreshToken();
        if (!currentRefresh) {
            console.warn("[HTTP] 401 แต่ไม่มี refresh token → logout");
            clearTokens();
            try {
                window.location.href = "/login";
            } catch {
                // ignore
            }
            return Promise.reject(error);
        }

        if (isRefreshing) {
            // ระหว่างกำลัง refresh อยู่ → ต่อคิวรอ
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then((token) => {
                    if (token) {
                        original.headers.Authorization = `Bearer ${token}`;
                    }
                    return http(original);
                })
                .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        try {
            console.log("[HTTP] 401 → POST /auth/refresh ...");

            const res = await httpPlain.post("/auth/refresh", {
                refresh_token: currentRefresh,
            });

            const newAccess = res.data?.access_token;
            const newRefresh = res.data?.refresh_token;

            if (!newAccess || !newRefresh) {
                throw new Error("No tokens from refresh");
            }

            console.log("[HTTP] refresh ok → set new tokens");

            setAccessToken(newAccess);
            setRefreshToken(newRefresh);
            http.defaults.headers.Authorization = `Bearer ${newAccess}`;

            processQueue(null, newAccess);

            original.headers.Authorization = `Bearer ${newAccess}`;
            return http(original);
        } catch (refreshErr) {
            console.error("[HTTP] refresh failed:", refreshErr);

            processQueue(refreshErr, null);
            clearTokens();

            try {
                window.location.href = "/login";
            } catch {
                // ignore
            }

            return Promise.reject(refreshErr);
        } finally {
            isRefreshing = false;
        }
    },
);