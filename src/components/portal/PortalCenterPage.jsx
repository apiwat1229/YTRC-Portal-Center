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
    Text
} from "@mantine/core";
import {
    IconCalendarTime,
    IconDropletHalf2,
    IconPackages,
    IconQrcode,
    IconSettings,
    IconTools,
    IconTruck,
    IconUsersGroup
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { can } from "../auth/permission";
import AccountInfoBlock from "../common/AccountInfoBlock";

export default function PortalCenterPage({
    auth,
    onLogout,
    onOpenPermissions,
    onOpenContactPortal,
    onOpenSystemPortal,
    onOpenCuplumpPortal
}) {
    const { user } = auth || {};
    const [activeApp, setActiveApp] = useState(null);

    const displayName = useMemo(() => {
        if (!user) return "";
        return (
            user.display_name ||
            [user.first_name, user.last_name].filter(Boolean).join(" ") ||
            user.username ||
            user.email
        );
    }, [user]);

    const canQR = can(user, "portal.app.qr.view");
    const canCuplump = can(user, "portal.app.cuplump.view");
    const canBooking = can(user, "portal.app.booking.view");
    const canTruckScale = can(user, "portal.app.truckscale.view");
    const canMaintenance = can(user, "portal.app.maintenance.view");
    const canStock = can(user, "portal.app.stock.view");
    const canContact = can(user, "portal.app.contact.view");
    const canSystemMenu = can(user, "portal.app.system_menu.view");
    const canManagePermissions =
        can(user, "portal.admin.permissions.manage") || user?.is_superuser;

    // ไม่ใช้ Header แล้ว → AppShell ไม่มี header
    return (
        <AppShell
            padding="md"
            styles={{
                main: {
                    backgroundColor: "#f5f7fb"
                }
            }}
        >
            <AppShell.Main>
                <Container size="lg" py="md">
                    <Stack gap="md">

                        {/* Account Block */}
                        <AccountInfoBlock user={user} onLogout={onLogout} />

                        {/* Cards */}
                        <Card withBorder radius="md" style={{ backgroundColor: "white" }}>
                            <Group justify="space-between" mb="xs">
                                <Text fw={600}>Applications</Text>
                            </Group>

                            <Text size="xs" c="dimmed" mb="sm">
                                เลือกระบบย่อยที่ต้องการใช้งานจาก YTRC Portal Center
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
                                    }}
                                />

                                <AppCardBig
                                    title="ระบบ Stock"
                                    description="Inventory / warehouse management."
                                    color="green"
                                    icon={IconPackages}
                                    active={activeApp === "stock"}
                                    disabled={!canStock}
                                    onClick={() => {
                                        if (!canStock) return;
                                        setActiveApp("stock");
                                    }}
                                />

                                <AppCardBig
                                    title="Contact Management"
                                    description="จัดการข้อมูลบุคคล บริษัท แผนก."
                                    color="indigo"
                                    icon={IconUsersGroup}
                                    active={activeApp === "contact"}
                                    disabled={!canContact}
                                    onClick={() => {
                                        if (!canContact) return;
                                        setActiveApp("contact");
                                        onOpenContactPortal?.();
                                    }}
                                />

                                <AppCardBig
                                    title="System Menu"
                                    description="ผู้ใช้, สิทธิ์, เมนู และตั้งค่าระบบ"
                                    color="red"
                                    icon={IconSettings}
                                    active={activeApp === "system"}
                                    disabled={!canSystemMenu}
                                    onClick={() => {
                                        if (!canSystemMenu) return;
                                        setActiveApp("system");
                                        onOpenSystemPortal?.();
                                    }}
                                />
                            </SimpleGrid>

                            <Divider my="md" />

                            <Box>
                                <Text size="xs" c="dimmed" mb={4}>
                                    Selected app:
                                </Text>
                                <Code fz={12}>
                                    {!activeApp
                                        ? "ยังไม่ได้เลือกแอปย่อย"
                                        : activeApp}
                                </Code>
                            </Box>
                        </Card>
                    </Stack>
                </Container>
            </AppShell.Main>
        </AppShell>
    );
}

function AppCardBig({ title, description, color, icon: Icon, active, disabled, onClick }) {
    const isActive = active && !disabled;

    return (
        <Card
            radius="md"
            withBorder
            onClick={() => {
                if (!disabled) onClick?.();
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
                transition: "all 120ms ease"
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
                        justifyContent: "center"
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