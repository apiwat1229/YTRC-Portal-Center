// src/components/portal/PortalCenterPage.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    AppShell,
    Container,
    Group,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import {
    IconActivity,
    IconCalendarTime,
    IconDropletHalf2,
    IconPackages,
    IconQrcode,
    IconSettings,
    IconTools,
    IconTruck,
    IconUsersGroup,
} from "@tabler/icons-react";

import { can } from "../auth/permission";
import StatusFooterBar from "../common/StatusFooterBar";
import UserHeaderPanel from "../common/UserHeaderPanel";
import AppWidget from "./AppWidget";

// ---------------- Helper: Permission ----------------
function canView(user, permission) {
    return can(user, permission);
}

export default function PortalCenterPage({
    auth,
    onLogout,
    onBack,
    onNotificationsClick,
    notificationsCount = 1,
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

    // ===== สิทธิ์ใช้งานแต่ละแอป =====
    const canQR = canView(user, "portal.app.qr.view");
    const canCuplump = canView(user, "portal.app.cuplump.view");
    const canBooking = canView(user, "portal.app.booking.view");
    const canTruckScale = canView(user, "portal.app.truckscale.view");
    const canMaintenance = canView(user, "portal.app.maintenance.view");
    const canStock = canView(user, "portal.app.stock.view");
    const canContact = canView(user, "portal.app.contact.view");
    const canSystemMenu = canView(user, "portal.app.system_menu.view");

    // ===== config แอปทั้งหมดในหน้า =====
    const apps = [
        {
            id: "qr",
            title: "QR System",
            category: "Gate Operations",
            icon: IconQrcode,
            color: "cyan",
            status: "Online",
            description: "Manage queues, tickets & truck check-ins.",
            canAccess: canQR,
            path: "/qr",            // เปลี่ยนเป็น route จริงของโปรเจกต์
        },
        {
            id: "cuplump",
            title: "Cuplump Pool",
            category: "Raw Material",
            icon: IconDropletHalf2,
            color: "teal",
            status: "Active",
            description: "Purchasing, quality control & warehousing.",
            canAccess: canCuplump,
            path: "/cuplump",
            extra: () => onOpenCuplumpPortal?.(),
        },
        {
            id: "booking",
            title: "Booking Queue",
            category: "Logistics",
            icon: IconCalendarTime,
            color: "indigo",
            status: "Online",
            description: "Truck slot booking & schedule management.",
            canAccess: canBooking,
            path: "/booking",
        },
        {
            id: "truckscale",
            title: "Truck Scale",
            category: "Weighing",
            icon: IconTruck,
            color: "grape",
            status: "Ready",
            description: "Weight capture system & integration.",
            canAccess: canTruckScale,
            path: "/truckscale",
        },
        {
            id: "maintenance",
            title: "Maintenance",
            category: "Engineering",
            icon: IconTools,
            color: "orange",
            status: "Alert",
            description: "CM/PM requests & breakdown tracking.",
            alert: true,
            canAccess: canMaintenance,
            path: "/maintenance",
        },
        {
            id: "stock",
            title: "Stock",
            category: "Inventory",
            icon: IconPackages,
            color: "green",
            status: "Normal",
            description: "Warehouse inventory & stock movements.",
            canAccess: canStock,
            path: "/stock",
        },
        {
            id: "contacts",
            title: "Contacts",
            category: "CRM",
            icon: IconUsersGroup,
            color: "blue",
            status: "Online",
            description: "Supplier & customer database.",
            canAccess: canContact,
            path: "/contacts",
            extra: () => onOpenContactPortal?.(),
        },
        {
            id: "system",
            title: "System Settings",
            category: "Admin",
            icon: IconSettings,
            color: "red",
            status: "Restricted",
            description: "User permissions & global settings.",
            canAccess: canSystemMenu,
            path: "/system",
            extra: () => onOpenSystemPortal?.(),
        },
    ];

    // ===== เวลา click การ์ดแต่ละตัว =====
    const handleOpenApp = (app) => {
        if (!app.canAccess) {
            modals.open({
                title: "Permission denied",
                centered: true,
                children: (
                    <Text size="sm">
                        คุณไม่มีสิทธิ์เข้าถึงโมดูล <b>{app.title}</b> กรุณาติดต่อผู้ดูแลระบบ
                    </Text>
                ),
            });
            return;
        }

        setActiveApp(app.id);

        // callback พิเศษ (ถ้ามี)
        app.extra?.();

        // route ไป path ที่กำหนด (ถ้ามี)
        if (app.path) {
            navigate(app.path);
        }
    };

    const effectiveNotificationsCount = notificationsCount;

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
            <AppShell padding="md" styles={{ main: { backgroundColor: "transparent" } }}>
                <AppShell.Main>
                    <Container size="xl" py="md">
                        <Stack gap="xl">
                            {/* ================= HEADER ================= */}
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
                                            style={{ letterSpacing: "-0.5px", lineHeight: 1.1 }}
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

                                {/* Header ขวา: เวลา + ชื่อ + ปุ่ม Back / Noti / Logout */}
                                <UserHeaderPanel
                                    user={user}
                                    displayName={displayName}
                                    onBackClick={onBack}
                                    onNotificationsClick={onNotificationsClick}
                                    onLogout={onLogout}
                                    notificationsCount={effectiveNotificationsCount}
                                />
                            </Group>

                            {/* ================= APP GRID ================= */}
                            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
                                {apps.map((app) => (
                                    <AppWidget
                                        key={app.id}
                                        title={app.title}
                                        category={app.category}
                                        icon={app.icon}
                                        color={app.color}
                                        status={app.status}
                                        description={app.description}
                                        alert={app.alert}
                                        active={activeApp === app.id}
                                        disabled={!app.canAccess}
                                        onClick={() => handleOpenApp(app)}
                                    />
                                ))}
                            </SimpleGrid>

                            {/* ================= FOOTER ================= */}
                            <StatusFooterBar
                                statusLabel="Service Online"
                                version="v0.1.0"
                                latency="21ms"
                            />
                        </Stack>
                    </Container>
                </AppShell.Main>
            </AppShell>
        </div>
    );
}