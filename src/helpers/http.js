// src/helpers/http.js
import axios from "axios";
import {
    clearTokens,
    getAccessToken,
    getRefreshToken,
    setAccessToken,
    setRefreshToken,
} from "./tokenStorage";

const API_BASE =
    import.meta.env.VITE_TAURI_API_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8110/api";

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

// ใช้ตัวนี้สำหรับทุก request ที่ต้อง login
export const http = axios.create({
    baseURL: API_BASE,
    withCredentials: false, // ❗ เราไม่ใช้ cookie แล้ว
});

// ใช้ตัวนี้สำหรับ public / auth endpoint เช่น /auth/login, /auth/refresh
export const httpPlain = axios.create({
    baseURL: API_BASE,
    withCredentials: false, // ❗ เช่นกัน
});

// ---------- Request Interceptor: แนบ access token ----------
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

// ---------- Response Interceptor: ถ้า 401 → refresh token ----------
http.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        if (!error.response) {
            // network error จริง ๆ (server ไม่ตอบ, DNS, TLS ฯลฯ)
            return Promise.reject(error);
        }

        // ถ้าไม่ใช่ 401 หรือเคย retry ไปแล้ว
        if (error.response.status !== 401 || original._retry) {
            return Promise.reject(error);
        }

        original._retry = true;

        const currentRefresh = getRefreshToken();
        if (!currentRefresh) {
            // ไม่มี refresh token ให้ใช้แล้ว → เคลียร์ session
            clearTokens();
            try {
                window.location.href = "/login";
            } catch {
                // ignore
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
            console.log("[HTTP] 401 → calling /auth/refresh ...");

            // 🔑 ส่ง refresh_token ตาม schema ใน BE
            const res = await httpPlain.post("/auth/refresh", {
                refresh_token: currentRefresh,
            });

            const newAccess = res.data?.access_token;
            const newRefresh = res.data?.refresh_token;

            if (!newAccess || !newRefresh) {
                throw new Error("No tokens from refresh");
            }

            console.log("[HTTP] refresh ok, update access & refresh token");

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