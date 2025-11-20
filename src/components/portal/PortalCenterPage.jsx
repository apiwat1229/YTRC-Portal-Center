// src/components/portal/PortalCenterPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    AppShell,
    Avatar,
    Badge,
    Box,
    Card,
    Container,
    Group,
    Indicator,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    Tooltip,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import {
    IconActivity,
    IconCalendarTime,
    IconCpu,
    IconDropletHalf2,
    IconLogout,
    IconPackages,
    IconQrcode,
    IconServer,
    IconSettings,
    IconTools,
    IconTruck,
    IconUsersGroup,
} from "@tabler/icons-react";

import { can } from "../auth/permission";
import SimplePageHeader from "../layout/SimplePageHeader";

// ---------------- Helper: Permission ----------------
function canView(user, permission) {
    return can(user, permission);
}

// ---------------- Sub-Component: Realtime Clock ----------------
function RealtimeClock() {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <Stack gap={0} align="flex-end" style={{ lineHeight: 1 }}>
            <Text
                size="lg"
                fw={700}
                style={{
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "-0.5px",
                }}
            >
                {date.toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </Text>
            <Text size="xs" c="dimmed" fw={500}>
                {date.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                })}
            </Text>
        </Stack>
    );
}

// ---------------- Sub-Component: Gradient Pill (DEPT / POSITION / ROLE) ----------------
function GradientPill({ label, value, from, to }) {
    if (!value) return null;

    return (
        <Box
            px="xs"
            py={4}
            style={{
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                backgroundImage: `linear-gradient(90deg, ${from}, ${to})`,
                color: "#0f172a",
                boxShadow: "0 0 18px rgba(148, 163, 184, 0.35)",
            }}
        >
            {label}: {value}
        </Box>
    );
}

// ---------------- Main Component ----------------
export default function PortalCenterPage({
    auth,
    onLogout,
    onOpenContactPortal,
    onOpenSystemPortal,
    onOpenCuplumpPortal,
}) {
    const { user } = auth || {};
    const navigate = useNavigate();
    const [activeApp, setActiveApp] = useState(null);

    // ชื่อที่โชว์ใน Header
    const displayName = useMemo(() => {
        if (!user) return "";
        return (
            user.display_name ||
            [user.first_name, user.last_name].filter(Boolean).join(" ") ||
            user.username ||
            user.email
        );
    }, [user]);

    // สิทธิ์ใช้งาน
    const canQR = canView(user, "portal.app.qr.view");
    const canCuplump = canView(user, "portal.app.cuplump.view");
    const canBooking = canView(user, "portal.app.booking.view");
    const canTruckScale = canView(user, "portal.app.truckscale.view");
    const canMaintenance = canView(user, "portal.app.maintenance.view");
    const canStock = canView(user, "portal.app.stock.view");
    const canContact = canView(user, "portal.app.contact.view");
    const canSystemMenu = canView(user, "portal.app.system_menu.view");

    // ---------------- Profile Modal ----------------
    const openProfileModal = () => {
        if (!user) return;

        modals.open({
            title: <Text fw={700}>User Profile</Text>,
            radius: "md",
            size: "lg",
            children: (
                <Stack gap="md">
                    {/* Header: Avatar + Name + Email */}
                    <Group align="center" gap="md">
                        <Avatar size={64} radius="xl" color="blue">
                            {displayName?.charAt(0)}
                        </Avatar>
                        <Stack gap={2}>
                            <Text fw={700} size="lg">
                                {displayName}
                            </Text>
                            {user.email && (
                                <Text size="xs" c="dimmed">
                                    {user.email}
                                </Text>
                            )}
                        </Stack>
                    </Group>

                    {/* Description */}
                    <Text size="xs" c="dimmed">
                        คุณกำลังใช้งาน{" "}
                        <Text component="span" fw={600}>
                            YTRC Portal Center
                        </Text>{" "}
                        เพื่อเข้าถึงระบบภายใน เช่น QR, Cuplump, Booking Queue,
                        TruckScale, แจ้งซ่อม, Stock, Contact Management และ System
                        Config ตามสิทธิ์การใช้งานของคุณ
                    </Text>

                    {/* Gradient Role Pills */}
                    <Group gap={8}>
                        <GradientPill
                            label="DEPT"
                            value={user?.department}
                            from="#bbf7d0"
                            to="#a5f3fc"
                        />
                        <GradientPill
                            label="POSITION"
                            value={user?.position}
                            from="#bfdbfe"
                            to="#e0f2fe"
                        />
                        <GradientPill
                            label="ROLE"
                            value={user?.role}
                            from="#ede9fe"
                            to="#e0f2fe"
                        />
                    </Group>

                    {/* Detail Grid */}
                    <SimpleGrid cols={2} mt="sm">
                        <Box p="xs" bg="gray.0" style={{ borderRadius: 8 }}>
                            <Text
                                size="xs"
                                c="dimmed"
                                tt="uppercase"
                                fw={700}
                                mb={4}
                            >
                                Username
                            </Text>
                            <Text size="sm" fw={500}>
                                {user?.username || "-"}
                            </Text>
                        </Box>

                        <Box p="xs" bg="gray.0" style={{ borderRadius: 8 }}>
                            <Text
                                size="xs"
                                c="dimmed"
                                tt="uppercase"
                                fw={700}
                                mb={4}
                            >
                                Department
                            </Text>
                            <Text size="sm" fw={500}>
                                {user?.department || "-"}
                            </Text>
                        </Box>

                        <Box p="xs" bg="gray.0" style={{ borderRadius: 8 }}>
                            <Text
                                size="xs"
                                c="dimmed"
                                tt="uppercase"
                                fw={700}
                                mb={4}
                            >
                                Position
                            </Text>
                            <Text size="sm" fw={500}>
                                {user?.position || "-"}
                            </Text>
                        </Box>

                        <Box p="xs" bg="gray.0" style={{ borderRadius: 8 }}>
                            <Text
                                size="xs"
                                c="dimmed"
                                tt="uppercase"
                                fw={700}
                                mb={4}
                            >
                                Role
                            </Text>
                            <Text size="sm" fw={500}>
                                {user?.role || "-"}
                            </Text>
                        </Box>
                    </SimpleGrid>

                    {/* Permissions summary (ถ้ามี) */}
                    {Array.isArray(user?.permissions) &&
                        user.permissions.length > 0 && (
                            <Box>
                                <Text
                                    size="xs"
                                    c="dimmed"
                                    mb={4}
                                    fw={600}
                                    tt="uppercase"
                                >
                                    Permissions ({user.permissions.length})
                                </Text>
                                <Group gap={6}>
                                    {user.permissions.slice(0, 6).map((p) => (
                                        <Badge
                                            key={p}
                                            size="xs"
                                            variant="light"
                                            color="gray"
                                        >
                                            {p}
                                        </Badge>
                                    ))}
                                    {user.permissions.length > 6 && (
                                        <Text size="xs" c="dimmed">
                                            + {user.permissions.length - 6} more
                                        </Text>
                                    )}
                                </Group>
                            </Box>
                        )}
                </Stack>
            ),
        });
    };

    // ---------------- Logout Confirm ----------------
    const openLogoutConfirm = () => {
        if (typeof onLogout !== "function") return;
        modals.openConfirmModal({
            title: "Confirm Logout",
            centered: true,
            children: <Text size="sm">คุณต้องการออกจากระบบใช่หรือไม่?</Text>,
            labels: { confirm: "Logout", cancel: "Cancel" },
            confirmProps: { color: "red" },
            onConfirm: onLogout,
        });
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f3f4f6",
                backgroundImage:
                    "radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.1) 0px, transparent 50%)",
                fontFamily: "'Outfit', system-ui, sans-serif",
            }}
        >
            {/* ===== Glass Titlebar Header (ใช้ร่วมกับ Electron / Web ก็ได้) ===== */}
            <SimplePageHeader

                glass={true}
                opacity={0.0}
                onMinimize={() => { }}
                onMaximize={() => { }}
                onClose={() => { }}
                compact={true}
            />

            <AppShell
                padding="md"
                styles={{ main: { backgroundColor: "transparent" } }}
            >
                <AppShell.Main>
                    <Container size="xl" py="md">
                        <Stack gap="xl">
                            {/* === HEADER SECTION (Hero ของ Portal เดิม) === */}
                            <Group justify="space-between" align="center">
                                <Group gap="md">
                                    <ThemeIcon
                                        size={48}
                                        radius="md"
                                        variant="gradient"
                                        gradient={{ from: "blue", to: "indigo", deg: 135 }}
                                    >
                                        <IconActivity size={28} />
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
                                            PORTAL CENTER
                                        </Text>
                                        <Text
                                            size="xs"
                                            fw={500}
                                            c="dimmed"
                                            tt="uppercase"
                                            style={{ letterSpacing: "1px" }}
                                        >
                                            YTRC Operations Hub
                                        </Text>
                                    </div>
                                </Group>

                                <Card
                                    padding="xs"
                                    radius={12}
                                    withBorder
                                    shadow="sm"
                                    bg="white"
                                    style={{
                                        paddingLeft: 20,
                                        paddingRight: 6,
                                    }}
                                >
                                    <Group gap="xl">
                                        <RealtimeClock />

                                        <div
                                            style={{
                                                height: 24,
                                                width: 1,
                                                backgroundColor: "#e2e8f0",
                                            }}
                                        />

                                        <Group gap="xs">
                                            <Group
                                                gap={8}
                                                style={{ cursor: "pointer" }}
                                                onClick={openProfileModal}
                                            >
                                                <div style={{ textAlign: "right" }}>
                                                    <Text
                                                        size="sm"
                                                        fw={600}
                                                        style={{ lineHeight: 1.2 }}
                                                    >
                                                        {displayName}
                                                    </Text>
                                                    <Text
                                                        size="xs"
                                                        c="dimmed"
                                                        style={{ lineHeight: 1 }}
                                                    >
                                                        {user?.role || "User"}
                                                    </Text>
                                                </div>
                                                <Indicator
                                                    position="bottom-end"
                                                    color="green"
                                                    offset={4}
                                                    size={10}
                                                    withBorder
                                                >
                                                    <Avatar
                                                        size={38}
                                                        radius="xl"
                                                        color="blue"
                                                        src={null}
                                                    >
                                                        {displayName?.charAt(0)}
                                                    </Avatar>
                                                </Indicator>
                                            </Group>

                                            <Tooltip label="Logout">
                                                <ThemeIcon
                                                    variant="subtle"
                                                    color="gray"
                                                    size="lg"
                                                    radius="xl"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={openLogoutConfirm}
                                                >
                                                    <IconLogout size={20} />
                                                </ThemeIcon>
                                            </Tooltip>
                                        </Group>
                                    </Group>
                                </Card>
                            </Group>

                            {/* === DASHBOARD GRID === */}
                            <Box>
                                <Group
                                    justify="space-between"
                                    mb="md"
                                    align="flex-end"
                                >
                                    <Text
                                        size="sm"
                                        fw={600}
                                        c="dimmed"
                                        tt="uppercase"
                                        style={{ letterSpacing: "0.5px" }}
                                    >
                                        Applications
                                    </Text>
                                </Group>

                                <SimpleGrid
                                    cols={{ base: 1, xs: 2, md: 3, lg: 4 }}
                                    spacing="lg"
                                >
                                    <AppWidget
                                        title="QR System"
                                        category="Gate Operations"
                                        icon={IconQrcode}
                                        color="cyan"
                                        status="Online"
                                        description="Manage queues, tickets & truck check-ins."
                                        active={activeApp === "qr"}
                                        disabled={!canQR}
                                        onClick={() => setActiveApp("qr")}
                                    />

                                    <AppWidget
                                        title="Cuplump Pool"
                                        category="Raw Material"
                                        icon={IconDropletHalf2}
                                        color="teal"
                                        status="Active"
                                        description="Purchasing, quality control & warehousing."
                                        active={activeApp === "cuplump"}
                                        disabled={!canCuplump}
                                        onClick={() => {
                                            setActiveApp("cuplump");
                                            onOpenCuplumpPortal?.();
                                        }}
                                    />

                                    <AppWidget
                                        title="Booking Queue"
                                        category="Logistics"
                                        icon={IconCalendarTime}
                                        color="indigo"
                                        status="Online"
                                        description="Truck slot booking & schedule management."
                                        active={activeApp === "booking"}
                                        disabled={!canBooking}
                                        onClick={() => setActiveApp("booking")}
                                    />

                                    <AppWidget
                                        title="Weight Scale"
                                        category="Weighing"
                                        icon={IconTruck}
                                        color="grape"
                                        status="Ready"
                                        description="Weight capture system & integration."
                                        active={activeApp === "truckscale"}
                                        disabled={!canTruckScale}
                                        onClick={() => setActiveApp("truckscale")}
                                    />

                                    <AppWidget
                                        title="Maintenance"
                                        category="Engineering"
                                        icon={IconTools}
                                        color="orange"
                                        status="Alert"
                                        description="CM/PM requests & breakdown tracking."
                                        alert
                                        active={activeApp === "maintenance"}
                                        disabled={!canMaintenance}
                                        onClick={() => setActiveApp("maintenance")}
                                    />

                                    <AppWidget
                                        title="Stock"
                                        category="Inventory"
                                        icon={IconPackages}
                                        color="green"
                                        status="Normal"
                                        description="Warehouse inventory & stock movements."
                                        active={activeApp === "stock"}
                                        disabled={!canStock}
                                        onClick={() => setActiveApp("stock")}
                                    />

                                    <AppWidget
                                        title="Contacts"
                                        category="CRM"
                                        icon={IconUsersGroup}
                                        color="blue"
                                        status="Online"
                                        description="Supplier & customer database."
                                        active={activeApp === "contact"}
                                        disabled={!canContact}
                                        onClick={() => {
                                            setActiveApp("contact");
                                            onOpenContactPortal?.();
                                        }}
                                    />

                                    <AppWidget
                                        title="System Settings"
                                        category="Admin"
                                        icon={IconSettings}
                                        color="red"
                                        status="Restricted"
                                        description="User permissions & global settings."
                                        active={activeApp === "system"}
                                        disabled={!canSystemMenu}
                                        onClick={() => {
                                            setActiveApp("system");
                                            onOpenSystemPortal?.();
                                            navigate("/system");
                                        }}
                                    />
                                </SimpleGrid>
                            </Box>

                            {/* === FOOTER STATUS BAR === */}
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
                                                    boxShadow:
                                                        "0 0 8px #22c55e",
                                                }}
                                            />
                                            <Text
                                                size="xs"
                                                fw={600}
                                                c="dimmed"
                                            >
                                                SYSTEM OPERATIONAL
                                            </Text>
                                        </Group>
                                        <Group gap={6}>
                                            <IconServer
                                                size={14}
                                                color="#94a3b8"
                                            />
                                            <Text
                                                size="xs"
                                                fw={600}
                                                c="dimmed"
                                            >
                                                v0.1.0-stable
                                            </Text>
                                        </Group>
                                        <Group gap={6}>
                                            <IconCpu
                                                size={14}
                                                color="#94a3b8"
                                            />
                                            <Text
                                                size="xs"
                                                fw={600}
                                                c="dimmed"
                                            >
                                                Latency: 24ms
                                            </Text>
                                        </Group>
                                    </Group>
                                    <Text size="xs" c="dimmed">
                                        © 2025 YTRC. All rights reserved.
                                    </Text>
                                </Group>
                            </Card>
                        </Stack>
                    </Container>
                </AppShell.Main>
            </AppShell>
        </div>
    );
}

// ---------------- Modern App Widget Component ----------------
function AppWidget({
    title,
    category,
    icon: Icon,
    color,
    status,
    description,
    active,
    disabled,
    onClick,
    alert,
}) {
    const [hovered, setHovered] = useState(false);

    const themeColor = `var(--mantine-color-${color}-6)`;

    return (
        <Card
            padding="lg"
            radius="lg"
            withBorder
            bg="white"
            onClick={() => !disabled && onClick?.()}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.6 : 1,
                transition:
                    "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                transform:
                    hovered && !disabled ? "translateY(-4px)" : "none",
                boxShadow:
                    hovered && !disabled
                        ? "0 18px 28px -12px rgba(15,23,42,0.18)"
                        : "0 1px 2px rgba(0,0,0,0.05)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <Group justify="space-between" align="flex-start" mb="md">
                <ThemeIcon
                    size={44}
                    radius={12}
                    variant="light"
                    color={color}
                    style={{
                        transition: "all 0.2s ease",
                        transform:
                            hovered && !disabled
                                ? "scale(1.05)"
                                : "scale(1)",
                    }}
                >
                    <Icon size={24} />
                </ThemeIcon>

                {!disabled && (
                    <Badge
                        variant="dot"
                        color={alert ? "orange" : "green"}
                        size="xs"
                        style={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                        }}
                    >
                        {status}
                    </Badge>
                )}
            </Group>

            <Stack gap={4}>
                <Text
                    size="xs"
                    fw={700}
                    c="dimmed"
                    tt="uppercase"
                    style={{ letterSpacing: "0.5px" }}
                >
                    {category}
                </Text>
                <Text
                    size="lg"
                    fw={700}
                    c="dark.8"
                    style={{ letterSpacing: "-0.3px" }}
                >
                    {title}
                </Text>
                <Text size="xs" c="dimmed" lineClamp={2} h={34}>
                    {description}
                </Text>
            </Stack>

            {/* Action bar */}
            <Group mt="md" justify="space-between" align="center">
                <div
                    style={{
                        height: 4,
                        flex: 1,
                        borderRadius: 2,
                        background: active ? themeColor : "#f1f5f9",
                        transition: "background 0.3s ease",
                    }}
                />

                <Text
                    size="xs"
                    fw={600}
                    c={color}
                    style={{
                        opacity: hovered && !disabled ? 1 : 0,
                        transform:
                            hovered && !disabled
                                ? "translateX(0)"
                                : "translateX(-5px)",
                        transition: "opacity 0.2s ease, transform 0.2s ease",
                        pointerEvents: "none",
                    }}
                >
                    Open App →
                </Text>
            </Group>
        </Card>
    );
}