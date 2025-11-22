// src/tauri-updater.js
import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";

/**
 * ตรวจว่าโค้ดกำลังรันอยู่ใน Tauri หรือไม่
 */
export function isTauriEnv() {
    return (
        typeof window !== "undefined" &&
        // Tauri v2 จะมีตัวนี้เสมอใน window
        "__TAURI_INTERNALS__" in window
    );
}

/**
 * ใช้เช็คว่ามีอัปเดตไหม
 * - ถ้ามี: return update object
 * - ถ้าไม่มี: return null
 */
export async function fetchAvailableUpdate() {
    try {
        if (!isTauriEnv()) {
            console.log("[updater] Not running inside Tauri, skip update check.");
            return null;
        }

        console.log("[updater] Checking for updates...");
        const update = await check();

        if (!update?.available) {
            console.log("[updater] No updates available.");
            return null;
        }

        console.log("[updater] Update available:", update);
        return update;
    } catch (err) {
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