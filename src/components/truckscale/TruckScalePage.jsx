// src/components/truckscale/TruckScalePage.jsx
import { AppShell, Container, Group, Stack, Tabs, Text, ThemeIcon } from "@mantine/core";
import { IconActivity, IconScale } from "@tabler/icons-react";
import { useMemo, useState } from "react";

import UserHeaderPanel from "../common/UserHeaderPanel";
import BookingCheckInTab from "./BookingCheckInTab";
import DrainMonitorTab from "./DrainMonitorTab";
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
                    "radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.1) 0px, transparent 50%)",
                fontFamily: "'Outfit', system-ui, sans-serif",
            }}
        >
            <AppShell padding="md" styles={{ main: { backgroundColor: "transparent" } }}>
                <AppShell.Main>
                    <Container size="xl" py="md">
                        <Stack gap="xl">
                            {/* HEADER */}
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
                                        <Text
                                            size="xs"
                                            fw={500}
                                            c="dimmed"
                                            tt="uppercase"
                                            style={{ letterSpacing: "1px" }}
                                        >
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

                            {/* TABS */}
                            <Tabs
                                value={activeTab}
                                onChange={setActiveTab}
                                variant="outline"
                                radius="md"
                                defaultValue="checkin"
                            >
                                <Tabs.List>
                                    <Tabs.Tab value="checkin" leftSection={<IconActivity size={14} />}>
                                        Booking – Check-in
                                    </Tabs.Tab>
                                    <Tabs.Tab value="weight_in">Weight Scale IN</Tabs.Tab>
                                    <Tabs.Tab value="drain_monitor">Check-OUT – Drain Monitor</Tabs.Tab>
                                    <Tabs.Tab value="summary">Weight Summary – Dashboard</Tabs.Tab>
                                </Tabs.List>

                                <Tabs.Panel value="checkin" pt="md">
                                    <BookingCheckInTab user={user} />
                                </Tabs.Panel>

                                <Tabs.Panel value="weight_in" pt="md">
                                    <WeightScaleInTab user={user} />
                                </Tabs.Panel>

                                <Tabs.Panel value="drain_monitor" pt="md">
                                    <DrainMonitorTab user={user} />
                                </Tabs.Panel>

                                <Tabs.Panel value="summary" pt="md">
                                    <WeightSummaryTab />
                                </Tabs.Panel>
                            </Tabs>
                        </Stack>
                    </Container>
                </AppShell.Main>
            </AppShell>
        </div>
    );
}