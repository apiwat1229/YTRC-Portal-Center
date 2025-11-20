// src/components/portal/StatusFooterBar.jsx
import { Card, Group, Text } from "@mantine/core";
import { IconCpu, IconServer } from "@tabler/icons-react";

/**
 * แถบสถานะด้านล่างของหน้า Portal
 */
export default function StatusFooterBar({
    statusLabel = "Service online",
    version = "v0.1.0-stable",
    latency = "24ms",
}) {
    return (
        <Card
            withBorder
            padding="xs"
            radius="md"
            bg="rgba(255,255,255,0.7)"
            style={{ backdropFilter: "blur(8px)" }}
        >
            <Group justify="space-between">
                <Group gap="xl">
                    <Group gap={6}>
                        <div
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: "#22c55e",
                                boxShadow: "0 0 8px #22c55e",
                            }}
                        />
                        <Text size="xs" fw={600} c="dimmed">
                            {statusLabel}
                        </Text>
                    </Group>

                    <Group gap={6}>
                        <IconServer size={14} color="#94a3b8" />
                        <Text size="xs" fw={600} c="dimmed">
                            {version}
                        </Text>
                    </Group>

                    <Group gap={6}>
                        <IconCpu size={14} color="#94a3b8" />
                        <Text size="xs" fw={600} c="dimmed">
                            Latency: {latency}
                        </Text>
                    </Group>
                </Group>

                <Text size="xs" c="dimmed">
                    © 2025 YTRC. All rights reserved.
                </Text>
            </Group>
        </Card>
    );
}