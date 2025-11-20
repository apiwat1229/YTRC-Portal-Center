// src/components/portal/AppWidget.jsx
import { Badge, Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { useState } from "react";

/**
 * กล่องแอปแต่ละตัวใน grid (QR System, Cuplump, Booking ฯลฯ)
 * - ไม่รู้เรื่อง route / permission
 * - แค่เรียก onClick ถ้าไม่ได้ disabled
 */
export default function AppWidget({
    title,
    category,
    icon: Icon,
    color,
    status,
    description,
    active,
    disabled,
    onClick,
    alert,
}) {
    const [hovered, setHovered] = useState(false);

    const themeColor = `var(--mantine-color-${color}-6)`;

    return (
        <Card
            padding="lg"
            radius="lg"
            withBorder
            bg="white"
            onClick={() => !disabled && onClick?.()}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.6 : 1,
                transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                transform: hovered && !disabled ? "translateY(-4px)" : "none",
                boxShadow:
                    hovered && !disabled
                        ? "0 18px 28px -12px rgba(15,23,42,0.18)"
                        : "0 1px 2px rgba(0,0,0,0.05)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <Group justify="space-between" align="flex-start" mb="md">
                <ThemeIcon
                    size={44}
                    radius={12}
                    variant="light"
                    color={color}
                    style={{
                        transition: "all 0.2s ease",
                        transform:
                            hovered && !disabled ? "scale(1.05)" : "scale(1)",
                    }}
                >
                    {Icon && <Icon size={24} />}
                </ThemeIcon>

                {!disabled && (
                    <Badge
                        variant="dot"
                        color={alert ? "orange" : "green"}
                        size="xs"
                        style={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                        }}
                    >
                        {status}
                    </Badge>
                )}
            </Group>

            <Stack gap={4}>
                {category && (
                    <Text
                        size="xs"
                        fw={700}
                        c="dimmed"
                        tt="uppercase"
                        style={{ letterSpacing: "0.5px" }}
                    >
                        {category}
                    </Text>
                )}
                <Text
                    size="lg"
                    fw={700}
                    c="dark.8"
                    style={{ letterSpacing: "-0.3px" }}
                >
                    {title}
                </Text>
                {description && (
                    <Text size="xs" c="dimmed" lineClamp={2} h={34}>
                        {description}
                    </Text>
                )}
            </Stack>

            {/* Action bar */}
            <Group mt="md" justify="space-between" align="center">
                <div
                    style={{
                        height: 4,
                        flex: 1,
                        borderRadius: 2,
                        background: active ? themeColor : "#f1f5f9",
                        transition: "background 0.3s ease",
                    }}
                />

                <Text
                    size="xs"
                    fw={600}
                    c={color}
                    style={{
                        opacity: hovered && !disabled ? 1 : 0,
                        transform:
                            hovered && !disabled
                                ? "translateX(0)"
                                : "translateX(-5px)",
                        transition: "opacity 0.2s ease, transform 0.2s ease",
                        pointerEvents: "none",
                    }}
                >
                    Open App →
                </Text>
            </Group>
        </Card>
    );
}