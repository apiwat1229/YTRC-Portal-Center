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
    IconBox,
    IconKey,
    IconSettingsCog,
    IconShieldLock,
    IconTruck,
    IconUsers,
} from "@tabler/icons-react";

import { can } from "../auth/permission";
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
                            {/* ========= HEADER ========= */}
                            <Group justify="space-between" align="center">
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

                                <UserHeaderPanel
                                    user={user}
                                    displayName={displayName}
                                    onBackClick={onBack}
                                    onNotificationsClick={onNotificationsClick}
                                    onLogout={onLogout}
                                    notificationsCount={effectiveNotificationsCount}
                                />
                            </Group>

                            {/* ========= MAIN SYSTEM MENU CONTENT ========= */}
                            <Stack gap="lg">
                                {/* Section 1: Security & Access Control */}
                                <Divider label="Security & Access Control" />

                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                                    <AppWidget
                                        title="User Management"
                                        subtitle="จัดการบัญชีผู้ใช้งาน"
                                        description="สร้าง / แก้ไข / ระงับการใช้งาน และรีเซ็ตรหัสผ่าน"
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

                                    <AppWidget
                                        title="Permission Manager"
                                        subtitle="สิทธิ์การเข้าถึง"
                                        description="กำหนด Roles & Policies และผูกสิทธิ์กับผู้ใช้งาน"
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

                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                                    <AppWidget
                                        title="Suppliers"
                                        subtitle="ฐานข้อมูลคู่ค้า"
                                        description="ข้อมูลคู่ค้า/ผู้ส่งมอบสำหรับระบบรับซื้อยางและระบบคิว"
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

                                    <AppWidget
                                        title="Rubber Types"
                                        subtitle="ชนิดยาง & เกรด"
                                        description="จัดการชนิดยาง (STR20, USS) และเกรดสินค้า"
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
                                        <IconShieldLock size={18} color="#64748b" />
                                    </Box>
                                    <Text size="sm" c="dimmed">
                                        การเปลี่ยนแปลงการตั้งค่าระบบจะถูกบันทึกใน Audit Log
                                        เพื่อความปลอดภัยและสามารถตรวจสอบย้อนหลังได้
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

/* ===== AppWidget (Tile-style widget) ===== */
function AppWidget({
    title,
    subtitle,
    description,
    icon: Icon,
    color = "blue",
    active,
    disabled,
    onClick,
}) {
    const [hover, setHover] = useState(false);

    const colors = {
        blue: {
            bg: "rgba(59,130,246,0.08)",
            text: "#2563eb",
            border: "#bfdbfe",
            shadow: "rgba(37,99,235,.18)",
        },
        grape: {
            bg: "rgba(147,51,234,0.08)",
            text: "#9333ea",
            border: "#d8b4fe",
            shadow: "rgba(147,51,234,.18)",
        },
        teal: {
            bg: "rgba(13,148,136,0.08)",
            text: "#0d9488",
            border: "#99f6e4",
            shadow: "rgba(13,148,136,.18)",
        },
        green: {
            bg: "rgba(22,163,74,0.08)",
            text: "#16a34a",
            border: "#bbf7d0",
            shadow: "rgba(22,163,74,.18)",
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
            radius={18}
            withBorder
            p={18}
            onClick={() => !disabled && onClick?.()}
            onMouseEnter={() => !disabled && setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                cursor: disabled ? "not-allowed" : "pointer",
                borderColor: isActiveOrHover ? theme.border : "#e2e8f0",
                boxShadow: isActiveOrHover
                    ? `0 12px 24px -6px ${theme.shadow}`
                    : "0 1px 3px rgba(15,23,42,0.06)",
                transform:
                    hover && !disabled ? "translateY(-3px)" : "translateY(0)",
                position: "relative",
                opacity: disabled ? 0.7 : 1,
                transition: "all 0.18s ease-out",
                background:
                    "radial-gradient(circle at 0 0, rgba(148,163,184,0.18), transparent 55%), #ffffff",
                display: "flex",
                flexDirection: "column",
                gap: 12,
            }}
        >
            <Group justify="space-between" align="flex-start">
                {/* Icon bubble */}
                <Box
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: 20,
                        backgroundColor: theme.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: theme.text,
                        flexShrink: 0,
                        transform:
                            hover && !disabled ? "scale(1.05)" : "scale(1)",
                        transition: "transform 0.2s ease-out",
                    }}
                >
                    <Icon size={30} />
                </Box>

                {/* Status badge */}
                <Badge
                    size="xs"
                    variant={disabled ? "outline" : "light"}
                    color={disabled ? "gray" : color}
                    radius="xl"
                >
                    {disabled ? "Locked" : "Active"}
                </Badge>
            </Group>

            {/* Text content */}
            <Box style={{ flex: 1 }}>
                {subtitle && (
                    <Text
                        size="xs"
                        c="dimmed"
                        tt="uppercase"
                        fw={600}
                        style={{
                            letterSpacing: "0.12em",
                            fontSize: 10,
                            marginBottom: 4,
                        }}
                    >
                        {subtitle}
                    </Text>
                )}

                <Text
                    fw={700}
                    style={{
                        letterSpacing: "-0.01em",
                        marginBottom: 4,
                        color: "#0f172a",
                    }}
                >
                    {title}
                </Text>

                <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
                    {description}
                </Text>
            </Box>

            {/* Active indicator bar */}
            {active && (
                <Box
                    style={{
                        position: "absolute",
                        left: 16,
                        bottom: 12,
                        width: 40,
                        height: 3,
                        borderRadius: 999,
                        background: theme.text,
                    }}
                />
            )}
        </Paper>
    );
}