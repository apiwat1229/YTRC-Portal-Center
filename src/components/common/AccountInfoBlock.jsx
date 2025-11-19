// src/components/common/AccountInfoBlock.jsx
import { Badge, Button, Card, Divider, Group, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconUser } from "@tabler/icons-react";

/**
 * การ์ดต้อนรับ + ข้อมูลบัญชีที่ล็อกอินอยู่
 * ใช้ซ้ำได้หลายหน้า
 */
export default function AccountInfoBlock({
    user,
    onOpenProfile, // ถ้าจะ override behavior เอง (ส่วนใหญ่ไม่จำเป็นแล้ว)
    onLogout,
    description, // ถ้าไม่ส่งมา จะใช้ข้อความ default ของ Portal Center
}) {
    const displayName =
        user?.display_name ||
        [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
        user?.username ||
        user?.email ||
        "";

    const descText =
        description ||
        `คุณกำลังใช้งาน YTRC Portal Center เพื่อเข้าถึงระบบภายใน เช่น QR Code, Cuplump, Booking Queue, TruckScale, แจ้งซ่อม, ระบบ Stock, Contact Management และ System Menu`;

    // ---------- Profile Modal ----------
    const openProfileModal = () => {
        // ถ้าอยากให้บางหน้าพาไป view=profile แบบเต็ม ก็ยังใช้ onOpenProfile override ได้
        if (typeof onOpenProfile === "function") {
            onOpenProfile();
            return;
        }

        modals.open({
            title: "ข้อมูลบัญชีผู้ใช้งาน",
            radius: "md",
            size: "lg",
            children: (
                <Stack gap="sm">
                    <Stack gap={2}>
                        <Text fw={600} size="sm">
                            {displayName || "-"}
                        </Text>
                        {user?.email && (
                            <Text size="xs" c="dimmed">
                                {user.email}
                            </Text>
                        )}
                    </Stack>

                    <Divider my="xs" />

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
                        คุณสามารถใช้บัญชีนี้ในการเข้าถึง Portal ต่าง ๆ เช่น QR, Cuplump, Contact,
                        System Menu และโมดูลอื่น ๆ ตามสิทธิ์ที่ได้รับ
                    </Text>
                </Stack>
            ),
        });
    };

    // ---------- Logout Confirm ----------
    const openLogoutConfirm = () => {
        if (typeof onLogout !== "function") {
            console.warn(
                "[AccountInfoBlock] onLogout is not provided. กรุณาส่ง prop onLogout จาก parent component"
            );
            return;
        }

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

    return (
        <Card withBorder radius="md" style={{ backgroundColor: "white" }}>
            <Group justify="space-between" align="flex-start">
                {/* ฝั่งซ้าย: ทักทาย + คำอธิบาย + Badge */}
                <Stack gap={4} style={{ maxWidth: "70%" }}>
                    <Text fw={600} size="sm">
                        สวัสดีคุณ {displayName || "-"}
                    </Text>

                    <Text size="xs" c="dimmed">
                        {descText}
                    </Text>

                    <Group gap={8} mt={4}>
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
                </Stack>

                {/* ฝั่งขวา: เข้าสู่ระบบด้วยบัญชี + ปุ่ม */}
                <Stack gap={4} align="flex-end">
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
                            onClick={openProfileModal}
                        >
                            ดูโปรไฟล์
                        </Button>
                        <Button
                            variant="outline"
                            size="xs"
                            color="gray"
                            onClick={openLogoutConfirm}
                        >
                            Logout
                        </Button>
                    </Group>
                </Stack>
            </Group>
        </Card>
    );
}