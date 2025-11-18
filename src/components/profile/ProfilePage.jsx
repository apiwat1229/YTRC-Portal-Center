// src/components/profile/ProfilePage.jsx
import {
    AppShell,
    Badge,
    Box,
    Button,
    Card,
    Code,
    Container,
    Divider,
    Group,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { IconGridDots, IconUser } from "@tabler/icons-react";
import { useMemo } from "react";

export default function ProfilePage({ auth, onLogout, onBack }) {
    const { user, access_token, refresh_token } = auth || {};

    const displayName = useMemo(() => {
        if (!user) return "";
        return (
            user.display_name ||
            [user.first_name, user.last_name].filter(Boolean).join(" ") ||
            user.username ||
            user.email
        );
    }, [user]);

    const prettyDate = (dt) => {
        if (!dt) return "-";
        try {
            return new Date(dt).toLocaleString();
        } catch {
            return dt;
        }
    };

    if (!user) return null;

    return (
        <AppShell
            padding="md"
            header={{ height: 64 }}
            styles={{
                main: {
                    backgroundColor: "#f5f7fb",
                },
            }}
            headerSection={
                <Group
                    h="100%"
                    px="md"
                    justify="space-between"
                    style={{
                        borderBottom: "1px solid rgba(226, 232, 240, 1)",
                        backgroundColor: "white",
                    }}
                >
                    <Group gap="xs">
                        <IconUser size={20} />
                        <Text fw={600}>Profile</Text>
                    </Group>

                    <Group gap="sm">
                        <Button
                            variant="subtle"
                            size="xs"
                            leftSection={<IconGridDots size={14} />}
                            onClick={onBack}
                        >
                            Back to Portal
                        </Button>
                        <Button
                            variant="outline"
                            size="xs"
                            color="gray"
                            onClick={onLogout}
                        >
                            Logout
                        </Button>
                    </Group>
                </Group>
            }
        >
            <Container size="lg" py="md">
                <Stack gap="md">
                    {/* Profile main card */}
                    <Card withBorder radius="lg" style={{ backgroundColor: "white" }}>
                        <Group align="flex-start" gap="lg">
                            <Box
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: "999px",
                                    background: "linear-gradient(135deg, #3b82f6, #22c55e)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 700,
                                    fontSize: 28,
                                    color: "white",
                                }}
                            >
                                {displayName
                                    .split(" ")
                                    .map((x) => x[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()}
                            </Box>

                            <Stack gap={4} flex={1}>
                                <Title order={3}>{displayName}</Title>
                                <Text size="sm" c="dimmed">
                                    {user.email}
                                </Text>

                                <Group gap={8} mt="xs">
                                    {user.department && (
                                        <Badge variant="light" color="teal">
                                            Dept: {user.department}
                                        </Badge>
                                    )}
                                    {user.position && (
                                        <Badge variant="light" color="blue">
                                            Position: {user.position}
                                        </Badge>
                                    )}
                                    {user.role && (
                                        <Badge variant="light" color="violet">
                                            Role: {user.role}
                                        </Badge>
                                    )}
                                    {user.status && (
                                        <Badge variant="outline" color="yellow">
                                            Status: {String(user.status).toUpperCase()}
                                        </Badge>
                                    )}
                                </Group>
                            </Stack>
                        </Group>
                    </Card>

                    {/* Detail cards */}
                    <Group align="flex-start" grow>
                        <Card withBorder radius="lg" style={{ backgroundColor: "white" }}>
                            <Title order={5} mb="xs">
                                Account info
                            </Title>
                            <Divider mb="xs" />

                            <InfoRow label="Username" value={user.username || "-"} />
                            <InfoRow label="User ID" value={user._id || user.id || "-"} />
                            <InfoRow label="HOD User" value={user.hod_user_id || "-"} />
                        </Card>

                        <Card withBorder radius="lg" style={{ backgroundColor: "white" }}>
                            <Title order={5} mb="xs">
                                Activity
                            </Title>
                            <Divider mb="xs" />

                            <InfoRow label="Created at" value={prettyDate(user.created_at)} />
                            <InfoRow label="Updated at" value={prettyDate(user.updated_at)} />
                            <InfoRow label="Last login" value={prettyDate(user.last_login)} />
                        </Card>
                    </Group>

                    {/* Tokens (dev only) */}
                    <Card
                        withBorder
                        radius="lg"
                        style={{
                            backgroundColor: "white",
                            borderStyle: "dashed",
                            borderColor: "rgba(148, 163, 184, 0.8)",
                        }}
                    >
                        <Title order={5} mb="xs">
                            Tokens (dev only)
                        </Title>
                        <Text size="xs" c="dimmed" mb="xs">
                            ใช้สำหรับ debug ระหว่างพัฒนาเท่านั้น — production อาจซ่อนส่วนนี้
                        </Text>

                        <Stack gap="xs">
                            <TokenRow label="Access token" value={access_token} />
                            <TokenRow label="Refresh token" value={refresh_token} />
                        </Stack>
                    </Card>

                    {/* ปุ่ม Back to Portal Center ด้านล่างหน้า */}
                    <Group justify="flex-end" mt="sm">
                        <Button
                            variant="light"
                            leftSection={<IconGridDots size={16} />}
                            onClick={onBack}
                        >
                            Back to Portal Center
                        </Button>
                    </Group>
                </Stack>
            </Container>
        </AppShell>
    );
}

/* ----------------- Small Components ----------------- */

function InfoRow({ label, value }) {
    return (
        <Group justify="space-between" gap="xs" mb={4}>
            <Text size="sm" c="dimmed">
                {label}
            </Text>
            <Text size="sm">{value || "-"}</Text>
        </Group>
    );
}

function TokenRow({ label, value }) {
    return (
        <Box>
            <Text size="xs" c="dimmed">
                {label}
            </Text>
            <Code
                block
                fz={11}
                mt={2}
                style={{
                    maxWidth: "100%",
                    overflowX: "auto",
                    whiteSpace: "nowrap",
                }}
            >
                {value}
            </Code>
        </Box>
    );
}