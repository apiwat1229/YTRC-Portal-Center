// src/components/starter/StarterPage.jsx
import { AppShell, Container, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconActivity } from "@tabler/icons-react";
import { useMemo } from "react";

import UserHeaderPanel from "../common/UserHeaderPanel";

/**
 * หน้าหลักของ Portal Center (เวอร์ชัน hero เปล่า ๆ + แถบผู้ใช้งานด้านขวาบน)
 */
export default function StarterPage({
    auth,
    onLogout,
    onBack,
    onNotificationsClick,
    notificationsCount = 1, // 👈 ค่าเริ่มต้น (0 = ไม่มีแจ้งเตือน)
}) {
    const { user } = auth || {};

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

    // ถ้าอยากลองจำลองให้มีแจ้งเตือน ลอง override ตรงนี้ชั่วคราวก็ได้ เช่น:
    // const effectiveNotificationsCount = 5;
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
            <AppShell
                padding="md"
                styles={{ main: { backgroundColor: "transparent" } }}
            >
                <AppShell.Main>
                    <Container size="xl" py="md">
                        <Stack gap="xl">
                            {/* === HEADER SECTION (Hero + UserHeaderPanel) === */}
                            <Group justify="space-between" align="center">
                                {/* Hero Title */}
                                <Group gap="md">
                                    <ThemeIcon
                                        size={48}
                                        radius="md"
                                        variant="gradient"
                                        gradient={{
                                            from: "blue",
                                            to: "indigo",
                                            deg: 135,
                                        }}
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

                                {/* Header ขวา: เวลา + ชื่อ + ปุ่ม Back / แจ้งเตือน / Logout */}
                                <UserHeaderPanel
                                    user={user}
                                    displayName={displayName}
                                    onBackClick={onBack}
                                    onNotificationsClick={onNotificationsClick}
                                    onLogout={onLogout}
                                    notificationsCount={effectiveNotificationsCount}
                                />
                            </Group>

                            {/* ด้านล่างปล่อยว่างไว้ก่อน - ค่อยเอา Dashboard / Cards มาใส่ทีหลัง */}
                        </Stack>
                    </Container>
                </AppShell.Main>
            </AppShell>
        </div>
    );
}