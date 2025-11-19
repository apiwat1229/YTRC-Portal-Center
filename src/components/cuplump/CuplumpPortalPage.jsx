// src/components/cuplump/CuplumpPortalPage.jsx
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
    IconArrowLeft,
    IconDropletHalf2,
    IconReportAnalytics,
    IconScale,
    IconTruck,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { can } from "../auth/permission";
import AccountInfoBlock from "../common/AccountInfoBlock";

export default function CuplumpPortalPage({
    auth,
    onLogout,
    onBack,
    onOpenProfile, // ✅ ใช้สำหรับปุ่ม "ดูโปรไฟล์"
}) {
    const { user } = auth || {};
    const [activeModule, setActiveModule] = useState(null);
    // 'receive' | 'quality' | 'warehouse' | 'reports' | null

    const displayName = useMemo(() => {
        if (!user) return "";
        return (
            user.display_name ||
            [user.first_name, user.last_name].filter(Boolean).join(" ") ||
            user.username ||
            user.email
        );
    }, [user]);

    // เตรียม key สำหรับ permission (Aui จะไป map เองฝั่ง backend)
    const canReceive =
        can(user, "portal.cuplump.receive.view") || user?.is_superuser;
    const canQuality =
        can(user, "portal.cuplump.quality.view") || user?.is_superuser;
    const canWarehouse =
        can(user, "portal.cuplump.warehouse.view") || user?.is_superuser;
    const canReports =
        can(user, "portal.cuplump.reports.view") || user?.is_superuser;

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
                        <IconDropletHalf2 size={20} />
                        <Text fw={600}>Cuplump Management</Text>
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
                    {/* ✅ Header / user info ใช้ AccountInfoBlock (reuse) */}
                    <AccountInfoBlock
                        user={user}
                        onOpenProfile={onOpenProfile}
                        onLogout={onLogout}
                        description={
                            "คุณกำลังใช้งาน Cuplump Management Center สำหรับบริหารจัดการยางก้อนถ้วย (Cuplump) ครบวงจร ตั้งแต่รับซื้อหน้าโรงงาน ตรวจคุณภาพ ชั่งน้ำหนัก จัดเก็บคลัง และรายงานข้อมูล เชื่อมต่อกับระบบอื่นใน YTRC Portal Center"
                        }
                    />

                    {/* Cuplump modules */}
                    <Card withBorder radius="md" style={{ backgroundColor: "white" }}>
                        <Group justify="space-between" mb="xs">
                            <Group gap="xs" align="center">
                                <Text fw={600}>Cuplump applications</Text>
                                <Badge size="xs" radius="lg" variant="light" color="teal">
                                    CUPLUMP HUB
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
                            เลือก module สำหรับจัดการกระบวนการต่าง ๆ ของ Cuplump
                            ตั้งแต่รับซื้อจนถึงรายงาน
                        </Text>

                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mt="md">
                            {/* รับซื้อ / Truck & Scale */}
                            <CuplumpAppCard
                                title="Receive & TruckScale"
                                description="บันทึกรับซื้อ ยางก้อนถ้วย ตรวจเอกสารรถ ชั่งน้ำหนักเข้า–ออก และผูกกับคิว."
                                color="teal"
                                icon={IconTruck}
                                active={activeModule === "receive"}
                                disabled={!canReceive}
                                onClick={() => {
                                    if (!canReceive) return;
                                    setActiveModule("receive");
                                    console.log("[Cuplump] go to Receive & TruckScale");
                                }}
                            />

                            {/* Quality & grading */}
                            <CuplumpAppCard
                                title="Quality & Grading"
                                description="บันทึกผลตรวจ DRC, สิ่งสกปรก, grading และเชื่อมกับบิลรับซื้อ."
                                color="cyan"
                                icon={IconDropletHalf2}
                                active={activeModule === "quality"}
                                disabled={!canQuality}
                                onClick={() => {
                                    if (!canQuality) return;
                                    setActiveModule("quality");
                                    console.log("[Cuplump] go to Quality & Grading");
                                }}
                            />

                            {/* Warehouse / Stock */}
                            <CuplumpAppCard
                                title="Warehouse / Stock"
                                description="ติดตามสต๊อก Cuplump ในคลัง, เบิก–โอน–ตัดสต๊อก และ mapping ไปยัง FG."
                                color="indigo"
                                icon={IconScale}
                                active={activeModule === "warehouse"}
                                disabled={!canWarehouse}
                                onClick={() => {
                                    if (!canWarehouse) return;
                                    setActiveModule("warehouse");
                                    console.log("[Cuplump] go to Warehouse / Stock");
                                }}
                            />

                            {/* Reports & analytics */}
                            <CuplumpAppCard
                                title="Reports & Analytics"
                                description="ดูรายงานปริมาณรับซื้อ, DRC เฉลี่ย, สต๊อกคงเหลือ และ dashboard Cuplump."
                                color="grape"
                                icon={IconReportAnalytics}
                                active={activeModule === "reports"}
                                disabled={!canReports}
                                onClick={() => {
                                    if (!canReports) return;
                                    setActiveModule("reports");
                                    console.log("[Cuplump] go to Reports & Analytics");
                                }}
                            />
                        </SimpleGrid>

                        <Divider my="md" />

                        <Box>
                            <Text size="xs" c="dimmed" mb={4}>
                                Selected cuplump module:
                            </Text>
                            <Code fz={12}>
                                {activeModule === "receive" &&
                                    "Receive & TruckScale — รับซื้อ, ตรวจรถ, ชั่งน้ำหนัก และผูกกับคิว"}
                                {activeModule === "quality" &&
                                    "Quality & Grading — จัดการตรวจคุณภาพและเกรดยางก้อนถ้วย"}
                                {activeModule === "warehouse" &&
                                    "Warehouse / Stock — จัดการคลัง Cuplump และสต๊อกเคลื่อนไหว"}
                                {activeModule === "reports" &&
                                    "Reports & Analytics — รายงานและ dashboard ข้อมูล Cuplump"}
                                {!activeModule &&
                                    "ยังไม่ได้เลือก module (คลิกที่การ์ดด้านบนเพื่อเริ่มจัดการ Cuplump)"}
                            </Code>
                        </Box>

                        <Text size="xs" c="dimmed" mt="xs">
                            * บาง module อาจถูกปิดการใช้งานตามสิทธิ์ของบัญชีผู้ใช้
                        </Text>
                    </Card>
                </Stack>
            </Container>
        </AppShell>
    );
}

function CuplumpAppCard({
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
                        backgroundColor: `var(--mantine-color-${color}-0, #ecfeff)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Icon
                        size={24}
                        color={`var(--mantine-color-${color}-6, #0f766e)`}
                    />
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