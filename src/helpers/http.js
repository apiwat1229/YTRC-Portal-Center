// src/helpers/http.js
import axios from "axios";
import {
    clearTokens,
    getAccessToken,
    getRefreshToken,
    setAccessToken,
    setRefreshToken,
} from "./tokenStorage";

// -------------------------------------------------------
// เลือก API_BASE ตามลำดับ
// 1) VITE_TAURI_API_BASE_URL (ถ้าตั้งใน .env ของ Tauri)
// 2) VITE_API_BASE_URL       (ชื่อหลักที่ใช้)
// 3) VITE_API_BASE           (กันกรณีเขียนสั้นใน .env.production)
// 4) default = prod API จริง
// -------------------------------------------------------
const API_BASE =
    import.meta.env.VITE_TAURI_API_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_BASE ||
    "https://database-system.ytrc.co.th/api";

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

// ใช้สำหรับทุก request ที่ต้อง Auth
export const http = axios.create({
    baseURL: API_BASE,
    withCredentials: false,
});

// ใช้สำหรับ public / auth endpoint เช่น /auth/login, /auth/refresh
export const httpPlain = axios.create({
    baseURL: API_BASE,
    withCredentials: false,
});

// ---------- Request Interceptor ----------
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

// ---------- Response Interceptor (401 → refresh token) ----------
http.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        // network error จริง ๆ (DNS/TLS/blocked)
        if (!error.response) {
            console.error("[HTTP] network error:", error.message);
            return Promise.reject(error);
        }

        // ไม่ใช่ 401 หรือเคย retry แล้ว
        if (error.response.status !== 401 || original._retry) {
            return Promise.reject(error);
        }

        original._retry = true;

        const currentRefresh = getRefreshToken();
        if (!currentRefresh) {
            clearTokens();
            try {
                window.location.href = "/login";
            } catch {
                /* ignore */
            }
            return Promise.reject(error);
        }

        if (isRefreshing) {
            // มีการ refresh อยู่แล้ว → รอคิว
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
            console.log("[HTTP] 401 → call /auth/refresh ...");

            const res = await httpPlain.post("/auth/refresh", {
                refresh_token: currentRefresh,
            });

            const newAccess = res.data?.access_token;
            const newRefresh = res.data?.refresh_token;

            if (!newAccess || !newRefresh) {
                throw new Error("No tokens from refresh");
            }

            console.log("[HTTP] refresh OK → update tokens");

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
                /* ignore */
            }

            return Promise.reject(refreshErr);
        } finally {
            isRefreshing = false;
        }
    },
);