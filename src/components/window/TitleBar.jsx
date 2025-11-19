// src/components/window/TitleBar.jsx
import { window as tauriWindow } from "@tauri-apps/api";
import { useEffect, useMemo, useState } from "react";

export default function TitleBar() {
    const [isMaximized, setIsMaximized] = useState(false);

    // อยู่ใน Tauri ไหม
    const isTauri =
        typeof window !== "undefined" && "__TAURI_IPC__" in window;

    // window ปัจจุบัน (ถ้ามี Tauri)
    const win = useMemo(
        () => (isTauri ? tauriWindow.getCurrent() : null),
        [isTauri]
    );

    useEffect(() => {
        if (!win) return;

        (async () => {
            try {
                const max = await win.isMaximized();
                setIsMaximized(max);
            } catch (err) {
                console.warn("[TitleBar] isMaximized error:", err);
            }
        })();
    }, [win]);

    const handleMinimize = async () => {
        if (win) {
            try {
                await win.minimize();
            } catch (err) {
                console.error("[TitleBar] minimize error:", err);
            }
        } else {
            console.log("[TitleBar] minimize (no tauri)");
        }
    };

    const handleMaximizeToggle = async () => {
        if (win) {
            try {
                const max = await win.isMaximized();
                if (max) {
                    await win.unmaximize();
                    setIsMaximized(false);
                } else {
                    await win.maximize();
                    setIsMaximized(true);
                }
            } catch (err) {
                console.error("[TitleBar] maximize toggle error:", err);
            }
        } else {
            console.log("[TitleBar] maximize (no tauri)");
        }
    };

    const handleClose = async () => {
        if (win) {
            try {
                await win.close();
            } catch (err) {
                console.error("[TitleBar] close error:", err);
            }
        } else {
            // ใช้ตอนรันใน browser เฉย ๆ
            console.log("[TitleBar] close (no tauri)");
            window.close?.();
        }
    };

    return (
        <div
            data-tauri-drag-region={isTauri ? "" : undefined}
            style={{
                WebkitAppRegion: isTauri ? "drag" : "auto",
                height: 40,
                padding: "0 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#f9fafb",
                borderBottom: "1px solid rgba(226, 232, 240, 1)",
                fontSize: 12,
                color: "#111827",
                userSelect: "none",
                boxSizing: "border-box",
            }}
        >
            {/* ซ้าย: ชื่อแอป */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    minWidth: 0,
                }}
            >
                <span
                    style={{
                        fontWeight: 600,
                        fontSize: 13,
                    }}
                >
                    YTRC Portal Center
                </span>

                <span
                    style={{
                        fontSize: 11,
                        color: "#6b7280",
                        marginLeft: 6,
                    }}
                >
                    · Internal systems hub
                </span>
            </div>

            {/* ขวา: ปุ่ม window controls */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    WebkitAppRegion: "no-drag",
                }}
            >
                <TitleBarButton
                    label="Minimize"
                    onClick={handleMinimize}
                    icon="▁"
                />
                <TitleBarButton
                    label={isMaximized ? "Restore" : "Maximize"}
                    onClick={handleMaximizeToggle}
                    icon={isMaximized ? "🗗" : "🗖"}
                />
                <TitleBarButton
                    label="Close"
                    onClick={handleClose}
                    variant="danger"
                    icon="✕"
                />
            </div>
        </div>
    );
}

function TitleBarButton({ label, onClick, icon, variant = "normal" }) {
    const baseStyle = {
        width: 30,
        height: 22,
        borderRadius: 6,
        border: "1px solid rgba(209, 213, 219, 0.8)",
        backgroundColor: "rgba(249, 250, 251, 0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        cursor: "pointer",
        padding: 0,
        outline: "none",
    };

    const dangerStyle =
        variant === "danger"
            ? {
                borderColor: "rgba(248, 113, 113, 0.9)",
                backgroundColor: "rgba(248, 113, 113, 0.1)",
                color: "#b91c1c",
            }
            : {};

    return (
        <button
            type="button"
            onClick={onClick}
            title={label}
            style={{
                ...baseStyle,
                ...dangerStyle,
            }}
        >
            <span>{icon}</span>
        </button>
    );
}