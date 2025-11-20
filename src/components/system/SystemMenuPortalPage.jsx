import { ActionIcon, Box, Group, Text } from "@mantine/core";
import {
    IconMinus,   // Minimize
    IconSquare,  // Maximize
    IconX,       // Close
} from "@tabler/icons-react";

export default function SimplePageHeader({
    title,
    subtitle,
    icon: Icon,
    iconSize = 20,
    iconColor = "#334155",
    onMinimize,
    onMaximize,
    onClose,
}) {
    return (
        <Box
            component="header"
            style={{
                height: 60,
                borderBottom: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                userSelect: "none",
                width: "100%",
                paddingLeft: 20,
                paddingRight: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
            }}
        >
            {/* LEFT CONTENT */}
            <Group align="center" gap="xs">
                {Icon && <Icon size={iconSize} color={iconColor} />}

                <Box>
                    <Text fw={700} size="lg" style={{ letterSpacing: "-0.02em" }}>
                        {title}
                    </Text>

                    {subtitle && (
                        <Text size="xs" c="dimmed">
                            {subtitle}
                        </Text>
                    )}
                </Box>
            </Group>

            {/* RIGHT — Titlebar Buttons */}
            <Group gap={2}>
                <ActionIcon
                    variant="subtle"
                    radius="md"
                    onClick={onMinimize}
                    style={{ width: 32, height: 28 }}
                >
                    <IconMinus size={16} />
                </ActionIcon>

                <ActionIcon
                    variant="subtle"
                    radius="md"
                    onClick={onMaximize}
                    style={{ width: 32, height: 28 }}
                >
                    <IconSquare size={14} />
                </ActionIcon>

                <ActionIcon
                    variant="light"
                    color="red"
                    radius="md"
                    onClick={onClose}
                    style={{ width: 32, height: 28 }}
                >
                    <IconX size={16} />
                </ActionIcon>
            </Group>
        </Box>
    );
}