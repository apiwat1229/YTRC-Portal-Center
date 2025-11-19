// src/components/portal/PortalCenterPage.jsx
import {
    AppShell,
    Badge,
    Box,
    Card,
    Code,
    Container,
    Divider,
    Group,
    SimpleGrid,
    Stack,
    Text,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import {
    IconCalendarTime,
    IconDropletHalf2,
    IconPackages,
    IconQrcode,
    IconSettings,
    IconTools,
    IconTruck,
    IconUsersGroup,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { can } from "../auth/permission";
import AccountInfoBlock from "../common/AccountInfoBlock";

// helper: เรียก can แบบสั้น ๆ
function canView(user, required) {
    return can(user, required);
}

export default function PortalCenterPage({
    auth,
    onLogout,
    onOpenPermissions,
    onOpenContactPortal,
    onOpenSystemPortal,
    onOpenCuplumpPortal,
}) {
    const { user } = auth || {};
    const [activeApp, setActiveApp] = useState(null);
    const navigate = useNavigate();

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

    const openProfileModal = () => {
        const name = displayName || user?.username || user?.email || "";
        modals.open({
            title: "ข้อมูลบัญชีผู้ใช้งาน",
            radius: "md",
            size: "lg",
            children: (
                <Stack gap="sm">
                    <Stack gap={2}>
                        <Text fw={600} size="sm">
                            {name || "-"}
                        </Text>
                        {user?.email && (
                            <Text size="xs" c="dimmed">
                                {user.email}
                            </Text>
                        )}
                    </Stack>

                    <Group gap={8}>
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

                    <Text size="xs" c="dimmed">
                        บัญชีนี้ใช้สำหรับเข้าถึง Portal ต่าง ๆ ของ YTRC เช่น QR, Cuplump, Booking
                        Queue, TruckScale, Contact Management และ System Menu ตามสิทธิ์ที่ได้รับ
                    </Text>
                </Stack>
            ),
        });
    };

    const openLogoutConfirm = () => {
        if (typeof onLogout !== "function") return;
        modals.openConfirmModal({
            title: "ออกจากระบบ",
            centered: true,
            children: (
                <Text size="sm">
                    คุณต้องการออกจากระบบ{" "}
                    <Text component="span" fw={600}>
                        YTRC Portal Center
                    </Text>{" "}
                    ใช่หรือไม่?
                </Text>
            ),
            labels: { confirm: "ยืนยันออกจากระบบ", cancel: "ยกเลิก" },
            confirmProps: { color: "red" },
            onConfirm: () => onLogout(),
        });
    };

    // แปลง activeApp → ข้อความรายละเอียด
    const selectedDescription = useMemo(() => {
        switch (activeApp) {
            case "qr":
                return "QR Code — ระบบคิว / บัตรคิว / Ticket / Truck QR และ workflow ที่อิงกับ QR ภายในโรงงาน";
            case "cuplump":
                return "Cuplump Management — บริหารจัดการยางก้อนถ้วย: รับซื้อ, Quality, Warehouse, Reports แบบครบวงจร";
            case "booking":
                return "Booking Queue — จัดการคิวการส่งของ / Truck booking สำหรับโรงงาน พร้อมจัดสรรช่วงเวลาเข้า–ออก";
            case "truckscale":
                return "TruckScale — ระบบชั่งน้ำหนักรถเข้า–ออก และเชื่อมโยงกับคิว, บิล และเอกสารอื่น ๆ";
            case "maintenance":
                return "แจ้งซ่อม — Maintenance Request / Breakdown logging / CM / PM สำหรับเครื่องจักรและอุปกรณ์";
            case "stock":
                return "ระบบ Stock — Inventory & Warehouse management, สต็อกสินค้า, การรับ–จ่าย และการติดตามจำนวนคงเหลือ";
            case "contact":
                return "Contact Management — ระบบจัดการข้อมูลบุคคล บริษัท แผนก และช่องทางติดต่อที่เกี่ยวข้องกับ YTRC";
            case "system":
                return "System Menu — ศูนย์กลางการตั้งค่าระบบ: ผู้ใช้, สิทธิ์ (Permissions), เมนู และโครงสร้างระบบหลัก";
            default:
                return "ยังไม่ได้เลือกแอปย่อย (คลิกที่การ์ดด้านบนเพื่อเริ่มใช้งาน)";
        }
    }, [activeApp]);

    return (
        <div className="app-bg">
            <AppShell
                padding="md"
                styles={{
                    main: {
                        backgroundColor: "transparent", // ปล่อยให้เห็น gradient จาก .app-bg
                    },
                }}
            >
                <AppShell.Main>
                    <Container size="lg" py="md">
                        <Stack gap="md">
                            {/* ข้อมูล user */}
                            <AccountInfoBlock
                                user={user}
                                onLogout={openLogoutConfirm}
                                onOpenProfile={openProfileModal}
                            />

                            {/* การ์ด Applications */}
                            <Card withBorder radius="md" style={{ backgroundColor: "white" }}>
                                <Group justify="space-between" mb="xs">
                                    <Text fw={600}>Applications</Text>
                                    <Text size="xs" c="dimmed">
                                        เลือกระบบที่ต้องการใช้งานจาก Portal นี้
                                    </Text>
                                </Group>

                                <Text size="xs" c="dimmed" mb="sm">
                                    คลิกเลือกแอปย่อยเพื่อดูรายละเอียด และไปยังระบบนั้น ๆ
                                </Text>

                                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mt="md">
                                    <AppCardBig
                                        title="QR Code"
                                        description="Queue, booking tickets, truck receive QR และ internal QR-based workflows."
                                        color="cyan"
                                        icon={IconQrcode}
                                        active={activeApp === "qr"}
                                        disabled={!canQR}
                                        onClick={() => {
                                            if (!canQR) return;
                                            setActiveApp("qr");
                                            // navigate("/qr");
                                        }}
                                    />

                                    <AppCardBig
                                        title="Cuplump Management"
                                        description="บริหารจัดการยางก้อนถ้วย: รับซื้อ, Quality, Warehouse และ Reports."
                                        color="teal"
                                        icon={IconDropletHalf2}
                                        active={activeApp === "cuplump"}
                                        disabled={!canCuplump}
                                        onClick={() => {
                                            if (!canCuplump) return;
                                            setActiveApp("cuplump");
                                            onOpenCuplumpPortal?.();
                                        }}
                                    />

                                    <AppCardBig
                                        title="Booking Queue"
                                        description="จัดการคิวการส่งของ / Truck booking สำหรับโรงงาน."
                                        color="indigo"
                                        icon={IconCalendarTime}
                                        active={activeApp === "booking"}
                                        disabled={!canBooking}
                                        onClick={() => {
                                            if (!canBooking) return;
                                            setActiveApp("booking");
                                            // navigate("/booking");
                                        }}
                                    />

                                    <AppCardBig
                                        title="TruckScale"
                                        description="จัดการชั่งน้ำหนักรถเข้า–ออก และโยงกับคิว / บิล."
                                        color="grape"
                                        icon={IconTruck}
                                        active={activeApp === "truckscale"}
                                        disabled={!canTruckScale}
                                        onClick={() => {
                                            if (!canTruckScale) return;
                                            setActiveApp("truckscale");
                                            // navigate("/truckscale");
                                        }}
                                    />

                                    <AppCardBig
                                        title="แจ้งซ่อม"
                                        description="Maintenance requests, breakdown logging, CM/PM tracking."
                                        color="orange"
                                        icon={IconTools}
                                        active={activeApp === "maintenance"}
                                        disabled={!canMaintenance}
                                        onClick={() => {
                                            if (!canMaintenance) return;
                                            setActiveApp("maintenance");
                                            // navigate("/maintenance");
                                        }}
                                    />

                                    <AppCardBig
                                        title="ระบบ Stock"
                                        description="Inventory และ warehouse management."
                                        color="green"
                                        icon={IconPackages}
                                        active={activeApp === "stock"}
                                        disabled={!canStock}
                                        onClick={() => {
                                            if (!canStock) return;
                                            setActiveApp("stock");
                                            // navigate("/stock");
                                        }}
                                    />

                                    <AppCardBig
                                        title="Contact Management"
                                        description="จัดการข้อมูลบุคคล บริษัท แผนก และช่องทางติดต่อ."
                                        color="indigo"
                                        icon={IconUsersGroup}
                                        active={activeApp === "contact"}
                                        disabled={!canContact}
                                        onClick={() => {
                                            if (!canContact) return;
                                            setActiveApp("contact");
                                            onOpenContactPortal?.();
                                            // navigate("/contact");
                                        }}
                                    />

                                    <AppCardBig
                                        title="System Menu"
                                        description="ผู้ใช้, สิทธิ์, เมนู และโครงสร้างระบบหลัก."
                                        color="red"
                                        icon={IconSettings}
                                        active={activeApp === "system"}
                                        disabled={!canSystemMenu}
                                        onClick={() => {
                                            if (!canSystemMenu) return;
                                            setActiveApp("system");
                                            onOpenSystemPortal?.();
                                            navigate("/system");
                                        }}
                                    />
                                </SimpleGrid>

                                <Divider my="md" />

                                <Box>
                                    <Text size="xs" c="dimmed" mb={4}>
                                        Selected app:
                                    </Text>
                                    <Code fz={12}>{selectedDescription}</Code>
                                </Box>

                                <Text size="xs" c="dimmed" mt="xs">
                                    * บางแอปอาจถูกปิดการใช้งานขึ้นกับสิทธิ์การเข้าถึงของบัญชีผู้ใช้
                                </Text>
                            </Card>
                        </Stack>
                    </Container>
                </AppShell.Main>
            </AppShell>
        </div>
    );
}

function AppCardBig({
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