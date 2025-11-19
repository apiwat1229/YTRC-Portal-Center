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
} from "@mantine/core";
import {
    IconArrowLeft,
    IconHierarchy2,
    IconKey,
    IconLayoutSidebarRightExpand,
    IconSettings,
    IconUsers,
} from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { can } from "../auth/permission";

export default function SystemMenuPortalPage({ auth, onBack }) {
    const { user } = auth || {};
    const [activeTool, setActiveTool] = useState(null); // 'users' | 'permissions' | 'menus' | 'roles' | null
    const navigate = useNavigate();

    const canUsers = can(user, "portal.admin.users.view");
    const canPermissions = can(user, "portal.admin.permissions.manage");
    const canMenus = can(user, "portal.admin.menus.manage");
    const canRoles = can(user, "portal.admin.roles.manage");

    return (
        <div className="app-bg">
            <AppShell
                padding="md"
                header={{ height: 64 }}
                styles={{
                    main: { backgroundColor: "transparent" },
                }}
            >
                <AppShell.Header>
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
                            <Text fw={600}>System Applications</Text>
                        </Group>

                        <Group gap="sm">
                            <Button
                                variant="subtle"
                                size="xs"
                                leftSection={<IconArrowLeft size={14} />}
                                onClick={onBack}
                            >
                                Back to Portal
                            </Button>
                        </Group>
                    </Group>
                </AppShell.Header>

                <AppShell.Main>
                    <Container size="lg" py="md">
                        <Stack gap="md">
                            <Card withBorder radius="md" style={{ backgroundColor: "white" }}>
                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mt="md">
                                    {/* User management */}
                                    <SystemAppCard
                                        title="User Management"
                                        description="จัดการผู้ใช้งาน: สร้าง/แก้ไข/ระงับบัญชี, reset password และ mapping กับแผนก/ตำแหน่ง."
                                        color="blue"
                                        icon={IconUsers}
                                        active={activeTool === "users"}
                                        disabled={!canUsers}
                                        onClick={() => {
                                            if (!canUsers) return;
                                            setActiveTool("users");
                                            navigate("/system/users");
                                            console.log("[System Menu] go to User management");
                                        }}
                                    />

                                    {/* Permission manager */}
                                    <SystemAppCard
                                        title="Permission Manager"
                                        description="จัดการสิทธิ์ (permissions) และผูกสิทธิ์กับผู้ใช้หรือ role."
                                        color="grape"
                                        icon={IconKey}
                                        active={activeTool === "permissions"}
                                        disabled={!canPermissions}
                                        onClick={() => {
                                            if (!canPermissions) return;
                                            setActiveTool("permissions");
                                            navigate("/system/permissions"); // ✅ ไปหน้า PermissionsPanel
                                            console.log("[System Menu] go to Permission Manager");
                                        }}
                                    />

                                    {/* Menu & navigation */}
                                    <SystemAppCard
                                        title="Menu & Navigation"
                                        description="กำหนดเมนู, navigation, และการแสดงผลให้สอดคล้องกับ role / แผนก (side menu, topbar)."
                                        color="cyan"
                                        icon={IconLayoutSidebarRightExpand}
                                        active={activeTool === "menus"}
                                        disabled={!canMenus}
                                        onClick={() => {
                                            if (!canMenus) return;
                                            setActiveTool("menus");
                                            console.log("[System Menu] go to Menu Management");
                                        }}
                                    />

                                    {/* Roles & policies */}
                                    <SystemAppCard
                                        title="Roles & Policies"
                                        description="ออกแบบ role (เช่น Admin, QA, Stock Controller) และรวมสิทธิ์หลายตัวเป็น policy เดียว."
                                        color="orange"
                                        icon={IconHierarchy2}
                                        active={activeTool === "roles"}
                                        disabled={!canRoles}
                                        onClick={() => {
                                            if (!canRoles) return;
                                            setActiveTool("roles");
                                            console.log("[System Menu] go to Roles & policies");
                                        }}
                                    />
                                </SimpleGrid>

                                <Divider my="md" />

                                <Box>
                                    <Text size="xs" c="dimmed" mb={4}>
                                        Selected system tool:
                                    </Text>
                                    <Code fz={12}>
                                        {activeTool === "users" &&
                                            "User Management — จัดการบัญชีผู้ใช้งานและข้อมูลพื้นฐาน"}
                                        {activeTool === "permissions" &&
                                            "Permission Manager — จัดการสิทธิ์และการผูกสิทธิ์"}
                                        {activeTool === "menus" &&
                                            "Menu & Navigation — กำหนดเมนูและโครงสร้างการนำทางของระบบ"}
                                        {activeTool === "roles" &&
                                            "Roles & Policies — ออกแบบบทบาทและนโยบายการเข้าถึงระบบ"}
                                        {!activeTool &&
                                            "ยังไม่ได้เลือก module (คลิกที่การ์ดด้านบนเพื่อเริ่มจัดการ System Menu)"}
                                    </Code>
                                </Box>

                                <Text size="xs" c="dimmed" mt="xs">
                                    * บาง module อาจถูกปิดการใช้งานขึ้นกับสิทธิ์การเข้าถึงของบัญชีผู้ใช้
                                </Text>
                            </Card>
                        </Stack>
                    </Container>
                </AppShell.Main>
            </AppShell>
        </div>
    );
}

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
            onClick={() => {
                if (!disabled && onClick) onClick();
            }}
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
                transition:
                    "transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease, opacity 120ms ease",
            }}
            shadow={isActive ? "md" : "xs"}
        >
            <Group align="flex-start" gap="md" wrap="nowrap">
                <Box
                    style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        backgroundColor: `var(--mantine-color-${color}-0, #eff6ff)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Icon size={24} color={`var(--mantine-color-${color}-6, #2563eb)`} />
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