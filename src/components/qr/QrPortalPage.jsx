// src/components/qr/QrPortalPage.jsx
import { useMemo, useState } from "react";

import {
    AppShell,
    Badge,
    Card,
    Container,
    Group,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import {
    IconQrcode,
    IconBuildingFactory2,
    IconBuildingWarehouse,
    IconDropletHalf2,
    IconFlask2,
    IconTruckDelivery,
} from "@tabler/icons-react";

import StatusFooterBar from "../common/StatusFooterBar";
import UserHeaderPanel from "../common/UserHeaderPanel";

/**
 * QR System – Portal หน้าแรก
 * เลือก Department หลัก:
 * 1. Shipping
 * 2. Raw Material Receiving
 * 3. Quality Assurance
 * 4. Production
 * 5. Warehouse
 */

export default function QrPortalPage({
    auth,
    onLogout,
    onBack,
    onNotificationsClick,
    notificationsCount = 0,
}) {
    const { user } = auth || {};
    const [activeDept, setActiveDept] = useState(null);

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

    const effectiveNotificationsCount = notificationsCount;

    // ===== Config department หลักใน QR System =====
    const departments = [
        {
            id: "shipping",
            title: "Shipping",
            category: "Gate Operations",
            description: "Truck dispatch, gate-out QR & shipment confirmation.",
            icon: IconTruckDelivery,
            color: "indigo",
            status: "Online",
            tag: "Outbound",
        },
        {
            id: "raw_material",
            title: "Raw Material Receiving",
            category: "Raw Material",
            description: "Gate-in, receiving QR tickets & cuplump yard tracking.",
            icon: IconDropletHalf2,
            color: "teal",
            status: "Online",
            tag: "Inbound",
        },
        {
            id: "qa",
            title: "Quality Assurance",
            category: "Laboratory",
            description: "QR for sample tracking, test results & approvals.",
            icon: IconFlask2,
            color: "grape",
            status: "Ready",
            tag: "QA Lab",
        },
        {
            id: "production",
            title: "Production",
            category: "Manufacturing",
            description: "Line tracking, WIP QR labels & process confirmation.",
            icon: IconBuildingFactory2,
            color: "orange",
            status: "Beta",
            tag: "In-plant",
        },
        {
            id: "warehouse",
            title: "Warehouse",
            category: "Inventory",
            description: "Finished goods, location labels & loading plan QR.",
            icon: IconBuildingWarehouse,
            color: "cyan",
            status: "Online",
            tag: "FG / Store",
        },
    ];

    const handleOpenDept = (dept) => {
        setActiveDept(dept.id);

        // ตอนนี้ยังไม่มี route detail แยก → โชว์ modal แจ้งว่ากำลังพัฒนา
        modals.open({
            title: `${dept.title} – QR Module`,
            centered: true,
            children: (
                <Stack gap="xs">
                    <Text size="sm">
                        หน้านี้จะเป็นศูนย์กลางสำหรับ{" "}
                        <b>{dept.title}</b> QR workflows.
                    </Text>
                    <Text size="sm" c="dimmed">
                        จะรองรับการสร้าง / สแกน / ติดตามสถานะ QR
                        สำหรับขั้นตอนงานในแผนกนี้ เช่น gate in/out,
                        sampling, pallet/tag tracking และ loading plan.
                    </Text>
                    <Text size="xs" c="dimmed">
                        (ยังอยู่ระหว่างออกแบบ UI/Flow รายละเอียด –
                        สามารถเชื่อม route ใหม่ได้ภายหลัง เช่น{" "}
                        <code>/qr/{dept.id}</code>)
                    </Text>
                </Stack>
            ),
        });
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f3f4f6",
                backgroundImage:
                    "radial-gradient(at 0% 0%, rgba(59,130,246,0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(139,92,246,0.1) 0px, transparent 50%)",
                fontFamily: "'Outfit', system-ui, sans-serif",
            }}
        >
            <AppShell
                padding="md"
                styles={{ main: { backgroundColor: "transparent" } }}
            >
                <AppShell.Main>
                    <Container size="xl" py="md">
                        <Stack gap="xl">
                            {/* ===== HEADER ===== */}
                            <Group justify="space-between" align="center">
                                <Group gap="md">
                                    <ThemeIcon
                                        size={48}
                                        radius="md"
                                        variant="gradient"
                                        gradient={{
                                            from: "cyan",
                                            to: "indigo",
                                            deg: 135,
                                        }}
                                    >
                                        <IconQrcode size={28} />
                                    </ThemeIcon>

                                    <div>
                                        <Text
                                            size="xl"
                                            fw={800}
                                            style={{
                                                letterSpacing: "-0.5px",
                                                lineHeight: 1.1,
                                                color: "#0f172a",
                                            }}
                                        >
                                            QR SYSTEM
                                        </Text>
                                        <Text
                                            size="xs"
                                            fw={500}
                                            c="dimmed"
                                            tt="uppercase"
                                            style={{ letterSpacing: "1px" }}
                                        >
                                            Unified QR Workflows for YTRC
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

                            {/* ===== SUBHEADER ===== */}
                            <Group justify="space-between" align="center">
                                <Stack gap={2}>
                                    <Text size="sm" c="dimmed">
                                        เลือก Department เพื่อเข้าใช้งาน QR workflows
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        ออกแบบให้รองรับทั้ง{" "}
                                        <b>Truck Queue / Gate / Lab / FG Warehouse</b>{" "}
                                        ใน ecosystem เดียวกัน
                                    </Text>
                                </Stack>
                                <Badge
                                    size="sm"
                                    radius="xl"
                                    variant="light"
                                    color="cyan"
                                >
                                    Phase 1 – Portal Design
                                </Badge>
                            </Group>

                            {/* ===== DEPARTMENT GRID ===== */}
                            <SimpleGrid
                                cols={{ base: 1, sm: 2, md: 3 }}
                                spacing="lg"
                            >
                                {departments.map((dept) => (
                                    <DeptCard
                                        key={dept.id}
                                        dept={dept}
                                        active={activeDept === dept.id}
                                        onClick={() => handleOpenDept(dept)}
                                    />
                                ))}
                            </SimpleGrid>

                            {/* FOOTER STATUS BAR */}
                            <StatusFooterBar
                                statusLabel="QR Service Online"
                                version="v0.1.0"
                                latency="19ms"
                            />
                        </Stack>
                    </Container>
                </AppShell.Main>
            </AppShell>
        </div>
    );
}

/* ===== Department Card Component ===== */
function DeptCard({ dept, active, onClick }) {
    const [hovered, setHovered] = useState(false);
    const Icon = dept.icon;
    const color = dept.color || "blue";
    const themeColor = `var(--mantine-color-${color}-6)`;

    return (
        <Card
            padding="lg"
            radius={18}
            withBorder
            bg="white"
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                cursor: "pointer",
                transition: "all 0.2s ease-out",
                transform:
                    hovered ? "translateY(-4px)" : "translateY(0)",
                boxShadow: hovered
                    ? "0 18px 32px -16px rgba(15,23,42,0.25)"
                    : "0 1px 3px rgba(15,23,42,0.12)",
                position: "relative",
                overflow: "hidden",
                background:
                    "radial-gradient(circle at 0 0, rgba(148,163,184,0.12), transparent 55%), #ffffff",
            }}
        >
            {/* mini gradient bar ด้านบน */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    background:
                        hovered || active
                            ? "linear-gradient(135deg, rgba(56,189,248,0.12), rgba(129,140,248,0.14))"
                            : "transparent",
                    opacity: 1,
                    transition: "background 0.2s ease-out",
                }}
            />

            <Stack gap="sm" style={{ position: "relative" }}>
                <Group justify="space-between" align="flex-start">
                    <ThemeIcon
                        size={46}
                        radius={14}
                        variant="light"
                        color={color}
                        style={{
                            backdropFilter: "blur(8px)",
                            backgroundColor: "rgba(248,250,252,0.9)",
                            boxShadow:
                                "0 10px 25px -12px rgba(15,23,42,0.35)",
                            transform:
                                hovered || active
                                    ? "scale(1.05)"
                                    : "scale(1)",
                            transition:
                                "transform 0.2s ease-out, box-shadow 0.2s ease-out",
                        }}
                    >
                        <Icon size={24} />
                    </ThemeIcon>

                    <Stack gap={4} align="flex-end">
                        <Badge
                            size="xs"
                            radius="xl"
                            variant="outline"
                            color={color}
                        >
                            {dept.tag || "Module"}
                        </Badge>
                        <Badge
                            size="xs"
                            variant="dot"
                            color={
                                dept.status === "Alert" ? "orange" : "green"
                            }
                        >
                            {dept.status}
                        </Badge>
                    </Stack>
                </Group>

                <Stack gap={4}>
                    {dept.category && (
                        <Text
                            size="xs"
                            c="dimmed"
                            tt="uppercase"
                            fw={600}
                            style={{ letterSpacing: "0.1em" }}
                        >
                            {dept.category}
                        </Text>
                    )}
                    <Text
                        size="lg"
                        fw={700}
                        style={{
                            letterSpacing: "-0.02em",
                            color: "#0f172a",
                        }}
                    >
                        {dept.title}
                    </Text>
                    {dept.description && (
                        <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>
                            {dept.description}
                        </Text>
                    )}
                </Stack>

                {/* bottom indicator */}
                <Group justify="space-between" align="center" mt="sm">
                    <div
                        style={{
                            height: 4,
                            flex: 1,
                            borderRadius: 999,
                            background:
                                active || hovered
                                    ? themeColor
                                    : "#e5e7eb",
                            transition: "background 0.25s ease",
                        }}
                    />
                    <Text
                        size="xs"
                        fw={600}
                        c={color}
                        style={{
                            marginLeft: 8,
                            opacity: hovered ? 1 : 0,
                            transform: hovered
                                ? "translateX(0)"
                                : "translateX(-6px)",
                            transition:
                                "opacity 0.18s ease, transform 0.18s ease",
                        }}
                    >
                        Open module →
                    </Text>
                </Group>
            </Stack>
        </Card>
    );
}