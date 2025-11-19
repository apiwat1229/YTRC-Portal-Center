// src/components/common/AccountInfoBlock.jsx
import { Box, Button, Card, Divider, Group, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconUser } from "@tabler/icons-react";

/**
 * ชิปแบบ Gradient สำหรับแสดง DEPT / POSITION / ROLE
 */
function GradientChip({ children, from, to }) {
    return (
        <Box
            px={10}
            py={4}
            style={{
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.35,
                borderRadius: 999,
                background: `linear-gradient(135deg, ${from}, ${to})`,
                color: "#0f172a",
                boxShadow: "0 4px 10px rgba(15, 23, 42, 0.08)",
                border: "1px solid rgba(255,255,255,0.8)",
                whiteSpace: "nowrap",
            }}
        >
            {children}
        </Box>
    );
}

/**
 * การ์ดต้อนรับ + ข้อมูลบัญชีที่ล็อกอินอยู่
 * ใช้ซ้ำได้หลายหน้า
 */
export default function AccountInfoBlock({
    user,
    onOpenProfile, // ถ้าจะ override behavior เอง
    onLogout,
    description,
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

                    {/* แสดงชิป DEPT / POSITION / ROLE แบบเดียวกับ header */}
                    <Group gap={8}>
                        {user?.department && (
                            <GradientChip from="#bbf7d0" to="#a5f3fc">
                                DEPT: {user.department}
                            </GradientChip>
                        )}
                        {user?.position && (
                            <GradientChip from="#bfdbfe" to="#c4b5fd">
                                POSITION: {user.position}
                            </GradientChip>
                        )}
                        {user?.role && (
                            <GradientChip from="#e9d5ff" to="#fecdd3">
                                ROLE: {user.role}
                            </GradientChip>
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
        <Card
            withBorder
            radius={24}
            style={{
                background: "linear-gradient(135deg, #f9fafb 0%, #f1f5f9 100%)",
                border: "1px solid rgba(148, 163, 184, 0.25)",
                boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
                padding: 18,
            }}
        >
            <Group justify="space-between" align="center">
                {/* ฝั่งซ้าย: ทักทาย + Badge แถวบน + Description แถวล่าง */}
                <Stack gap={6} style={{ maxWidth: "70%" }}>
                    {/* บรรทัด Welcome */}
                    <Text fw={600} size="sm" style={{ letterSpacing: "-0.01em" }}>
                        Welcome back, {displayName || "-"} 👋
                    </Text>

                    {/* แถวชิป DEPT / POSITION / ROLE (แบบในภาพ) */}
                    <Group gap={8}>
                        {user?.department && (
                            <GradientChip from="#bbf7d0" to="#a5f3fc">
                                DEPT: {user.department}
                            </GradientChip>
                        )}
                        {user?.position && (
                            <GradientChip from="#bfdbfe" to="#c4b5fd">
                                POSITION: {user.position}
                            </GradientChip>
                        )}
                        {user?.role && (
                            <GradientChip from="#e9d5ff" to="#fecdd3">
                                ROLE: {user.role}
                            </GradientChip>
                        )}
                    </Group>

                    {/* คำอธิบายยาวด้านล่าง */}
                    <Text size="xs" c="dimmed" mt={2}>
                        {descText}
                    </Text>
                </Stack>

                {/* ฝั่งขวา: ข้อมูล email + ปุ่มโปรไฟล์ / logout */}
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
                            Profile
                        </Button>
                        <Button
                            variant="outline"
                            size="xs"
                            color="red"
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