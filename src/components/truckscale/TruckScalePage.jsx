// src/components/truckscale/TruckScalePage.jsx
import {
    AppShell,
    Container,
    Group,
    Stack,
    Tabs,
    Text,
    ThemeIcon,
} from "@mantine/core";
import { IconScale } from "@tabler/icons-react";
import { useMemo, useState } from "react";

import UserHeaderPanel from "../common/UserHeaderPanel";
import BookingCheckInTab from "./BookingCheckInTab";
import WeightScaleOutTab from "./WeightScaleOutTab";
import WeightScaleInTab from "./WeightScaleInTab";
import WeightSummaryTab from "./WeightSummaryTab";

export default function TruckScalePage({
    auth,
    onLogout,
    onBack,
    onNotificationsClick,
    notificationsCount = 1,
}) {
    const { user } = auth || {};
    const [activeTab, setActiveTab] = useState("checkin");

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
            <AppShell padding="md" styles={{ main: { backgroundColor: "transparent" } }}>
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
                                        gradient={{ from: "blue", to: "indigo", deg: 135 }}
                                    >
                                        <IconScale size={28} />
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
                                            TRUCK SCALE
                                        </Text>
                                        <Text size="xs" fw={500} c="dimmed" tt="uppercase"
                                            style={{ letterSpacing: "1px" }}>
                                            Operations – Weighing & Drain Monitor
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

                            {/* ===== TABS ===== */}
                            <Tabs
                                value={activeTab}
                                onChange={setActiveTab}
                                keepMounted={false}
                                radius="md"
                                styles={{
                                    list: {
                                        borderBottom: "1px solid #e5e7eb",
                                    },
                                    tab: {
                                        fontSize: 14,
                                        fontWeight: 600,
                                        paddingTop: 10,
                                        paddingBottom: 10,
                                        borderRadius: 0,
                                    }
                                }}
                            >
                                {/* Grow = กระจายเต็มบรรทัดแบบเรียบ */}
                                <Tabs.List grow>
                                    <Tabs.Tab value="checkin">
                                        Booking Check-in
                                    </Tabs.Tab>
                                    <Tabs.Tab value="weight_in">
                                        Weight Scale In
                                    </Tabs.Tab>
                                    <Tabs.Tab value="drain_monitor">
                                        Weight Scale Out
                                    </Tabs.Tab>
                                    <Tabs.Tab value="summary">
                                        Weight Summary Dashboard
                                    </Tabs.Tab>
                                </Tabs.List>

                                {/* PANEL – กล่องขาว radius 12 */}
                                <Tabs.Panel value="checkin" pt="md">
                                    <PanelWrapper>
                                        <BookingCheckInTab user={user} />
                                    </PanelWrapper>
                                </Tabs.Panel>

                                <Tabs.Panel value="weight_in" pt="md">
                                    <PanelWrapper>
                                        <WeightScaleInTab user={user} />
                                    </PanelWrapper>
                                </Tabs.Panel>

                                <Tabs.Panel value="drain_monitor" pt="md">
                                    <PanelWrapper>
                                        <WeightScaleOutTab user={user} />
                                    </PanelWrapper>
                                </Tabs.Panel>

                                <Tabs.Panel value="summary" pt="md">
                                    <PanelWrapper>
                                        <WeightSummaryTab />
                                    </PanelWrapper>
                                </Tabs.Panel>
                            </Tabs>

                        </Stack>
                    </Container>
                </AppShell.Main>
            </AppShell>
        </div>
    );
}

/* ===== แยก Wrapper ให้สวยและสะอาดขึ้น ===== */
function PanelWrapper({ children }) {
    return (
        <div
            style={{
                backgroundColor: "#ffffff",
                borderRadius: 12,
                padding: 20,
                boxShadow: "0 18px 40px -24px rgba(15,23,42,0.25)",
            }}
        >
            {children}
        </div>
    );
}