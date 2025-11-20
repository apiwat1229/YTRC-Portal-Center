// src/components/starter/StarterPage.jsx
import {
    AppShell,
    Badge,
    Box,
    Button,
    Card,
    Container,
    Group,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import {
    IconArrowLeft,
    IconBell,
    IconGridDots,
    IconLayoutDashboard,
    IconRocket,
} from "@tabler/icons-react";
import { useMemo } from "react";
import AccountInfoBlock from "../common/AccountInfoBlock";

/**
 * StarterPage
 * - ใช้เป็น template สำหรับหน้าฟีเจอร์ใหม่ๆ
 * - มี Header, AccountInfoBlock, และ Quick actions ตัวอย่าง
 */
export default function StarterPage({
    auth,
    onLogout,
    onBack, // ถ้ามีจะโชว์ปุ่ม Back
    title = "Starter Workspace",
    subtitle = "Template สำหรับเริ่มออกแบบหน้าฟีเจอร์ใหม่ใน YTRC Portal Center",
}) {
    const { user } = auth || {};

    const displayName = useMemo(() => {
        if (!user) return "";
        return (
            user.display_name ||
            [user.first_name, user.last_name].filter(Boolean).join(" ") ||
            user.username ||
            user.email
        );
    }, [user]);

    // ------ Logout confirm ------
    const handleLogoutClick = () => {
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
            onConfirm: () => {
                onLogout();
            },
        });
    };

    // ------ Sample actions ------
    const openSampleModal = () => {
        modals.open({
            title: "Starter modal ตัวอย่าง",
            radius: "md",
            children: (
                <Stack gap="xs">
                    <Text size="sm">
                        นี่คือ modal ตัวอย่างจาก <b>StarterPage</b> — คุณสามารถแก้ไขเนื้อหา, ฟอร์ม,
                        หรือ logic ภายในนี้ให้ตรงกับ use case จริงได้เลย
                    </Text>
                </Stack>
            ),
        });
    };

    const showSampleNotification = () => {
        showNotification({
            title: "Starter notification",
            message: "ตัวอย่างการเรียก Notifications จาก StarterPage",
            icon: <IconBell size={16} />,
        });
    };

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
                    {/* ซ้ายบน: Title ของหน้า Starter */}
                    <Group gap="xs">
                        <IconGridDots size={20} />
                        <Text fw={600}>{title}</Text>
                        <Badge size="xs" radius="lg" variant="light" color="violet">
                            STARTER
                        </Badge>
                    </Group>

                    {/* ขวาบน: ชื่อ user + ปุ่ม Back (ถ้ามี) + Logout */}
                    <Group gap="sm">
                        <Text size="sm" c="dimmed">
                            {displayName}
                        </Text>

                        {onBack && (
                            <Button
                                variant="subtle"
                                size="xs"
                                leftSection={<IconArrowLeft size={14} />}
                                onClick={onBack}
                            >
                                Back
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            size="xs"
                            color="gray"
                            onClick={handleLogoutClick}
                        >
                            Logout
                        </Button>
                    </Group>
                </Group>
            }
        >
            <Container size="lg" py="md">
                <Stack gap="md">
                    {/* ✅ ใช้ AccountInfoBlock ซ้ำ */}
                    <AccountInfoBlock
                        user={user}
                        onLogout={onLogout}
                        description={subtitle}
                    />

                    {/* Content zone หลักของหน้า Starter */}
                    <Card withBorder radius="md" style={{ backgroundColor: "white" }}>
                        <Stack gap="sm">
                            <Group justify="space-between" align="center">
                                <Stack gap={2}>
                                    <Title order={5}>Getting started</Title>
                                    <Text size="xs" c="dimmed">
                                        พื้นที่นี้ใช้เป็นโครงหลักสำหรับออกแบบหน้าใหม่ เช่น Dashboard ย่อย,
                                        ฟอร์ม, หรือ workflow เฉพาะของแผนก
                                    </Text>
                                </Stack>

                                <Badge variant="light" size="xs" color="teal">
                                    Prototype ready
                                </Badge>
                            </Group>

                            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mt="md">
                                {/* Card: เปิด Modal ตัวอย่าง */}
                                <StarterActionCard
                                    icon={IconRocket}
                                    title="Sample modal"
                                    description="ทดสอบเปิด Modal จากหน้าปัจจุบัน เพื่อดู UX ก่อนออกแบบของจริง."
                                    actionLabel="Open modal"
                                    onAction={openSampleModal}
                                />

                                {/* Card: Notification ตัวอย่าง */}
                                <StarterActionCard
                                    icon={IconBell}
                                    title="Sample notification"
                                    description="แสดง notification ตัวอย่าง (Mantine) สำหรับแจ้งเตือนเหตุการณ์."
                                    actionLabel="Show notification"
                                    onAction={showSampleNotification}
                                />

                                {/* Card: Placeholder */}
                                <StarterActionCard
                                    icon={IconLayoutDashboard}
                                    title="Custom action"
                                    description="จุดเริ่มต้นสำหรับเชื่อมต่อ API, เปิดหน้าอื่น หรือเรียก workflow จริง."
                                    actionLabel="Console.log"
                                    onAction={() => {
                                        console.log("[StarterPage] custom action clicked");
                                    }}
                                />
                            </SimpleGrid>
                        </Stack>
                    </Card>
                </Stack>
            </Container>
        </AppShell>
    );
}

/**
 * Card เล็กๆ สำหรับ Quick actions บน StarterPage
 */
function StarterActionCard({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
}) {
    return (
        <Card
            radius="md"
            withBorder
            style={{
                padding: "18px 16px",
                backgroundColor: "white",
            }}
            shadow="xs"
        >
            <Group align="flex-start" gap="md" wrap="nowrap">
                <Box
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: "rgba(59,130,246,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Icon size={22} />
                </Box>

                <Stack gap={6} style={{ flex: 1 }}>
                    <Text fw={600} size="sm">
                        {title}
                    </Text>
                    <Text size="xs" c="dimmed">
                        {description}
                    </Text>

                    <Button
                        variant="light"
                        size="xs"
                        mt={4}
                        onClick={onAction}
                    >
                        {actionLabel}
                    </Button>
                </Stack>
            </Group>
        </Card>
    );
}