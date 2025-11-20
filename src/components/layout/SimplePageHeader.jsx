// src/components/layout/SimplePageHeader.jsx
import { ActionIcon, Box, Group, Text } from "@mantine/core";
import { IconMinus, IconSquare, IconX } from "@tabler/icons-react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useEffect, useRef } from "react";

// helper เช็คว่า run อยู่ใน Tauri จริงหรือเปล่า
function isTauri() {
    return typeof window !== "undefined" && "__TAURI__" in window;
}

export default function SimplePageHeader({
    title,
    subtitle = null,
    icon: Icon,
    iconSize = 20,
    iconColor = "#334155",

    // ถ้าอยาก override พฤติกรรมปุ่ม สามารถส่ง prop เข้ามาได้
    onMinimize,
    onMaximize,
    onClose,

    glass = true,
    opacity = 0.35,
    compact = false,
}) {
    const headerHeight = compact ? 44 : 60;
    const titleSize = compact ? "md" : "lg";
    const iconAdjustedSize = compact ? iconSize - 4 : iconSize;

    // เก็บ instance ของ window ปัจจุบัน
    const winRef = useRef(null);

    useEffect(() => {
        if (isTauri()) {
            winRef.current = getCurrentWebviewWindow();
        }
    }, []);

    // ---------- Handlers ที่ผูกกับ Tauri window ----------
    const handleMinimize = async () => {
        if (onMinimize) return onMinimize();
        if (!winRef.current) return; // กรณีรันใน browser / ยังไม่ได้ init

        try {
            await winRef.current.minimize();
        } catch (e) {
            console.error("Failed to minimize window:", e);
        }
    };

    const handleMaximize = async () => {
        if (onMaximize) return onMaximize();
        if (!winRef.current) return;

        try {
            await winRef.current.toggleMaximize();
        } catch (e) {
            console.error("Failed to toggle maximize:", e);
        }
    };

    const handleClose = async () => {
        if (onClose) return onClose();
        if (!winRef.current) return;

        try {
            await winRef.current.close();
        } catch (e) {
            console.error("Failed to close window:", e);
        }
    };

    return (
        <Box
            component="header"
            data-tauri-drag-region
            style={{
                height: headerHeight,
                width: "100%",
                userSelect: "none",
                paddingLeft: compact ? 14 : 20,
                paddingRight: compact ? 6 : 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",

                // *** ตรงนี้จะโปร่งใส / glass ตามที่ตั้งค่า ***
                backgroundColor: glass
                    ? `rgba(255, 255, 255, ${opacity})`
                    : "transparent",
                backdropFilter: glass ? "blur(10px)" : "none",
                WebkitBackdropFilter: glass ? "blur(10px)" : "none",
                borderBottom: "1px solid rgba(226, 232, 240, 0.5)",

                position: "sticky",
                top: 0,
                zIndex: 200,
            }}
        >
            {/* LEFT: Icon + Title (ลาก window ได้ เพราะอยู่ใน drag-region) */}
            <Group align="center" gap={compact ? 6 : "sm"}>
                {Icon && (
                    <Icon
                        size={iconAdjustedSize}
                        color={iconColor}
                        style={{ opacity: 0.9 }}
                    />
                )}

                <Box>
                    <Text fw={700} size={titleSize} style={{ letterSpacing: "-0.02em" }}>
                        {title}
                    </Text>

                    {subtitle && !compact && (
                        <Text size="xs" c="dimmed">
                            {subtitle}
                        </Text>
                    )}
                </Box>
            </Group>

            {/* RIGHT: ปุ่ม title bar (ต้องเป็น no-drag เพื่อให้กดได้) */}
            <Group
                gap={compact ? 2 : 6}
                data-tauri-drag-region="false" // ปิด drag เฉพาะตรงนี้
            >
                {/* Minimize */}
                <ActionIcon
                    variant="subtle"
                    color="gray"
                    radius="md"
                    onClick={handleMinimize}
                    style={{
                        width: compact ? 28 : 32,
                        height: compact ? 22 : 28,
                        transition: "background 150ms",
                    }}
                >
                    <IconMinus size={compact ? 12 : 16} />
                </ActionIcon>

                {/* Maximize */}
                <ActionIcon
                    variant="subtle"
                    radius="md"
                    onClick={handleMaximize}
                    style={{
                        width: compact ? 28 : 32,
                        height: compact ? 22 : 28,
                        transition: "background 150ms",
                    }}
                >
                    <IconSquare size={compact ? 12 : 14} />
                </ActionIcon>

                {/* Close */}
                <ActionIcon
                    variant="subtle"
                    color="red"
                    radius="md"
                    onClick={handleClose}
                    style={{
                        width: compact ? 28 : 32,
                        height: compact ? 22 : 28,
                        transition: "background 150ms",
                    }}
                >
                    <IconX size={compact ? 12 : 16} />
                </ActionIcon>
            </Group>
        </Box>
    );
}