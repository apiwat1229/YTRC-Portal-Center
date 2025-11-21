// src/helpers/http.js
import axios from "axios";
import {
    clearTokens,
    getAccessToken,
    getRefreshToken,
    setAccessToken,
    setRefreshToken,
} from "./tokenStorage";

// รองรับทั้ง VITE_TAURI_API_BASE_URL, VITE_API_BASE_URL, VITE_API_BASE
// และ fallback ไปที่ production API เสมอ
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

export const http = axios.create({
    baseURL: API_BASE,
    withCredentials: false,
});

export const httpPlain = axios.create({
    baseURL: API_BASE,
    withCredentials: false,
});

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

http.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        // ถ้าเป็น network error จริง ๆ (server ไม่ตอบ / TLS / DNS) → โยนต่อเลย
        if (!error.response) {
            return Promise.reject(error);
        }

        // ถ้าไม่ใช่ 401 หรือเคย retry ไปแล้ว → โยนต่อ
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
                // ignore
            }
            return Promise.reject(error);
        }

        // ถ้ามีการ refresh อยู่แล้ว → รอคิว
        if (isRefreshing) {
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
            console.log("[HTTP] 401 → refresh ...");
            const res = await httpPlain.post("/auth/refresh", {
                refresh_token: currentRefresh,
            });

            const newAccess = res.data?.access_token;
            const newRefresh = res.data?.refresh_token;

            if (!newAccess || !newRefresh) {
                throw new Error("No tokens from refresh");
            }

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