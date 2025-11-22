// src/tauri-updater.js
import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";

/**
 * ใช้เช็คว่ามีอัปเดตไหม
 * - ถ้ามี: return update object
 * - ถ้าไม่มี: return null
 */
export async function fetchAvailableUpdate() {
    // กันกรณีรันบนเว็บ (npm run dev) ที่ไม่ใช่ Tauri
    if (typeof window === "undefined" || !window.__TAURI__) {
        console.log("[updater] Not running inside Tauri, skip update check.");
        return null;
    }

    try {
        console.log("[updater] Checking for updates...");
        const update = await check(); // จาก tauri-plugin-updater

        if (!update?.available) {
            console.log("[updater] No updates available.");
            return null;
        }

        console.log("[updater] Update available:", update);
        // update.body = notes จาก latest.json
        // update.version = เวอร์ชันใหม่จาก latest.json
        return update;
    } catch (err) {
        const msg = String(err?.message || err || "");

        // ถ้ายังไม่ได้เปิด permission updater → ไม่ต้องโยน error ออกมาให้รก
        if (msg.includes("updater.check not allowed")) {
            console.warn(
                "[updater] updater.check not allowed – check src-tauri/capabilities/default.json",
                err
            );
            return null;
        }

        console.error("[updater] Failed to check update:", err);
        return null;
    }
}

/**
 * ดาวน์โหลดและติดตั้งอัปเดต แล้ว restart แอป
 */
export async function installUpdate(update) {
    if (!update) return;

    try {
        console.log("[updater] Downloading and installing update...");
        await update.downloadAndInstall();
        console.log("[updater] Update installed. Relaunching app...");
        await relaunch();
    } catch (err) {
        console.error("[updater] Failed to install update:", err);
        throw err;
    }
}