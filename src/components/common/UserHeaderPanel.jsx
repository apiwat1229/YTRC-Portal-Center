// src/components/portal/UserHeaderPanel.jsx
import {
    ActionIcon,
    Card,
    Group,
    Stack,
    Text,
    Tooltip,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import {
    IconApps,
    IconArrowLeft,
    IconDoorExit,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import NotificationBell from "../common/NotificationBell";

/* ---------------------- Realtime Clock ---------------------- */
function RealtimeClock() {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <Stack
            gap={4}
            align="flex-end"
            style={{ lineHeight: 1, textAlign: "right" }}
        >
            <Text
                size="lg"
                fw={700}
                style={{
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "-0.5px",
                    lineHeight: 1,
                }}
            >
                {date.toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </Text>
            <Text
                size="xs"
                c="dimmed"
                style={{ marginTop: -2, lineHeight: 1 }}
            >
                {date.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                })}
            </Text>
        </Stack>
    );
}

/* ---------------------- Main Component ---------------------- */
export default function UserHeaderPanel({
    user,
    displayName,
    onBackClick,
    onPortalClick,           // ⭐ NEW PROP
    onNotificationsClick,
    onLogout,
    notificationsCount = 0,
}) {
    const position = user?.position || "Staff";

    const handleLogoutClick = () => {
        if (!onLogout) return;
        modals.openConfirmModal({
            title: "Confirm Logout",
            centered: true,
            children: <Text size="sm">คุณต้องการออกจากระบบใช่หรือไม่?</Text>,
            labels: { confirm: "Logout", cancel: "Cancel" },
            confirmProps: { color: "red" },
            onConfirm: onLogout,
        });
    };

    const handleBackClick = () => {
        if (onBackClick) onBackClick();
    };

    const handlePortalClick = () => {
        if (typeof onPortalClick === "function") {
            onPortalClick();
        } else {
            window.location.href = "/"; // ⭐ default behavior
        }
    };

    const handleNotificationsClick = () => {
        if (onNotificationsClick) onNotificationsClick();
    };

    const canGoBack = typeof onBackClick === "function";

    return (
        <Card
            padding="xs"
            radius={12}
            withBorder
            shadow="xs"
            bg="white"
            style={{
                paddingLeft: 18,
                paddingRight: 12,
                borderColor: "rgba(148,163,184,0.35)",
            }}
        >
            <Group gap="lg" align="center" justify="space-between">
                {/* Clock */}
                <RealtimeClock />

                {/* Divider */}
                <div
                    style={{ width: 1, height: 36, backgroundColor: "#e2e8f0" }}
                />

                {/* Name + position + buttons */}
                <Group gap="md" align="center">
                    <Stack gap={2} align="flex-end" style={{ textAlign: "right" }}>
                        <Text
                            size="sm"
                            fw={700}
                            c="dark.7"
                            style={{ letterSpacing: "-0.01em", lineHeight: 1.1 }}
                        >
                            {displayName}
                        </Text>
                        <Text
                            size="xs"
                            fw={500}
                            c="dimmed"
                            style={{ letterSpacing: "0.02em", lineHeight: 1 }}
                        >
                            {position}
                        </Text>
                    </Stack>

                    {/* Divider */}
                    <div
                        style={{ width: 1, height: 28, backgroundColor: "#e5e7eb" }}
                    />

                    {/* BUTTONS: Back → Portal → Noti → Logout */}
                    <Group gap={8} align="center">

                        {/* BACK */}
                        <Tooltip label="Back" withArrow>
                            <ActionIcon
                                aria-label="Back"
                                radius={12}
                                size="lg"
                                variant="filled"
                                disabled={!canGoBack}
                                style={{
                                    cursor: canGoBack ? "pointer" : "default",
                                    transition: "all .15s ease",
                                    backgroundColor: "#e5e7eb",
                                    color: "#4b5563",
                                    opacity: canGoBack ? 1 : 0.5,
                                }}
                                onMouseEnter={(e) => {
                                    if (!canGoBack) return;
                                    e.currentTarget.style.transform = "translateY(-1px)";
                                    e.currentTarget.style.backgroundColor = "#dbeafe";
                                    e.currentTarget.style.boxShadow =
                                        "0 0 0 1px rgba(59,130,246,0.45)";
                                    e.currentTarget.style.color = "#2563eb";
                                }}
                                onMouseLeave={(e) => {
                                    if (!canGoBack) return;
                                    e.currentTarget.style.transform = "none";
                                    e.currentTarget.style.backgroundColor = "#e5e7eb";
                                    e.currentTarget.style.boxShadow = "none";
                                    e.currentTarget.style.color = "#4b5563";
                                }}
                                onClick={handleBackClick}
                            >
                                <IconArrowLeft size={18} />
                            </ActionIcon>
                        </Tooltip>

                        {/* ⭐ NEW BUTTON: Goto Portal Center */}
                        <Tooltip label="Go to Portal Center" withArrow>
                            <ActionIcon
                                aria-label="Portal Center"
                                radius={12}
                                size="lg"
                                variant="filled"
                                style={{
                                    cursor: "pointer",
                                    transition: "all .15s ease",
                                    backgroundColor: "#e5e7eb",
                                    color: "#334155",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-1px)";
                                    e.currentTarget.style.backgroundColor = "#e0e7ff";
                                    e.currentTarget.style.boxShadow =
                                        "0 0 0 1px rgba(99,102,241,0.45)";
                                    e.currentTarget.style.color = "#4f46e5";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "none";
                                    e.currentTarget.style.backgroundColor = "#e5e7eb";
                                    e.currentTarget.style.boxShadow = "none";
                                    e.currentTarget.style.color = "#334155";
                                }}
                                onClick={handlePortalClick}
                            >
                                <IconApps size={18} />
                            </ActionIcon>
                        </Tooltip>

                        {/* NOTIFICATIONS */}
                        <NotificationBell
                            count={notificationsCount}
                            onClick={handleNotificationsClick}
                        />

                        {/* LOGOUT */}
                        <Tooltip label="Logout" withArrow>
                            <ActionIcon
                                aria-label="Logout"
                                radius={12}
                                size="lg"
                                variant="filled"
                                style={{
                                    cursor: onLogout ? "pointer" : "default",
                                    opacity: onLogout ? 1 : 0.5,
                                    transition: "all .15s ease",
                                    backgroundColor: "#fee2e2",
                                    color: "#b91c1c",
                                }}
                                onMouseEnter={(e) => {
                                    if (!onLogout) return;
                                    e.currentTarget.style.transform = "translateY(-1px)";
                                    e.currentTarget.style.backgroundColor = "#fecaca";
                                    e.currentTarget.style.boxShadow =
                                        "0 0 0 1px rgba(248,113,113,0.6)";
                                }}
                                onMouseLeave={(e) => {
                                    if (!onLogout) return;
                                    e.currentTarget.style.transform = "none";
                                    e.currentTarget.style.backgroundColor = "#fee2e2";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                                onClick={handleLogoutClick}
                            >
                                <IconDoorExit size={18} />
                            </ActionIcon>
                        </Tooltip>

                    </Group>
                </Group>
            </Group>
        </Card>
    );
}