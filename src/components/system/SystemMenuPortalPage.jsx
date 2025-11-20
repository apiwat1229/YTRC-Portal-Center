// src/components/system/SystemMenuPortalPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Badge,
    Box,
    Container,
    Divider,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
} from "@mantine/core";

import {
    IconBox,
    IconKey,
    IconSettings,
    IconShieldLock,
    IconTruck,
    IconUsers,
} from "@tabler/icons-react";

import { can } from "../auth/permission";
import SimplePageHeader from "../layout/SimplePageHeader";

const APP_NAME = "YTRC Portal Center";
const PAGE_TITLE = "System Center";

export default function SystemMenuPortalPage({ auth, onBack }) {
    const { user } = auth || {};
    const navigate = useNavigate();
    const [activeTool, setActiveTool] = useState(null);

    useEffect(() => {
        document.title = `${PAGE_TITLE} | ${APP_NAME}`;
    }, []);

    // Permissions
    const canUsers = can(user, "portal.admin.users.view");
    const canPermissions = can(user, "portal.admin.permissions.manage");
    const canSuppliers = can(user, "portal.cuplump.suppliers.view");
    const canRubberTypes = can(user, "portal.cuplump.rubbertypes.view");

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f8fafc",
                fontFamily:
                    "Outfit, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
        >
            {/* ===== ใช้ SimplePageHeader ที่แยกไฟล์ไว้ ===== */}
            <SimplePageHeader
                title="System Settings"
                icon={IconSettings}
                iconColor="#454545"
                iconSize={24}
                onMinimize={() => appWindow.minimize()}
                onMaximize={() => appWindow.toggleMaximize()}
                onClose={() => appWindow.close()}
                glass={true}
                opacity={0.25}
                compact={true}
            />

            {/* ===== Main content ===== */}
            <Container size="lg" py="md">
                <Stack gap="md">
                    {/* Section 1: Security & Access Control */}
                    <Divider label="Security & Access Control" />

                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
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

                    {/* Section 2: Business Master Data */}
                    <Divider label="Business Master Data" />

                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
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
                                navigate("/cuplump/suppliers");
                            }}
                        />

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
                                navigate("/cuplump/rubber-types");
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
                        style={{ display: "flex", alignItems: "center", gap: 16 }}
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
                            การเปลี่ยนแปลงการตั้งค่าระบบจะถูกบันทึกใน Audit Log เพื่อความปลอดภัยและสามารถตรวจสอบย้อนหลังได้
                        </Text>
                    </Paper>
                </Stack>
            </Container>
        </div>
    );
}

// ===== SettingCard เดิม (ใช้ Mantine เต็ม ๆ) =====
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
            shadow: "rgba(37, 99, 235, 0.1)",
        },
        grape: {
            bg: "#f3e8ff",
            text: "#9333ea",
            border: "#d8b4fe",
            shadow: "rgba(147, 51, 234, 0.1)",
        },
        teal: {
            bg: "#f0fdfa",
            text: "#0d9488",
            border: "#99f6e4",
            shadow: "rgba(13, 148, 136, 0.1)",
        },
        green: {
            bg: "#f0fdf4",
            text: "#16a34a",
            border: "#bbf7d0",
            shadow: "rgba(22, 163, 74, 0.1)",
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
                    ? `0 10px 20px -5px ${theme.shadow}, 0 4px 6px -2px rgba(0,0,0,0.05)`
                    : "0 1px 3px rgba(0,0,0,0.05)",
                transform:
                    hover && !disabled ? "translateY(-2px)" : "translateY(0)",
                position: "relative",
                opacity: disabled ? 0.7 : 1,
                transition: "all 0.2s ease",
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