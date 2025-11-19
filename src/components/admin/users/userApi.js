// src/components/admin/users/userApi.js
import { http } from "@/helpers/http";

// ดึง token จาก auth (จะไม่ใช้แล้ว แต่อยู่เพื่อไม่ให้พังโค้ดเดิม)
export function getAccessToken(auth) {
    return auth?.access_token || auth?.token || null;
}

/**
 * apiRequest แบบ generic รองรับ method เดิม:
 *   apiRequest("/users/", { method: "POST", body: JSON.stringify(payload) }, auth)
 */
export async function apiRequest(path, options = {}, auth) {
    const method = (options.method || "GET").toUpperCase();

    const headers = {
        ...(options.headers || {}),
    };

    // แปลง body ของ fetch → data ของ axios
    let dataToSend = undefined;
    if (options.body !== undefined) {
        if (typeof options.body === "string") {
            try {
                dataToSend = JSON.parse(options.body);
            } catch {
                dataToSend = options.body;
            }
        } else {
            dataToSend = options.body;
        }
    }

    const config = {
        url: path,
        method,
        headers,
        data: dataToSend,
        params: options.params,
    };

    console.log("[userApi] axios →", config);

    try {
        const res = await http.request(config);
        return res.data ?? null;
    } catch (error) {
        console.error("[userApi] HTTP error:", error);

        const res = error.response;
        const data = res?.data;

        let msg = "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้";

        if (res) {
            msg = `HTTP ${res.status}`;
            if (data) {
                if (typeof data === "string") {
                    msg = data;
                } else if (data.detail) {
                    if (typeof data.detail === "string") {
                        msg = data.detail;
                    } else {
                        msg = JSON.stringify(data.detail);
                    }
                } else if (Array.isArray(data) && data.length > 0) {
                    const first = data[0];
                    if (typeof first === "string") msg = first;
                    else if (first.msg) msg = first.msg;
                    else msg = JSON.stringify(data);
                } else {
                    msg = JSON.stringify(data);
                }
            }
        } else if (error.message) {
            msg = error.message;
        }

        const err = new Error(msg);
        err.status = res?.status;
        err.data = data;
        throw err;
    }
}