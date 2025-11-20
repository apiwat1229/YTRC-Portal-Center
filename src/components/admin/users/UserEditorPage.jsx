// src/components/admin/users/UserEditorPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    AppShell,
    Badge,
    Card,
    Container,
    Divider,
    Group,
    Stack,
    Text,
    ThemeIcon,
    Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
    IconCheck,
    IconUser,
    IconUserPlus,
    IconX
} from "@tabler/icons-react";

import { can, isSuperuser } from "../../auth/permission";
import UserHeaderPanel from "../../common/UserHeaderPanel";
import { apiRequest } from "./userApi";
import UserForm from "./UserForm";

/**
 * หน้า Page สำหรับ Create / Edit ผู้ใช้ (แทน modal)
 * route:
 *   - /system/users/new          → create mode
 *   - /system/users/:userId/edit → edit mode
 */
export default function UserEditorPage({ auth, onLogout, onBack }) {
    const { user } = auth || {};
    const navigate = useNavigate();
    const params = useParams();
    const userId = params.userId || null;

    const isEdit = Boolean(userId);
    const canManageUsers =
        can(user, "portal.admin.users.manage") || isSuperuser(user);

    const [initialUser, setInitialUser] = useState(null);  // data สำหรับ edit
    const [loadingInitial, setLoadingInitial] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    const displayName = useMemo(() => {
        if (!user) return "";
        return (
            user.display_name ||
            [user.first_name, user.last_name].filter(Boolean).join(" ") ||
            user.username ||
            user.email
        );
    }, [user]);

    // โหลด user ถ้าเป็น edit
    useEffect(() => {
        const fetchUser = async () => {
            if (!isEdit) {
                setLoadingInitial(false);
                return;
            }
            if (!canManageUsers) {
                setLoadingInitial(false);
                return;
            }

            try {
                setLoadingInitial(true);
                const data = await apiRequest(`/users/${userId}`, {}, auth);
                setInitialUser(data);
            } catch (err) {
                console.error("[UserEditorPage] fetch user error:", err);
                showNotification({
                    title: "โหลดข้อมูลผู้ใช้งานไม่สำเร็จ",
                    message:
                        err?.message ||
                        "เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้จากเซิร์ฟเวอร์",
                    color: "red",
                    icon: <IconX size={16} />,
                });
            } finally {
                setLoadingInitial(false);
            }
        };

        fetchUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const handleBackClick = () => {
        if (onBack) {
            onBack();
            return;
        }
        // default: back to /system/users
        if (window.history.length > 1) {
            window.history.back();
        } else {
            navigate("/system/users");
        }
    };

    const handleLogoutClick = () => {
        if (typeof onLogout === "function") {
            onLogout();
        }
    };

    // submit จาก UserForm → ยิง API ที่นี่
    const handleSubmit = async (payload) => {
        try {
            setSaving(true);
            let result;

            if (!isEdit) {
                // CREATE
                result = await apiRequest(
                    "/users/",
                    {
                        method: "POST",
                        body: JSON.stringify(payload),
                    },
                    auth
                );
                showNotification({
                    title: "สร้างผู้ใช้งานสำเร็จ",
                    message: result.display_name || result.email,
                    color: "green",
                    icon: <IconCheck size={16} />,
                });
            } else {
                // UPDATE
                const targetId = userId;
                console.log("[UserEditorPage] UPDATE userId:", targetId);

                result = await apiRequest(
                    `/users/${targetId}`,
                    {
                        method: "PATCH",
                        body: JSON.stringify(payload),
                    },
                    auth
                );
                showNotification({
                    title: "อัปเดตผู้ใช้งานสำเร็จ",
                    message: result.display_name || result.email,
                    color: "green",
                    icon: <IconCheck size={16} />,
                });
            }

            // เสร็จแล้วกลับไป list
            navigate("/system/users");
        } catch (err) {
            console.error("[UserEditorPage] submit error:", err);
            const msg =
                typeof err?.message === "string"
                    ? err.message
                    : Array.isArray(err)
                        ? JSON.stringify(err)
                        : "ไม่สามารถบันทึกข้อมูลผู้ใช้ได้";

            showNotification({
                title: "บันทึกข้อมูลไม่สำเร็จ",
                message: msg,
                color: "red",
                icon: <IconX size={16} />,
            });
        } finally {
            setSaving(false);
        }
    };

    // ถ้าไม่มีสิทธิ์ manage users
    if (!canManageUsers) {
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
                                {/* HEADER แบบ Starter */}
                                <Group justify="space-between" align="center">
                                    <Group gap="md">
                                        <ThemeIcon
                                            size={48}
                                            radius="md"
                                            variant="gradient"
                                            gradient={{
                                                from: "red",
                                                to: "orange",
                                                deg: 135,
                                            }}
                                        >
                                            <IconUser size={28} />
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
                                                USER MANAGEMENT
                                            </Text>
                                            <Text
                                                size="xs"
                                                fw={500}
                                                c="dimmed"
                                                tt="uppercase"
                                                style={{ letterSpacing: "1px" }}
                                            >
                                                ACCESS DENIED
                                            </Text>
                                        </div>
                                    </Group>

                                    <UserHeaderPanel
                                        user={user}
                                        displayName={displayName}
                                        onBackClick={handleBackClick}
                                        onNotificationsClick={() => { }}
                                        onLogout={handleLogoutClick}
                                        notificationsCount={0}
                                    />
                                </Group>

                                <Card withBorder radius="md" style={{ backgroundColor: "white" }}>
                                    <Stack gap="xs" align="center" py="xl">
                                        <Title order={3}>
                                            คุณไม่มีสิทธิ์จัดการผู้ใช้งาน
                                        </Title>
                                        <Text size="sm" c="dimmed" ta="center">
                                            กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์{" "}
                                            <Badge
                                                size="xs"
                                                variant="dot"
                                                color="violet"
                                            >
                                                portal.admin.users.manage
                                            </Badge>
                                        </Text>
                                    </Stack>
                                </Card>
                            </Stack>
                        </Container>
                    </AppShell.Main>
                </AppShell>
            </div>
        );
    }

    // ปกติ (มีสิทธิ์)
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
                            {/* === HEADER SECTION (เหมือน Starter) === */}
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
                                        {isEdit ? (
                                            <IconUser size={28} />
                                        ) : (
                                            <IconUserPlus size={28} />
                                        )}
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
                                            {isEdit
                                                ? "EDIT USER"
                                                : "CREATE USER"}
                                        </Text>
                                        <Text
                                            size="xs"
                                            fw={500}
                                            c="dimmed"
                                            tt="uppercase"
                                            style={{ letterSpacing: "1px" }}
                                        >
                                            YTRC Portal Center · System
                                            Administration
                                        </Text>
                                    </div>
                                </Group>

                                {/* Header ขวา: panel ผู้ใช้ + Back + Logout */}
                                <UserHeaderPanel
                                    user={user}
                                    displayName={displayName}
                                    onBackClick={handleBackClick}
                                    onNotificationsClick={() => { }}
                                    onLogout={handleLogoutClick}
                                    notificationsCount={0}
                                />
                            </Group>

                            {/* === MAIN CARD === */}
                            <Card
                                withBorder
                                radius="md"
                                style={{ backgroundColor: "white" }}
                            >
                                <Stack gap="md">
                                    <Stack gap={2}>
                                        <Title order={5}>
                                            {isEdit
                                                ? "แก้ไขข้อมูลผู้ใช้งาน"
                                                : "สร้างผู้ใช้งานใหม่"}
                                        </Title>
                                        <Text size="xs" c="dimmed">
                                            ระบุรายละเอียดผู้ใช้งานและสิทธิ์การเข้าถึงระบบ
                                        </Text>
                                    </Stack>

                                    <Divider my="xs" />

                                    {loadingInitial && isEdit ? (
                                        <Text size="sm" c="dimmed">
                                            กำลังโหลดข้อมูลผู้ใช้งาน...
                                        </Text>
                                    ) : (
                                        <UserForm
                                            mode={isEdit ? "edit" : "create"}
                                            initial={initialUser}
                                            onSubmit={handleSubmit}
                                            onCancel={handleBackClick}
                                            submitting={saving}
                                        />
                                    )}
                                </Stack>
                            </Card>
                        </Stack>
                    </Container>
                </AppShell.Main>
            </AppShell>
        </div>
    );
}