// src/components/system/SystemMenuPortalPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    AppShell,
    Box,
    Container,
    Divider,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    Transition
} from "@mantine/core";

import {
    IconBox,
    IconChevronRight,
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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        document.title = `${PAGE_TITLE} | ${APP_NAME}`;
        setMounted(true);
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
                backgroundColor: "#f8fafc",
                backgroundImage:
                    "radial-gradient(at 0% 0%, rgba(59,130,246,0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(139,92,246,0.05) 0px, transparent 50%)",
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
                            {/* ========= HEADER (Preserved) ========= */}
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
                            <Stack gap="xl" mt="md">
                                {/* Section 1: Security & Access Control */}
                                <SectionHeader label="Security & Access Control" delay={100} mounted={mounted} />

                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                                    <Transition mounted={mounted} transition="slide-up" duration={400} timingFunction="ease" delay={200}>
                                        {(styles) => (
                                            <div style={styles}>
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
                                            </div>
                                        )}
                                    </Transition>

                                    <Transition mounted={mounted} transition="slide-up" duration={400} timingFunction="ease" delay={300}>
                                        {(styles) => (
                                            <div style={styles}>
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
                                            </div>
                                        )}
                                    </Transition>
                                </SimpleGrid>

                                {/* Section 2: Purchasing Database */}
                                <SectionHeader label="Purchasing Database" delay={400} mounted={mounted} />

                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                                    <Transition mounted={mounted} transition="slide-up" duration={400} timingFunction="ease" delay={500}>
                                        {(styles) => (
                                            <div style={styles}>
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
                                            </div>
                                        )}
                                    </Transition>

                                    <Transition mounted={mounted} transition="slide-up" duration={400} timingFunction="ease" delay={600}>
                                        {(styles) => (
                                            <div style={styles}>
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
                                            </div>
                                        )}
                                    </Transition>
                                </SimpleGrid>

                                {/* Security Footer */}
                                <Transition mounted={mounted} transition="fade" duration={600} delay={800}>
                                    {(styles) => (
                                        <Paper
                                            mt={20}
                                            radius="lg"
                                            withBorder
                                            p="md"
                                            bg="gray.0"
                                            style={{
                                                ...styles,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 16,
                                                borderStyle: "dashed",
                                                borderColor: "#cbd5e1",
                                            }}
                                        >
                                            <ThemeIcon variant="light" color="gray" size="lg" radius="md">
                                                <IconShieldLock size={20} />
                                            </ThemeIcon>
                                            <Text size="sm" c="dimmed" style={{ flex: 1 }}>
                                                การเปลี่ยนแปลงการตั้งค่าระบบจะถูกบันทึกใน <Text span fw={600} c="dark">Audit Log</Text> เพื่อความปลอดภัยและสามารถตรวจสอบย้อนหลังได้
                                            </Text>
                                        </Paper>
                                    )}
                                </Transition>
                            </Stack>
                        </Stack>
                    </Container>
                </AppShell.Main>
            </AppShell>
        </div>
    );
}

function SectionHeader({ label, delay, mounted }) {
    return (
        <Transition mounted={mounted} transition="fade" duration={400} delay={delay}>
            {(styles) => (
                <div style={styles}>
                    <Group align="center" gap="xs" mb={4}>
                        <Box w={4} h={16} bg="blue.5" style={{ borderRadius: 2 }} />
                        <Text
                            size="sm"
                            fw={700}
                            tt="uppercase"
                            c="dimmed"
                            style={{ letterSpacing: "0.05em" }}
                        >
                            {label}
                        </Text>
                    </Group>
                    <Divider color="gray.2" />
                </div>
            )}
        </Transition>
    );
}

/* ===== AppWidget (Redesigned) ===== */
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
        blue: { bg: "blue.0", text: "blue.6", border: "blue.2" },
        grape: { bg: "grape.0", text: "grape.6", border: "grape.2" },
        teal: { bg: "teal.0", text: "teal.6", border: "teal.2" },
        green: { bg: "green.0", text: "green.6", border: "green.2" },
        gray: { bg: "gray.0", text: "gray.4", border: "gray.2" },
    };

    const theme = disabled ? colors.gray : colors[color] || colors.blue;

    return (
        <Paper
            radius="lg"
            withBorder
            p="lg"
            onClick={() => !disabled && onClick?.()}
            onMouseEnter={() => !disabled && setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                cursor: disabled ? "not-allowed" : "pointer",
                borderColor: hover && !disabled ? `var(--mantine-color-${theme.border})` : "var(--mantine-color-gray-2)",
                backgroundColor: "white",
                transition: "all 0.2s ease",
                transform: hover && !disabled ? "translateY(-4px)" : "none",
                boxShadow: hover && !disabled ? "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" : "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                opacity: disabled ? 0.6 : 1,
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Active Indicator */}
            {active && (
                <Box
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: 4,
                        backgroundColor: `var(--mantine-color-${color}-5)`,
                    }}
                />
            )}

            <Group align="flex-start" wrap="nowrap">
                <ThemeIcon
                    size={56}
                    radius="md"
                    variant="light"
                    color={disabled ? "gray" : color}
                    style={{ flexShrink: 0 }}
                >
                    <Icon size={32} stroke={1.5} />
                </ThemeIcon>

                <Box style={{ flex: 1 }}>
                    <Group justify="space-between" align="center" mb={4}>
                        <Text size="xs" fw={700} tt="uppercase" c={disabled ? "dimmed" : color} style={{ letterSpacing: "0.5px" }}>
                            {subtitle}
                        </Text>
                        {!disabled && hover && (
                            <IconChevronRight size={16} color="#94a3b8" />
                        )}
                    </Group>

                    <Text size="lg" fw={700} c="dark.9" mb={4} style={{ lineHeight: 1.2 }}>
                        {title}
                    </Text>

                    <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
                        {description}
                    </Text>
                </Box>
            </Group>
        </Paper>
    );
}