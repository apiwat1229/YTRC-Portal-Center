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
import AccountInfoBlock from "../common/AccountInfoBlock";

export default function SystemMenuPortalPage({
    auth,
    onLogout,
    onBack,
    onOpenProfile, // ✅ เพิ่ม prop สำหรับปุ่มดูโปรไฟล์
}) {
    const { user } = auth || {};
    const [activeTool, setActiveTool] = useState(null); // 'users' | 'permissions' | 'menus' | 'roles' | null

    const displayName = useMemo(() => {
        if (!user) return "";
        return (
            user.display_name ||
            [user.first_name, user.last_name].filter(Boolean).join(" ") ||
            user.username ||
            user.email
        );
    }, [user]);

    // สิทธิ์ย่อยใน System Menu
    const canUsers = can(user, "portal.admin.users.view") || user?.is_superuser;
    const canPermissions =
        can(user, "portal.admin.permissions.manage") || user?.is_superuser;
    const canMenus =
        can(user, "portal.admin.menus.manage") || user?.is_superuser;
    const canRoles =
        can(user, "portal.admin.roles.manage") || user?.is_superuser;

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
                    {/* Header / User info (reuse AccountInfoBlock) */}
                    <AccountInfoBlock
                        user={user}
                        onOpenProfile={onOpenProfile} // ✅ ส่ง handler ให้ปุ่ม ดูโปรไฟล์
                        onLogout={onLogout}
                        description={
                            "คุณกำลังใช้งาน System Administration Center สำหรับจัดการผู้ใช้งาน, สิทธิ์การเข้าถึง, เมนูระบบ และโครงสร้างบทบาท (Roles) เพื่อควบคุมการเข้าถึงระบบย่อยทั้งหมดใน YTRC Portal Center"
                        }
                    />

                    {/* System applications cards */}
                    <Card withBorder radius="md" style={{ backgroundColor: "white" }}>
                        <Group justify="space-between" mb="xs">
                            <Group gap="xs" align="center">
                                <Title order={5}>System Applications</Title>
                                <Badge size="xs" radius="lg" variant="light" color="blue">
                                    ADMIN CENTER
                                </Badge>
                            </Group>

                            <Button
                                variant="subtle"
                                size="xs"
                                leftSection={<IconArrowLeft size={14} />}
                                onClick={onBack}
                            >
                                Back to Portal
                            </Button>
                        </Group>

                        <Text size="xs" c="dimmed" mb="sm">
                            เลือกโมดูลสำหรับจัดการ System Menu, Users, Permissions, และ Roles
                        </Text>

                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mt="md">
                            {/* User management */}
                            <SystemAppCard
                                title="User management"
                                description="จัดการผู้ใช้งาน: สร้าง/แก้ไข/ระงับบัญชี, reset password และ mapping กับแผนก/ตำแหน่ง."
                                color="blue"
                                icon={IconUsers}
                                active={activeTool === "users"}
                                disabled={!canUsers}
                                onClick={() => {
                                    if (!canUsers) return;
                                    setActiveTool("users");
                                    console.log("[System Menu] go to User management");
                                }}
                            />

                            {/* Permission manager */}
                            <SystemAppCard
                                title="Permission manager"
                                description="จัดการสิทธิ์ (permissions) และผูกสิทธิ์กับผู้ใช้หรือ role."
                                color="grape"
                                icon={IconKey}
                                active={activeTool === "permissions"}
                                disabled={!canPermissions}
                                onClick={() => {
                                    if (!canPermissions) return;
                                    setActiveTool("permissions");
                                    console.log("[System Menu] go to Permission manager");
                                }}
                            />

                            {/* Menu & navigation */}
                            <SystemAppCard
                                title="Menu & navigation"
                                description="กำหนดเมนู, navigation, และการแสดงผลให้สอดคล้องกับ role / แผนก (side menu, topbar)."
                                color="cyan"
                                icon={IconLayoutSidebarRightExpand}
                                active={activeTool === "menus"}
                                disabled={!canMenus}
                                onClick={() => {
                                    if (!canMenus) return;
                                    setActiveTool("menus");
                                    console.log("[System Menu] go to Menu management");
                                }}
                            />

                            {/* Roles & policies */}
                            <SystemAppCard
                                title="Roles & policies"
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
                                    "User management — จัดการบัญชีผู้ใช้งานและข้อมูลพื้นฐาน"}
                                {activeTool === "permissions" &&
                                    "Permission manager — จัดการสิทธิ์และการผูกสิทธิ์"}
                                {activeTool === "menus" &&
                                    "Menu & navigation — กำหนดเมนูและโครงสร้างการนำทางของระบบ"}
                                {activeTool === "roles" &&
                                    "Roles & policies — ออกแบบบทบาทและนโยบายการเข้าถึงระบบ"}
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
        </AppShell>
    );
}

/**
 * การ์ดของ System Menu (หน้าตาใกล้เคียง AppCardBig)
 */
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