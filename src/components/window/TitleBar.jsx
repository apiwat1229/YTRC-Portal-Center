// src/components/window/TitleBar.jsx
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useState } from "react";

export default function TitleBar() {
    const win = getCurrentWindow();
    const [isMax, setIsMax] = useState(false);

    useEffect(() => {
        win.isMaximized().then(setIsMax);
    }, []);

    const minimize = () => win.minimize();
    const toggleMax = async () => {
        const max = await win.isMaximized();
        max ? win.unmaximize() : win.maximize();
        setIsMax(!max);
    };
    const close = () => win.close(); // ปิดได้จริง 100%

    return (
        <div
            data-tauri-drag-region
            style={{
                height: 42,
                padding: "0 12px",
                background: "#f3f4f6",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                WebkitUserSelect: "none",
            }}
        >
            {/* ---- Left empty (no mac buttons) ---- */}
            <div style={{ width: 120 }} />

            {/* ---- Title ---- */}
            <div
                style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#111827",
                    userSelect: "none",
                    pointerEvents: "none",
                }}
            >
                YTRC Portal Center
            </div>

            {/* ---- Windows-style buttons ---- */}
            <div style={{ display: "flex", WebkitAppRegion: "no-drag" }}>
                <WinButton onClick={minimize}>—</WinButton>

                <WinButton onClick={toggleMax}>{isMax ? "❐" : "□"}</WinButton>

                <WinButton variant="danger" onClick={close}>✕</WinButton>
            </div>
        </div>
    );
}

function WinButton({ children, onClick, variant }) {
    return (
        <button
            onClick={onClick}
            style={{
                width: 46,
                height: 32,
                border: "none",
                background: "transparent",
                fontSize: 14,
                cursor: "pointer",
                color: variant === "danger" ? "#b91c1c" : "#111827",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background =
                    variant === "danger" ? "#ef4444" : "#e5e7eb";
                e.currentTarget.style.color = variant === "danger" ? "#fff" : "#111827";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color =
                    variant === "danger" ? "#b91c1c" : "#111827";
            }}
        >
            {children}
        </button>
    );
}