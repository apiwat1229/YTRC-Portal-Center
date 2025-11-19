// src/components/admin/users/userApi.js

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

// ดึง token จาก auth (รองรับทั้ง access_token / token)
export function getAccessToken(auth) {
    return auth?.access_token || auth?.token || null;
}

export async function apiRequest(path, options = {}, auth) {
    const url = `${API_BASE}${path}`;

    const token = getAccessToken(auth);
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    console.log("[userApi] fetch →", url, { ...options, headers });

    let res;
    try {
        res = await fetch(url, {
            ...options,
            headers,
        });
    } catch (networkErr) {
        console.error("[userApi] network error (fetch failed):", networkErr);
        const err = new Error("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
        err.cause = networkErr;
        throw err;
    }

    // -------- อ่าน response body ให้ละเอียด (text → json) --------
    let rawText = "";
    let data = null;

    try {
        rawText = await res.text();
        if (rawText) {
            try {
                data = JSON.parse(rawText);
            } catch (parseErr) {
                // ไม่ใช่ JSON ก็เก็บเป็น string ตรงๆ
                data = rawText;
            }
        }
    } catch (readErr) {
        console.error("[userApi] error reading response body:", readErr);
    }

    if (!res.ok) {
        console.error("[userApi] HTTP error:", res.status, data);

        let msg = `HTTP ${res.status}`;

        if (data) {
            // กรณี FastAPI แบบมาตรฐาน: {"detail": "..."}
            if (typeof data === "string") {
                msg = data;
            } else if (data.detail) {
                if (typeof data.detail === "string") {
                    msg = data.detail;
                } else {
                    // detail เป็น object/list
                    msg = JSON.stringify(data.detail);
                }
            }
            // กรณี Pydantic validation error: [{"loc": ..., "msg": "...", ...}, ...]
            else if (Array.isArray(data) && data.length > 0) {
                const first = data[0];
                if (typeof first === "string") {
                    msg = first;
                } else if (first.msg) {
                    msg = first.msg;
                } else {
                    msg = JSON.stringify(data);
                }
            } else {
                msg = JSON.stringify(data);
            }
        }

        const err = new Error(msg);
        err.status = res.status;
        err.data = data;
        throw err;
    }

    // ไม่มี body (เช่น 204)
    if (!rawText) {
        return null;
    }

    return data;
}