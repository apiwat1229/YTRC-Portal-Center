// src/components/system/SystemMenuPortalPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    AppShell,
    Badge,
    Box,
    Container,
    Divider,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
} from "@mantine/core";

import {
    IconSettingsCog,
    IconBox,
    IconKey,
    IconShieldLock,
    IconTruck,
    IconUsers,
} from "@tabler/icons-react";

import { can } from "../auth/permission";
// 🔹 ปรับ path ให้ตรงกับไฟล์ UserHeaderPanel จริง
import UserHeaderPanel from "../common/UserHeaderPanel";

const APP_NAME = "YTRC Portal Center";
const PAGE_TITLE = "System Settings";

export default function SystemMenuPortalPage({
    auth,
    onLogout,
    onBack,
    onNotificationsClick,
    notificationsCount = 1,
}) {
    const { user } = auth || {};
    const navigate = useNavigate();
    const [activeTool, setActiveTool] = useState(null);

    useEffect(() => {
        document.title = `${PAGE_TITLE} | ${APP_NAME}`;
    }, []);

    const displayName = useMemo(() => {
        if (!user) return "";
        return (
            user.display_name ||
            [user.first_name, user.last_name].filter(Boolean).join(" ") ||
            user.username ||
            user.email
        );
    }, [user]);

    // ===== Permissions =====
    const canUsers = can(user, "portal.admin.users.view");
    const canPermissions = can(user, "portal.admin.permissions.manage");
    const canSuppliers = can(user, "portal.cuplump.suppliers.view");
    const canRubberTypes = can(user, "portal.cuplump.rubbertypes.view");

    const effectiveNotificationsCount = notificationsCount;

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f3f4f6",
                backgroundImage:
                    "radial-gradient(at 0% 0%, rgba(59,130,246,0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(139,92,246,0.1) 0px, transparent 50%)",
                fontFamily:
                    "Outfit, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
        >
            <AppShell
                padding="md"
                styles={{ main: { backgroundColor: "transparent" } }}
            >
                <AppShell.Main>
                    <Container size="lg" py="md">
                        <Stack gap="xl">
                            {/* ========= HEADER (แบบ StarterPage) ========= */}
                            <Group justify="space-between" align="center">
                                {/* Hero Title */}
                                <Group gap="md">
                                    <ThemeIcon
                                        size={48}
                                        radius="md"
                                        variant="gradient"
                                        gradient={{
                                            from: "blue",
                                            to: "indigo",
                                            deg: 135,
                                        }}
                                    >
                                        <IconSettingsCog size={28} />
                                    </ThemeIcon>
                                    <div>
                                        <Text
                                            size="xl"
                                            fw={800}
                                            style={{
                                                letterSpacing: "-0.5px",
                                                lineHeight: 1.1,
                                                color: "#1e293b",
                                            }}
                                        >
                                            SYSTEM Settings
                                        </Text>
                                        <Text
                                            size="xs"
                                            fw={500}
                                            c="dimmed"
                                            tt="uppercase"
                                            style={{ letterSpacing: "1px" }}
                                        >
                                            YTRC Administration Hub
                                        </Text>
                                    </div>
                                </Group>

                                {/* Header ขวา */}
                                <UserHeaderPanel
                                    user={user}
                                    displayName={displayName}
                                    onBackClick={onBack}
                                    onNotificationsClick={onNotificationsClick}
                                    onLogout={onLogout}
                                    notificationsCount={
                                        effectiveNotificationsCount
                                    }
                                />
                            </Group>

                            {/* ========= MAIN SYSTEM MENU CONTENT ========= */}
                            <Stack gap="md">
                                {/* Section 1: Security & Access Control */}
                                <Divider label="Security & Access Control" />

                                <SimpleGrid
                                    cols={{ base: 1, sm: 2 }}
                                    spacing="lg"
                                >
                                    <SettingCard
                                        title="User Management"
                                        description="จัดการบัญชีผู้ใช้งาน: สร้าง, แก้ไข, ระงับการใช้งาน และรีเซ็ตรหัสผ่าน"
                                        icon={IconUsers}
                                        color="blue"
                                        active={activeTool === "users"}
                                        disabled={!canUsers}
                                        onClick={() => {
                                            if (!canUsers) return;
                                            setActiveTool("users");
                                            navigate("/system/users");
                                        }}
                                    />

                                    <SettingCard
                                        title="Permission Manager"
                                        description="กำหนดสิทธิ์การเข้าถึง (Roles & Policies) และผูกสิทธิ์กับผู้ใช้งาน"
                                        icon={IconKey}
                                        color="grape"
                                        active={activeTool === "permissions"}
                                        disabled={!canPermissions}
                                        onClick={() => {
                                            if (!canPermissions) return;
                                            setActiveTool("permissions");
                                            navigate("/system/permissions");
                                        }}
                                    />
                                </SimpleGrid>

                                {/* Section 2: Purchasing Database */}
                                <Divider label="Purchasing Database" />

                                <SimpleGrid
                                    cols={{ base: 1, sm: 2 }}
                                    spacing="lg"
                                >
                                    <SettingCard
                                        title="Suppliers"
                                        description="ฐานข้อมูลคู่ค้า/ผู้ส่งมอบ สำหรับระบบรับซื้อยางและระบบคิว"
                                        icon={IconTruck}
                                        color="teal"
                                        active={activeTool === "suppliers"}
                                        disabled={!canSuppliers}
                                        onClick={() => {
                                            if (!canSuppliers) return;
                                            setActiveTool("suppliers");
                                            navigate("/system/suppliers");
                                        }}
                                    />

                                    {/* 🔹 Rubber Types → ไปหน้าใหม่ /system/rubber-types */}
                                    <SettingCard
                                        title="Rubber Types"
                                        description="จัดการข้อมูลชนิดยาง (STR20, USS) และเกรดสินค้า"
                                        icon={IconBox}
                                        color="green"
                                        active={activeTool === "rubbertypes"}
                                        disabled={!canRubberTypes}
                                        onClick={() => {
                                            if (!canRubberTypes) return;
                                            setActiveTool("rubbertypes");
                                            navigate("/system/rubber-types");
                                        }}
                                    />
                                </SimpleGrid>

                                {/* Security Footer */}
                                <Paper
                                    mt={40}
                                    radius="lg"
                                    withBorder
                                    shadow="xs"
                                    p="md"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 16,
                                        backgroundColor: "rgba(255,255,255,0.8)",
                                        backdropFilter: "blur(6px)",
                                    }}
                                >
                                    <Box
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: "50%",
                                            backgroundColor: "#f1f5f9",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <IconShieldLock
                                            size={18}
                                            color="#64748b"
                                        />
                                    </Box>
                                    <Text size="sm" c="dimmed">
                                        การเปลี่ยนแปลงการตั้งค่าระบบจะถูกบันทึกใน
                                        Audit Log เพื่อความปลอดภัยและสามารถตรวจสอบย้อนหลังได้
                                    </Text>
                                </Paper>
                            </Stack>
                        </Stack>
                    </Container>
                </AppShell.Main>
            </AppShell>
        </div>
    );
}

/* ===== SettingCard ===== */
function SettingCard({
    title,
    description,
    icon: Icon,
    color,
    active,
    disabled,
    onClick,
}) {
    const [hover, setHover] = useState(false);

    const colors = {
        blue: {
            bg: "#eff6ff",
            text: "#2563eb",
            border: "#bfdbfe",
            shadow: "rgba(37,99,235,.1)",
        },
        grape: {
            bg: "#f3e8ff",
            text: "#9333ea",
            border: "#d8b4fe",
            shadow: "rgba(147,51,234,.1)",
        },
        teal: {
            bg: "#f0fdfa",
            text: "#0d9488",
            border: "#99f6e4",
            shadow: "rgba(13,148,136,.1)",
        },
        green: {
            bg: "#f0fdf4",
            text: "#16a34a",
            border: "#bbf7d0",
            shadow: "rgba(22,163,74,.1)",
        },
        gray: {
            bg: "#f8fafc",
            text: "#94a3b8",
            border: "#e2e8f0",
            shadow: "rgba(0,0,0,0)",
        },
    };

    const theme = disabled ? colors.gray : colors[color] || colors.blue;
    const isActiveOrHover = (active || hover) && !disabled;

    return (
        <Paper
            radius={16}
            withBorder
            p={24}
            onClick={() => !disabled && onClick()}
            onMouseEnter={() => !disabled && setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                cursor: disabled ? "not-allowed" : "pointer",
                borderColor: isActiveOrHover ? theme.border : "#e2e8f0",
                boxShadow: isActiveOrHover
                    ? `0 10px 20px -5px ${theme.shadow}`
                    : "0 1px 3px rgba(0,0,0,0.05)",
                transform:
                    hover && !disabled ? "translateY(-2px)" : "translateY(0)",
                position: "relative",
                opacity: disabled ? 0.7 : 1,
                transition: "all 0.2s ease",
                backgroundColor: "white",
            }}
        >
            <Group align="flex-start" gap="md">
                <Box
                    style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        backgroundColor: theme.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: theme.text,
                        flexShrink: 0,
                        transition: "transform 0.3s ease",
                        transform:
                            hover && !disabled ? "scale(1.05)" : "scale(1)",
                    }}
                >
                    <Icon size={28} />
                </Box>

                <Box style={{ flex: 1 }}>
                    <Group justify="space-between" align="center" mb={4}>
                        <Text fw={600} style={{ letterSpacing: "-0.01em" }}>
                            {title}
                        </Text>
                        <Badge
                            variant={disabled ? "outline" : "light"}
                            color={disabled ? "gray" : color}
                        >
                            {disabled ? "Locked" : "Active"}
                        </Badge>
                    </Group>

                    <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
                        {description}
                    </Text>
                </Box>
            </Group>

            {active && (
                <Box
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        backgroundColor: theme.text,
                    }}
                />
            )}
        </Paper>
    );
}