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
    Pagination,
    Select,
    Stack,
    Text,
    TextInput,
    ThemeIcon,
    Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import {
    IconCheck,
    IconPlus,
    IconUserCog,
    IconUsers,
    IconX
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { can, isSuperuser } from "../../auth/permission";
import UserHeaderPanel from "../../common/UserHeaderPanel";
import { apiRequest } from "./userApi";
import UsersTable from "./UsersTable";

// ----- Filter options -----
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

const PAGE_SIZE_OPTIONS = [
    { value: "10", label: "10 / หน้า" },
    { value: "25", label: "25 / หน้า" },
    { value: "50", label: "50 / หน้า" },
    { value: "100", label: "100 / หน้า" },
];

const FETCH_LIMIT = 200; // โหลดมาสูงสุด 200 รายการ แล้วแบ่งหน้าฝั่ง FE

// helper ใช้ทุกที่ที่ต้องดึง userId
const getUserId = (u) => u?.id || u?._id || u?.user_id || u?.userId || null;

export default function UsersPage({ auth, onLogout, onBack }) {
    const { user } = auth || {};
    const navigate = useNavigate();

    const canViewUsers = can(user, "portal.admin.users.view");
    const canManageUsers =
        can(user, "portal.admin.users.manage") || isSuperuser(user);

    // Data States
    const [allItems, setAllItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);

    // Filter & Pagination States
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState(null);
    const [statusFilter, setStatusFilter] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const displayName = useMemo(() => {
        if (!user) return "";
        return (
            user.display_name ||
            [user.first_name, user.last_name].filter(Boolean).join(" ") ||
            user.username ||
            user.email
        );
    }, [user]);

    // โหลด users ทั้งหมดจาก API (ตาม FETCH_LIMIT)
    const fetchUsers = async () => {
        if (!canViewUsers) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append("limit", String(FETCH_LIMIT));
            // params.append("page", "1"); // โหลดหน้าแรกหน้าเดียวแต่เยอะๆ

            const data = await apiRequest(
                `/users/?${params.toString()}`,
                {},
                auth
            );
            setAllItems(Array.isArray(data) ? data : []);
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
    }, []);

    // ===== Filter Logic (Client-side) =====
    const filteredItems = useMemo(() => {
        const q = search.trim().toLowerCase();

        return allItems.filter((item) => {
            // 1. Role Filter
            if (roleFilter && item.role !== roleFilter) {
                return false;
            }
            // 2. Status Filter
            if (statusFilter && item.status !== statusFilter) {
                return false;
            }
            // 3. Search Text
            if (!q) return true;

            const nameText = (item.display_name || "").toLowerCase();
            const emailText = (item.email || "").toLowerCase();
            const usernameText = (item.username || "").toLowerCase();
            const fname = (item.first_name || "").toLowerCase();
            const lname = (item.last_name || "").toLowerCase();

            return (
                nameText.includes(q) ||
                emailText.includes(q) ||
                usernameText.includes(q) ||
                fname.includes(q) ||
                lname.includes(q)
            );
        });
    }, [allItems, search, roleFilter, statusFilter]);

    // Reset page เมื่อ filter เปลี่ยน
    useEffect(() => {
        setPage(1);
    }, [search, roleFilter, statusFilter, pageSize]);

    // ===== Pagination Logic =====
    const total = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);

    const startIndex = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endIndex = total === 0 ? 0 : Math.min(currentPage * pageSize, total);

    const pageItems = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;

        // Sort: Active ขึ้นก่อน (Optional), หรือเรียงตามชื่อ
        const sorted = [...filteredItems].sort((a, b) => {
            // ตัวอย่าง: เอา Active ขึ้นก่อน
            /* if (a.status !== b.status) {
                return a.status === "active" ? -1 : 1;
            }
            */
            // เรียงตามชื่อ
            const nameA = a.display_name || a.username || "";
            const nameB = b.display_name || b.username || "";
            return nameA.localeCompare(nameB);
        });

        return sorted.slice(start, end);
    }, [filteredItems, currentPage, pageSize]);


    // ===== Actions =====
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

    const handleCreateUser = () => {
        if (!canManageUsers) return;
        navigate("/system/users/new");
    };

    const handleEditUser = (u) => {
        if (!canManageUsers) return;
        const userId = getUserId(u);
        if (!userId) return;
        navigate(`/system/users/${userId}/edit`);
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

                    await apiRequest(
                        `/users/${userId}`,
                        { method: "DELETE" },
                        auth
                    );

                    // Update Local State
                    setAllItems((prev) =>
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
                        message:
                            err.message || "เกิดข้อผิดพลาดในการลบผู้ใช้",
                        color: "red",
                        icon: <IconX size={16} />,
                    });
                } finally {
                    setLoadingAction(false);
                }
            },
        });
    };

    // ---------- กรณีไม่มีสิทธิ์ ----------
    if (!canViewUsers) {
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
                                {/* HEADER แบบ Starter + UserHeaderPanel */}
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
                                            <IconUsers size={28} />
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
                                                style={{
                                                    letterSpacing: "1px",
                                                }}
                                            >
                                                Access Restricted
                                            </Text>
                                        </div>
                                    </Group>

                                    <UserHeaderPanel
                                        user={user}
                                        displayName={displayName}
                                        onBackClick={onBack}
                                        onNotificationsClick={undefined}
                                        onLogout={handleLogoutClick}
                                        notificationsCount={0}
                                    />
                                </Group>

                                {/* เนื้อหา: แจ้งไม่มีสิทธิ์ */}
                                <Center style={{ minHeight: "50vh" }}>
                                    <Stack gap="xs" align="center">
                                        <Title order={3}>
                                            ไม่มีสิทธิ์เข้าถึง User Management
                                        </Title>
                                        <Text
                                            size="sm"
                                            c="dimmed"
                                            ta="center"
                                        >
                                            กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์{" "}
                                            <Badge
                                                size="xs"
                                                variant="dot"
                                                color="violet"
                                            >
                                                portal.admin.users.view
                                            </Badge>
                                        </Text>
                                    </Stack>
                                </Center>
                            </Stack>
                        </Container>
                    </AppShell.Main>
                </AppShell>
            </div>
        );
    }

    // ---------- ปกติ (มีสิทธิ์) ----------
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
                styles={{
                    main: { backgroundColor: "transparent" },
                }}
            >
                <AppShell.Main>
                    <Container size="xl" py="md">
                        <Stack gap="xl">
                            {/* === HEADER SECTION (Hero + UserHeaderPanel) === */}
                            <Group justify="space-between" align="center">
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
                                        <IconUserCog size={28} />
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
                                            System Center · Manage accounts &
                                            roles
                                        </Text>
                                    </div>
                                </Group>

                                <UserHeaderPanel
                                    user={user}
                                    displayName={displayName}
                                    onBackClick={onBack}
                                    onNotificationsClick={undefined}
                                    onLogout={handleLogoutClick}
                                    notificationsCount={0}
                                />
                            </Group>

                            {/* === MAIN CARD CONTENT (Filters + Table) === */}
                            <Card
                                withBorder
                                radius="md"
                                style={{ backgroundColor: "white" }}
                                p="md"
                                pt="sm"
                            >
                                <Stack gap="xs">
                                    {/* Title + Actions */}
                                    <Group
                                        justify="space-between"
                                        align="flex-end"
                                        wrap="wrap"
                                    >
                                        <Stack gap={2}>
                                            <Text size="sm" fw={600} c="gray.8" style={{ letterSpacing: "0.04em", textTransform: "uppercase" }}>
                                                Users
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                รายชื่อผู้ใช้งานทั้งหมดในระบบ
                                                (เฉพาะ Super Admin / Admin)
                                            </Text>
                                        </Stack>

                                        <Group gap="xs">
                                            <TextInput
                                                placeholder="ค้นหาด้วยชื่อ, email หรือ username"
                                                value={search}
                                                onChange={(e) => setSearch(e.currentTarget.value)}
                                                size="xs"
                                                style={{ minWidth: 240 }}
                                            />

                                            <Select
                                                placeholder="Role"
                                                size="xs"
                                                data={ROLE_FILTER_OPTIONS}
                                                value={roleFilter}
                                                onChange={(v) => setRoleFilter(v)}
                                                clearable
                                                style={{ width: 130 }}
                                            />

                                            <Select
                                                placeholder="Status"
                                                size="xs"
                                                data={STATUS_FILTER_OPTIONS}
                                                value={statusFilter}
                                                onChange={(v) => setStatusFilter(v)}
                                                clearable
                                                style={{ width: 110 }}
                                            />

                                            {canManageUsers && (
                                                <Button
                                                    size="xs"
                                                    leftSection={
                                                        <IconPlus size={14} />
                                                    }
                                                    onClick={
                                                        handleCreateUser
                                                    }
                                                >
                                                    New User
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
                                            users={pageItems}
                                            loading={loading}
                                            canManageUsers={canManageUsers}
                                            onEdit={handleEditUser}
                                            onDelete={handleDeleteUser}
                                        />
                                    </Box>

                                    {/* Footer: Pagination */}
                                    <Box mt="xs" pt={8} style={{ borderTop: "1px solid rgba(226,232,240,1)" }}>
                                        <Group justify="space-between" align="center" wrap="wrap">
                                            {/* Summary */}
                                            <Text size="xs" c="dimmed">
                                                แสดง <strong>{startIndex} - {endIndex}</strong> จาก <strong>{total}</strong> รายการ
                                            </Text>

                                            {/* Controls */}
                                            <Group gap="xs" align="center" wrap="wrap">
                                                <Text size="xs" c="dimmed" mr={2}>แสดงต่อหน้า</Text>
                                                <Select
                                                    size="xs"
                                                    data={PAGE_SIZE_OPTIONS}
                                                    value={String(pageSize)}
                                                    onChange={(v) => {
                                                        const val = parseInt(v || "10", 10);
                                                        setPageSize(Number.isNaN(val) ? 10 : val);
                                                    }}
                                                    style={{ width: 110 }}
                                                />
                                                <Pagination
                                                    size="xs"
                                                    radius="md"
                                                    value={currentPage}
                                                    onChange={setPage}
                                                    total={totalPages}
                                                    withEdges
                                                />
                                            </Group>
                                        </Group>
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