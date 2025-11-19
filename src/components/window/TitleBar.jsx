// src/components/window/TitleBar.jsx
import { window as tauriWindow } from "@tauri-apps/api";
import { useEffect, useMemo, useState } from "react";

/**
 * Custom TitleBar
 * - ใช้ decorations: false ใน tauri.conf.json
 * - เน้นปุ่มแบบ Windows ทางขวา
 * - จุดสามสีซ้ายมือเป็นแค่ decoration จาง ๆ
 */
export default function TitleBar() {
    const [isMaximized, setIsMaximized] = useState(false);

    // รันอยู่ใน Tauri หรือไม่
    const isTauri =
        typeof window !== "undefined" && "__TAURI_IPC__" in window;

    const win = useMemo(
        () => (isTauri ? tauriWindow.getCurrent() : null),
        [isTauri],
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
        if (!win) return;
        try {
            await win.minimize();
        } catch (err) {
            console.error("[TitleBar] minimize error:", err);
        }
    };

    const handleMaximizeToggle = async () => {
        if (!win) return;
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
    };

    const handleClose = async () => {
        if (!win) return;
        try {
            await win.close();
        } catch (err) {
            console.error("[TitleBar] close error:", err);
        }
    };

    return (
        <div
            data-tauri-drag-region
            style={{
                WebkitAppRegion: "drag",
                height: 40,
                paddingInline: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#f3f4f6",               // <-- สีเดียวกับพื้น app
                borderBottom: "1px solid #e5e7eb",
                boxSizing: "border-box",
                userSelect: "none",
            }}
        >
            {/* ซ้าย: จุด macOS (จาง) + ชื่อแอป */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                }}
            >
                {/* จุดสามจุดแบบ mac แต่ใช้สีเทา / จาง ๆ */}
                <div style={{ display: "flex", gap: 4, marginRight: 8 }}>
                    <span
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: "999px",
                            backgroundColor: "#e5e7eb",
                        }}
                    />
                    <span
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: "999px",
                            backgroundColor: "#e5e7eb",
                        }}
                    />
                    <span
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: "999px",
                            backgroundColor: "#e5e7eb",
                        }}
                    />
                </div>

                <span
                    style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#111827",
                    }}
                >
                    YTRC Portal Center
                </span>

                <span
                    style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        marginLeft: 6,
                    }}
                >
                    · Internal systems hub
                </span>
            </div>

            {/* ขวา: ปุ่มแบบ Windows (ของจริง) */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    WebkitAppRegion: "no-drag",   // ให้คลิกปุ่มได้
                }}
            >
                <TitleBarButton
                    label="Minimize"
                    onClick={handleMinimize}
                    symbol="–"
                />
                <TitleBarButton
                    label={isMaximized ? "Restore" : "Maximize"}
                    onClick={handleMaximizeToggle}
                    symbol={isMaximized ? "❐" : "□"}
                />
                <TitleBarButton
                    label="Close"
                    onClick={handleClose}
                    symbol="×"
                    variant="danger"
                />
            </div>
        </div>
    );
}

function TitleBarButton({ label, onClick, symbol, variant = "normal" }) {
    const baseStyle = {
        width: 40,
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        outline: "none",
        cursor: "pointer",
        fontSize: 14,
        backgroundColor: "transparent",
        color: "#111827",
    };

    const normalHover = {
        backgroundColor: "#e5e7eb",
        color: "#111827",
    };

    const dangerHover = {
        backgroundColor: "#ef4444",
        color: "#ffffff",
    };

    return (
        <button
            type="button"
            title={label}
            onClick={onClick}
            style={baseStyle}
            onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, variant === "danger" ? dangerHover : normalHover);
            }}
            onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, {
                    backgroundColor: "transparent",
                    color: "#111827",
                });
            }}
        >
            {symbol}
        </button>
    );
}