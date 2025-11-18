// src/components/portal/PortalCenterPage.jsx
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
    IconGridDots,
    IconLock,
    IconPackages,
    IconQrcode,
    IconSettings,
    IconTools,
    IconUser,
    IconUsersGroup,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { can } from "../auth/permission";

export default function PortalCenterPage({
    auth,
    onLogout,
    onOpenProfile,
    onOpenPermissions,
    onOpenContactPortal,
    onOpenSystemPortal,
}) {
    const { user } = auth || {};
    const [activeApp, setActiveApp] = useState(null);
    // 'qr' | 'maintenance' | 'stock' | 'contact' | 'system' | null

    const displayName = useMemo(() => {
        if (!user) return "";
        return (
            user.display_name ||
            [user.first_name, user.last_name].filter(Boolean).join(" ") ||
            user.username ||
            user.email
        );
    }, [user]);

    // ---------- สิทธิ์ของ user ----------
    const canQR = can(user, "portal.app.qr.view");
    const canMaintenance = can(user, "portal.app.maintenance.view");
    const canStock = can(user, "portal.app.stock.view");
    const canContact = can(user, "portal.app.contact.view");
    const canSystemMenu = can(user, "portal.app.system_menu.view");

    const canManagePermissions =
        can(user, "portal.admin.permissions.manage") || user?.is_superuser;

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
                        <IconGridDots size={20} />
                        <Text fw={600}>YTRC Portal Center</Text>
                    </Group>

                    <Group gap="sm">
                        <Text size="sm" c="dimmed">
                            {displayName}
                        </Text>

                        {canManagePermissions && (
                            <Button
                                variant="light"
                                size="xs"
                                leftSection={<IconLock size={14} />}
                                onClick={onOpenPermissions}
                            >
                                Permissions
                            </Button>
                        )}

                        <Button
                            variant="subtle"
                            size="xs"
                            leftSection={<IconUser size={14} />}
                            onClick={onOpenProfile}
                        >
                            Profile
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
                    {/* การ์ดต้อนรับผู้ใช้งาน */}
                    <Card withBorder radius="md" style={{ backgroundColor: "white" }}>
                        <Group justify="space-between" align="center">
                            <Stack gap={4}>
                                <Text fw={600} size="sm">
                                    สวัสดีคุณ {displayName || "-"}
                                </Text>
                                <Text size="xs" c="dimmed">
                                    คุณกำลังใช้งาน{" "}
                                    <Text component="span" fw={500}>
                                        YTRC Portal Center
                                    </Text>{" "}
                                    เพื่อเข้าถึงระบบภายใน เช่น QR Code, แจ้งซ่อม, ระบบ Stock,
                                    Contact Management และ System Menu
                                </Text>
                                <Group gap={8} mt={4}>
                                    {user?.department && (
                                        <Badge variant="light" color="teal" size="xs">
                                            Dept: {user.department}
                                        </Badge>
                                    )}
                                    {user?.position && (
                                        <Badge variant="light" color="blue" size="xs">
                                            Position: {user.position}
                                        </Badge>
                                    )}
                                    {user?.role && (
                                        <Badge variant="light" color="violet" size="xs">
                                            Role: {user.role}
                                        </Badge>
                                    )}
                                </Group>
                            </Stack>

                            <Stack gap="xs" align="flex-end">
                                <Text size="xs" c="dimmed">
                                    เข้าสู่ระบบด้วยบัญชี:
                                </Text>
                                <Text size="sm" fw={500}>
                                    {user?.email || "-"}
                                </Text>
                                <Group gap="xs" mt={4}>
                                    <Button
                                        variant="subtle"
                                        size="xs"
                                        leftSection={<IconUser size={14} />}
                                        onClick={onOpenProfile}
                                    >
                                        ดูโปรไฟล์
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
                            </Stack>
                        </Group>
                    </Card>

                    {/* Application cards */}
                    <Card withBorder radius="md" style={{ backgroundColor: "white" }}>
                        <Group justify="space-between" mb="xs">
                            <Text fw={600}>Applications</Text>
                            <Text size="xs" c="dimmed">
                                Back to all categories
                            </Text>
                        </Group>

                        <Text size="xs" c="dimmed" mb="sm">
                            เลือกระบบย่อยที่ต้องการใช้งานจาก YTRC Portal Center
                        </Text>

                        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mt="md">
                            {/* QR Code */}
                            <AppCardBig
                                title="QR Code"
                                description="Queue, booking tickets, truck receive QR and internal QR-based workflows."
                                color="cyan"
                                icon={IconQrcode}
                                active={activeApp === "qr"}
                                disabled={!canQR}
                                onClick={() => {
                                    if (!canQR) return;
                                    setActiveApp("qr");
                                    // TODO: ต่อหน้า QR Portal จริงในอนาคต
                                }}
                            />

                            {/* แจ้งซ่อม */}
                            <AppCardBig
                                title="แจ้งซ่อม"
                                description="Maintenance requests, breakdown logging, CM/PM tracking for machines and equipment."
                                color="orange"
                                icon={IconTools}
                                active={activeApp === "maintenance"}
                                disabled={!canMaintenance}
                                onClick={() => {
                                    if (!canMaintenance) return;
                                    setActiveApp("maintenance");
                                    // TODO: ต่อหน้า Maintenance Portal
                                }}
                            />

                            {/* ระบบ Stock */}
                            <AppCardBig
                                title="ระบบ Stock"
                                description="Inventory and warehouse management, stock levels, in-out transactions."
                                color="green"
                                icon={IconPackages}
                                active={activeApp === "stock"}
                                disabled={!canStock}
                                onClick={() => {
                                    if (!canStock) return;
                                    setActiveApp("stock");
                                    // TODO: ต่อหน้า Stock Portal
                                }}
                            />

                            {/* Contact Management */}
                            <AppCardBig
                                title="Contact Management"
                                description="จัดการข้อมูลบุคคล, บริษัท, แผนก, และช่องทางติดต่อที่เกี่ยวข้องกับ YTRC."
                                color="indigo"
                                icon={IconUsersGroup}
                                active={activeApp === "contact"}
                                disabled={!canContact}
                                onClick={() => {
                                    if (!canContact) return;
                                    setActiveApp("contact");
                                    onOpenContactPortal && onOpenContactPortal();
                                }}
                            />

                            {/* System Menu */}
                            <AppCardBig
                                title="System Menu"
                                description="ศูนย์กลางการตั้งค่าระบบ: ผู้ใช้, สิทธิ์, เมนู และโครงสร้างระบบหลัก."
                                color="red"
                                icon={IconSettings}
                                active={activeApp === "system"}
                                disabled={!canSystemMenu}
                                onClick={() => {
                                    if (!canSystemMenu) return;
                                    setActiveApp("system");
                                    onOpenSystemPortal && onOpenSystemPortal();
                                }}
                            />
                        </SimpleGrid>

                        <Divider my="md" />

                        <Box>
                            <Text size="xs" c="dimmed" mb={4}>
                                Selected app:
                            </Text>
                            <Code fz={12}>
                                {activeApp === "qr" &&
                                    "QR Code — ระบบคิว / บัตรคิว / Ticket / Truck QR"}
                                {activeApp === "maintenance" &&
                                    "แจ้งซ่อม — ระบบ Maintenance Request / CM / PM"}
                                {activeApp === "stock" &&
                                    "ระบบ Stock — Inventory / Warehouse / การเบิก-รับสินค้า"}
                                {activeApp === "contact" &&
                                    "Contact Management — ระบบจัดการข้อมูลบุคคล บริษัท และ Contact ที่เกี่ยวข้อง"}
                                {activeApp === "system" &&
                                    "System Menu — ศูนย์กลางการตั้งค่าระบบ เช่น User, Permissions, Menu, Roles"}
                                {!activeApp &&
                                    "ยังไม่ได้เลือกแอปย่อย (คลิกที่การ์ดด้านบนเพื่อเริ่มใช้งาน)"}
                            </Code>
                        </Box>

                        <Text size="xs" c="dimmed" mt="xs">
                            * บางแอปอาจถูกปิดการใช้งานขึ้นกับสิทธิ์การเข้าถึงของบัญชีผู้ใช้
                        </Text>
                    </Card>
                </Stack>
            </Container>
        </AppShell>
    );
}

/**
 * การ์ดแอปแบบใหญ่ (inspired by ActionsGrid แต่ใหญ่กว่า)
 * - ถ้า disabled = true จะจางลง, cursor เป็น not-allowed และไม่เรียก onClick
 */
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