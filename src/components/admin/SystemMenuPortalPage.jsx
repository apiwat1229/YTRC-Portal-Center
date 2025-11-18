// src/components/admin/SystemMenuPortalPage.jsx
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
    SimpleGrid,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import {
    IconArrowLeft,
    IconHierarchy2,
    IconKey,
    IconLayoutSidebarRightExpand,
    IconSettings,
    IconUsers,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { can } from "../auth/permission";

export default function SystemMenuPortalPage({ auth, onLogout, onBack }) {
    const { user } = auth || {};
    const [activeTool, setActiveTool] = useState(null);

    const displayName = useMemo(() => {
        if (!user) return "";
        return (
            user.display_name ||
            [user.first_name, user.last_name].filter(Boolean).join(" ") ||
            user.username ||
            user.email
        );
    }, [user]);

    // สิทธิ์ใน System Menu
    const canUsers = can(user, "portal.admin.users.view") || user?.is_superuser;
    const canPermissions =
        can(user, "portal.admin.permissions.manage") || user?.is_superuser;
    const canMenus =
        can(user, "portal.admin.menus.manage") || user?.is_superuser;
    const canRoles =
        can(user, "portal.admin.roles.manage") || user?.is_superuser;

    const initials = (displayName || "?")
        .split(" ")
        .map((x) => x[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

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
                        <IconSettings size={20} />
                        <Text fw={600}>System Menu Center</Text>
                    </Group>

                    <Group gap="sm">
                        <Text size="sm" c="dimmed">
                            {displayName}
                        </Text>
                        {/* ✅ ปุ่ม Back to Portal กลับมาแล้ว */}
                        <Button
                            variant="subtle"
                            size="xs"
                            leftSection={<IconArrowLeft size={14} />}
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
                    {/* Header Card */}
                    <Card withBorder radius="md" style={{ backgroundColor: "white" }}>
                        {/* TOP: Title + description */}
                        <Stack gap={4} mb="sm">
                            <Group gap="xs" align="center">
                                <Title order={4}>System administration center</Title>
                                <Badge size="xs" radius="lg" variant="light" color="blue">
                                    ADMIN CENTER
                                </Badge>
                            </Group>

                            <Text size="xs" c="dimmed">
                                ศูนย์กลางสำหรับจัดการผู้ใช้งาน, สิทธิ์การเข้าถึง, เมนูระบบ
                                และโครงสร้างบทบาท (Roles) เพื่อควบคุมการเข้าถึงระบบย่อยทั้งหมดใน{" "}
                                <Text component="span" fw={500}>
                                    YTRC Portal Center
                                </Text>
                            </Text>
                        </Stack>

                        <Divider my="sm" />

                        {/* BOTTOM: Avatar + user info */}
                        <Group align="flex-start" gap="md">
                            <Box
                                style={{
                                    width: 58,
                                    height: 58,
                                    borderRadius: "999px",
                                    background: "linear-gradient(135deg, #3b82f6, #0ea5e9)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 700,
                                    fontSize: 20,
                                    color: "white",
                                }}
                            >
                                {initials}
                            </Box>

                            <Stack gap={4}>
                                <Text fw={600} size="sm">
                                    {displayName}
                                </Text>

                                {user?.email && (
                                    <Code fz={11} mt={-2}>
                                        {user.email}
                                    </Code>
                                )}

                                <Group gap={8} mt={4}>
                                    {user?.department && (
                                        <Badge variant="light" color="teal" size="xs">
                                            DEPT: {user.department}
                                        </Badge>
                                    )}
                                    {user?.position && (
                                        <Badge variant="light" color="blue" size="xs">
                                            POSITION: {user.position}
                                        </Badge>
                                    )}
                                    {user?.role && (
                                        <Badge variant="light" color="violet" size="xs">
                                            ROLE: {user.role}
                                        </Badge>
                                    )}
                                </Group>
                            </Stack>
                        </Group>
                    </Card>

                    {/* System App Cards */}
                    <Card withBorder radius="md" style={{ backgroundColor: "white" }}>
                        <Group justify="space-between" mb="xs">
                            <Text fw={600}>System applications</Text>
                            <Text size="xs" c="dimmed">
                                Back to system categories
                            </Text>
                        </Group>

                        <Text size="xs" c="dimmed" mb="sm">
                            เลือกโมดูลสำหรับจัดการ System Menu, Users, Permissions, และ Roles
                        </Text>

                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mt="md">
                            <SystemAppCard
                                title="User management"
                                description="จัดการผู้ใช้งานทั้งหมด"
                                color="blue"
                                icon={IconUsers}
                                active={activeTool === "users"}
                                disabled={!canUsers}
                                onClick={() => setActiveTool("users")}
                            />

                            <SystemAppCard
                                title="Permission manager"
                                description="จัดการสิทธิ์การเข้าถึงระบบ"
                                color="grape"
                                icon={IconKey}
                                active={activeTool === "permissions"}
                                disabled={!canPermissions}
                                onClick={() => setActiveTool("permissions")}
                            />

                            <SystemAppCard
                                title="Menu & navigation"
                                description="ควบคุมเมนูระบบและหน้าแสดงผล"
                                color="cyan"
                                icon={IconLayoutSidebarRightExpand}
                                active={activeTool === "menus"}
                                disabled={!canMenus}
                                onClick={() => setActiveTool("menus")}
                            />

                            <SystemAppCard
                                title="Roles & policies"
                                description="กำหนดโครงสร้างบทบาท ผู้ใช้"
                                color="orange"
                                icon={IconHierarchy2}
                                active={activeTool === "roles"}
                                disabled={!canRoles}
                                onClick={() => setActiveTool("roles")}
                            />
                        </SimpleGrid>

                        <Divider my="md" />

                        <Box>
                            <Text size="xs" c="dimmed" mb={4}>
                                Selected module:
                            </Text>
                            <Code fz={12}>
                                {activeTool || "ยังไม่ได้เลือก module"}
                            </Code>
                        </Box>
                    </Card>
                </Stack>
            </Container>
        </AppShell>
    );
}

/* System menu card component */
function SystemAppCard({
    title,
    description,
    color,
    icon: Icon,
    active,
    disabled,
    onClick,
}) {
    const isActive = active && !disabled;

    return (
        <Card
            radius="md"
            withBorder
            onClick={() => !disabled && onClick()}
            style={{
                cursor: disabled ? "not-allowed" : "pointer",
                padding: "18px 16px",
                backgroundColor: disabled
                    ? "#f9fafb"
                    : isActive
                        ? "rgba(219, 234, 254, 0.7)"
                        : "white",
                borderColor: disabled
                    ? "rgba(209, 213, 219, 1)"
                    : isActive
                        ? "rgba(59, 130, 246, 0.9)"
                        : "rgba(226,232,240,1)",
                opacity: disabled ? 0.6 : 1,
                transition: "150ms ease",
            }}
            shadow={isActive ? "md" : "xs"}
        >
            <Group align="flex-start" gap="md">
                <Box
                    style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        backgroundColor: `var(--mantine-color-${color}-0, #e0f2fe)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Icon size={22} color={`var(--mantine-color-${color}-6)`} />
                </Box>

                <Stack gap={4} style={{ flex: 1 }}>
                    <Group justify="space-between" align="flex-start">
                        <Text fw={600} size="sm">
                            {title}
                        </Text>

                        <Badge
                            variant={disabled ? "outline" : isActive ? "filled" : "light"}
                            color={disabled ? "gray" : color}
                            radius="lg"
                            size="xs"
                        >
                            {disabled ? "No access" : isActive ? "Selected" : "Available"}
                        </Badge>
                    </Group>

                    <Text size="xs" c="dimmed">
                        {description}
                    </Text>
                </Stack>
            </Group>
        </Card>
    );
}