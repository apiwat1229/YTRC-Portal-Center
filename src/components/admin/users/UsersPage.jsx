// src/components/admin/users/UsersPage.jsx
import {
    AppShell,
    Badge,
    Box,
    Button,
    Card,
    Center,
    Container,
    Divider,
    Group,
    Select,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import {
    IconArrowLeft,
    IconCheck,
    IconPlus,
    IconUserCog,
    IconUsers,
    IconX,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { can, isSuperuser } from "../../auth/permission";
import { apiRequest } from "./userApi";
import UserForm from "./UserForm";
import UsersTable from "./UsersTable";

const ROLE_FILTER_OPTIONS = [
    { value: "super_admin", label: "Super Admin" },
    { value: "admin", label: "Admin" },
    { value: "user", label: "Staff" },
    { value: "viewer", label: "Viewer" },
];

const STATUS_FILTER_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "suspended", label: "Suspended" },
];

// ✅ helper ใช้ทุกที่ที่ต้องดึง userId
const getUserId = (u) => u?.id || u?._id || u?.user_id || u?.userId || null;

export default function UsersPage({ auth, onLogout, onBack }) {
    const { user } = auth || {};

    const canViewUsers = can(user, "portal.admin.users.view");
    const canManageUsers =
        can(user, "portal.admin.users.manage") || isSuperuser(user);

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState(null); // enum ตัวเล็ก
    const [statusFilter, setStatusFilter] = useState(null); // enum ตัวเล็ก
    const [page, setPage] = useState(1);
    const limit = 50;

    const displayName = useMemo(() => {
        if (!user) return "";
        return (
            user.display_name ||
            [user.first_name, user.last_name].filter(Boolean).join(" ") ||
            user.username ||
            user.email
        );
    }, [user]);

    // โหลด users จาก API
    const fetchUsers = async () => {
        if (!canViewUsers) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append("q", search);
            if (roleFilter) params.append("role", roleFilter);
            if (statusFilter) params.append("status_filter", statusFilter);
            params.append("limit", String(limit));
            params.append("page", String(page));

            const data = await apiRequest(`/users/?${params.toString()}`, {}, auth);
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("[UsersPage] fetchUsers error:", err);
            showNotification({
                title: "โหลดรายชื่อผู้ใช้งานไม่สำเร็จ",
                message: err.message || "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้",
                color: "red",
                icon: <IconX size={16} />,
            });
            if (err.status === 401 && typeof onLogout === "function") {
                onLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, roleFilter, statusFilter, page]);

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

    const openUserModal = (mode, userRecord = null) => {
        if (!canManageUsers) return;

        const isEdit = mode === "edit";

        modals.open({
            title: isEdit ? "แก้ไขผู้ใช้งาน" : "สร้างผู้ใช้งานใหม่",
            radius: "md",
            size: "lg",
            children: (
                <UserForm
                    auth={auth}
                    mode={mode}
                    initial={userRecord}
                    onSubmitSuccess={(saved) => {
                        setUsers((prev) => {
                            if (isEdit) {
                                return prev.map((u) =>
                                    getUserId(u) === getUserId(saved) ? saved : u
                                );
                            }
                            return [saved, ...prev];
                        });
                        modals.closeAll();
                    }}
                    onCancel={() => modals.closeAll()}
                    setLoadingAction={setLoadingAction}
                />
            ),
        });
    };

    const handleDeleteUser = (u) => {
        if (!canManageUsers) return;

        const userId = getUserId(u);

        modals.openConfirmModal({
            title: "ลบผู้ใช้งาน",
            centered: true,
            children: (
                <Text size="sm">
                    คุณต้องการลบผู้ใช้งาน{" "}
                    <Text component="span" fw={600}>
                        {u.display_name || u.username || u.email}
                    </Text>{" "}
                    ใช่หรือไม่? การลบจะไม่สามารถย้อนกลับได้
                </Text>
            ),
            labels: { confirm: "ลบผู้ใช้", cancel: "ยกเลิก" },
            confirmProps: { color: "red" },
            onConfirm: async () => {
                if (!userId) {
                    const msg = "ไม่พบ ID ของผู้ใช้งาน (u.id เป็น undefined)";
                    console.error("[UsersPage] delete: missing userId", u);
                    showNotification({
                        title: "ลบผู้ใช้งานไม่สำเร็จ",
                        message: msg,
                        color: "red",
                        icon: <IconX size={16} />,
                    });
                    return;
                }

                try {
                    setLoadingAction(true);
                    console.log("[UsersPage] DELETE userId:", userId);

                    await apiRequest(`/users/${userId}`, { method: "DELETE" }, auth);

                    setUsers((prev) =>
                        prev.filter((x) => getUserId(x) !== userId)
                    );

                    showNotification({
                        title: "ลบผู้ใช้งานสำเร็จ",
                        message: "ผู้ใช้งานถูกลบออกจากระบบแล้ว",
                        color: "green",
                        icon: <IconCheck size={16} />,
                    });
                } catch (err) {
                    console.error("[UsersPage] delete error:", err);
                    showNotification({
                        title: "ลบผู้ใช้งานไม่สำเร็จ",
                        message: err.message || "เกิดข้อผิดพลาดในการลบผู้ใช้",
                        color: "red",
                        icon: <IconX size={16} />,
                    });
                } finally {
                    setLoadingAction(false);
                }
            },
        });
    };

    // กรณีไม่มีสิทธิ์
    if (!canViewUsers) {
        return (
            <div className="app-bg">
                <AppShell
                    padding="md"
                    header={{ height: 64 }}
                    styles={{ main: { backgroundColor: "transparent" } }}
                >
                    <AppShell.Header>
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
                                <IconUsers size={20} />
                                <Text fw={600}>User Management</Text>
                                <Badge size="xs" radius="lg" variant="light" color="red">
                                    NO ACCESS
                                </Badge>
                            </Group>

                            {/* ✅ ฝั่งขวา: เหลือแค่ปุ่ม Back */}
                            <Group gap="sm">
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
                            </Group>
                        </Group>
                    </AppShell.Header>

                    <AppShell.Main>
                        <Container size="lg" py="md">
                            <Center style={{ minHeight: "50vh" }}>
                                <Stack gap="xs" align="center">
                                    <Title order={3}>ไม่มีสิทธิ์เข้าถึง User Management</Title>
                                    <Text size="sm" c="dimmed" ta="center">
                                        กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์{" "}
                                        <Badge size="xs" variant="dot" color="violet">
                                            portal.admin.users.view
                                        </Badge>
                                    </Text>
                                </Stack>
                            </Center>
                        </Container>
                    </AppShell.Main>
                </AppShell>
            </div>
        );
    }

    // ปกติ (มีสิทธิ์)
    return (
        <div className="app-bg">
            <AppShell
                padding="md"
                header={{ height: 64 }}
                styles={{
                    main: { backgroundColor: "transparent" },
                }}
            >
                <AppShell.Header>
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
                            <IconUserCog size={20} />
                            <Text fw={600}>User Management</Text>
                            <Badge size="xs" radius="lg" variant="light" color="blue">
                                SYSTEM
                            </Badge>
                        </Group>

                        {/* ✅ ฝั่งขวา: เอาชื่อ + Logout ออก เหลือ Back อย่างเดียว */}
                        <Group gap="sm">
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
                        </Group>
                    </Group>
                </AppShell.Header>

                <AppShell.Main>
                    <Container size="lg" py="md">
                        <Stack gap="md">
                            <Card withBorder radius="md" style={{ backgroundColor: "white" }}>
                                <Stack gap="sm">
                                    {/* Filter + Actions */}
                                    <Group justify="space-between" align="flex-end">
                                        <Stack gap={2}>
                                            <Title order={5}>Users</Title>
                                            <Text size="xs" c="dimmed">
                                                รายชื่อผู้ใช้งานทั้งหมดในระบบ (เฉพาะ Super Admin / Admin)
                                            </Text>
                                        </Stack>

                                        <Group gap="xs">
                                            <TextInput
                                                placeholder="ค้นหาด้วยชื่อ, email หรือ username"
                                                value={search}
                                                onChange={(e) => {
                                                    setPage(1);
                                                    setSearch(e.currentTarget.value);
                                                }}
                                                size="xs"
                                                style={{ minWidth: 220 }}
                                            />

                                            <Select
                                                placeholder="Role"
                                                size="xs"
                                                data={ROLE_FILTER_OPTIONS}
                                                value={roleFilter}
                                                onChange={(v) => {
                                                    setPage(1);
                                                    setRoleFilter(v);
                                                }}
                                                clearable
                                            />

                                            <Select
                                                placeholder="Status"
                                                size="xs"
                                                data={STATUS_FILTER_OPTIONS}
                                                value={statusFilter}
                                                onChange={(v) => {
                                                    setPage(1);
                                                    setStatusFilter(v);
                                                }}
                                                clearable
                                            />

                                            {canManageUsers && (
                                                <Button
                                                    size="xs"
                                                    leftSection={<IconPlus size={14} />}
                                                    onClick={() => openUserModal("create", null)}
                                                >
                                                    New user
                                                </Button>
                                            )}
                                        </Group>
                                    </Group>

                                    <Divider my="xs" />

                                    {/* ตาราง Users */}
                                    <Box
                                        style={{
                                            borderRadius: 8,
                                            border: "1px solid rgba(226, 232, 240, 1)",
                                            overflow: "hidden",
                                        }}
                                    >
                                        <UsersTable
                                            users={users}
                                            loading={loading}
                                            canManageUsers={canManageUsers}
                                            onEdit={(u) => openUserModal("edit", u)}
                                            onDelete={handleDeleteUser}
                                        />
                                    </Box>

                                    {loadingAction && (
                                        <Group justify="flex-end" mt="xs">
                                            <Text size="xs" c="dimmed">
                                                กำลังดำเนินการ...
                                            </Text>
                                        </Group>
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