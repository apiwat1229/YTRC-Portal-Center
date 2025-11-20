import { ActionIcon, Box, Group, Text } from "@mantine/core";
import { IconMinus, IconSquare, IconX } from "@tabler/icons-react";

export default function SimplePageHeader({
    title,
    subtitle = null,     // ไม่มี subtitle ก็ไม่ error
    icon: Icon,
    iconSize = 20,
    iconColor = "#334155",

    onMinimize,
    onMaximize,
    onClose,

    glass = true,
    opacity = 0.35,

    compact = false,     // << โมดบางลง / Compact Mode
}) {
    const headerHeight = compact ? 44 : 60;
    const titleSize = compact ? "md" : "lg";
    const iconAdjustedSize = compact ? iconSize - 4 : iconSize;

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

                // Glass Effect
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
            {/* LEFT CONTENT */}
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

                    {/* ถ้าไม่มี subtitle ก็ไม่ render */}
                    {subtitle && !compact && (
                        <Text size="xs" c="dimmed">
                            {subtitle}
                        </Text>
                    )}
                </Box>
            </Group>

            {/* RIGHT — Titlebar Buttons */}
            <Group gap={compact ? 2 : 6}>

                <ActionIcon
                    variant="subtle"
                    color="gray"
                    radius="md"
                    onClick={onMinimize}
                    style={{
                        width: compact ? 28 : 32,
                        height: compact ? 22 : 28,
                        transition: "background 150ms",
                    }}
                >
                    <IconMinus size={compact ? 12 : 16} />
                </ActionIcon>

                <ActionIcon
                    variant="subtle"
                    radius="md"
                    onClick={onMaximize}
                    style={{
                        width: compact ? 28 : 32,
                        height: compact ? 22 : 28,
                        transition: "background 150ms",
                    }}
                >
                    <IconSquare size={compact ? 12 : 14} />
                </ActionIcon>

                <ActionIcon
                    variant="subtle"
                    color="red"
                    radius="md"
                    onClick={onClose}
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