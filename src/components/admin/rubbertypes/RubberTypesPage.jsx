// src/components/admin/rubbertypes/RubberTypesPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    AppShell,
    Badge,
    Box,
    Button,
    Card,
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
import { showNotification } from "@mantine/notifications";
import {
    IconActivity,
    IconArrowLeft,
    IconCheck,
    IconCookie,
    IconPlus,
    IconX,
} from "@tabler/icons-react";

import { can, isSuperuser } from "../../auth/permission";
import UserHeaderPanel from "../../common/UserHeaderPanel";
import { apiRequest } from "../users/userApi";
import RubberTypesTable from "./RubberTypesTable";

const STATUS_FILTER_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

const PAGE_SIZE_OPTIONS = [
    { value: "10", label: "10 / หน้า" },
    { value: "25", label: "25 / หน้า" },
    { value: "50", label: "50 / หน้า" },
    { value: "100", label: "100 / หน้า" },
];

const FETCH_LIMIT = 200; // โหลดมาสูงสุด 200 รายการ แล้วแบ่งหน้าฝั่ง FE

export default function RubberTypesPage({ auth, onLogout }) {
    const { user } = auth || {};
    const navigate = useNavigate();

    const canViewRubberTypes = can(user, "portal.cuplump.rubbertypes.view");
    const canManageRubberTypes =
        can(user, "portal.cuplump.rubbertypes.manage") || isSuperuser(user);

    // Data States
    const [allItems, setAllItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);

    // Filters & Pagination States
    const [search, setSearch] = useState("");
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

    const effectiveNotificationsCount = 0;

    // ===== โหลดรายการ Rubber Types (Load All) =====
    const fetchRubberTypes = async () => {
        if (!canViewRubberTypes) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append("limit", String(FETCH_LIMIT));
            // params.append("skip", "0"); // ไม่ต้อง skip เพราะเราจะโหลดมา paginate เอง

            const data = await apiRequest(
                `/rubber-types?${params.toString()}`,
                {},
                auth
            );
            setAllItems(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("[RubberTypesPage] fetch error:", err);
            showNotification({
                title: "โหลดรายการ Rubber Types ไม่สำเร็จ",
                message: err.message || "เกิดข้อผิดพลาดในการดึงข้อมูล",
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
        fetchRubberTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ===== Filter Logic =====
    const filteredItems = useMemo(() => {
        const q = search.trim().toLowerCase();

        return allItems.filter((item) => {
            // 1. Status Filter
            if (statusFilter && String(item.status) !== statusFilter) {
                return false;
            }

            // 2. Search Text
            if (!q) return true;
            const nameText = (item.name || "").toLowerCase();
            const codeText = (item.code || "").toLowerCase();
            const descText = (item.description || "").toLowerCase();

            return (
                nameText.includes(q) ||
                codeText.includes(q) ||
                descText.includes(q)
            );
        });
    }, [allItems, search, statusFilter]);

    // Reset page เมื่อ filter เปลี่ยน
    useEffect(() => {
        setPage(1);
    }, [search, statusFilter, pageSize]);

    // ===== Pagination Logic =====
    const total = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);

    const startIndex = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endIndex = total === 0 ? 0 : Math.min(currentPage * pageSize, total);

    const pageItems = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;

        // Sort: Active ขึ้นก่อน, ตามด้วย Code
        const sorted = [...filteredItems].sort((a, b) => {
            if (a.status !== b.status) {
                return a.status === "active" ? -1 : 1;
            }
            return String(a.code).localeCompare(String(b.code));
        });

        return sorted.slice(start, end);
    }, [filteredItems, currentPage, pageSize]);

    // ===== Handlers =====
    const handleGoBackSystem = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            navigate("/system");
        }
    };

    const handleCreate = () => {
        if (!canManageRubberTypes) return;
        navigate("/system/rubber-types/new");
    };

    const handleEdit = (item) => {
        if (!canManageRubberTypes) return;
        const id = item.id || item._id;
        if (!id) return;
        navigate(`/system/rubber-types/${id}/edit`);
    };

    const handleDelete = async (item) => {
        if (!canManageRubberTypes) return;
        const id = item.id || item._id;
        if (!id) return;

        try {
            setLoadingAction(true);
            await apiRequest(`/rubber-types/${id}`, { method: "DELETE" }, auth);

            // Update Local State
            setAllItems((prev) => prev.filter((x) => (x.id || x._id) !== id));

            showNotification({
                title: "ลบ Rubber Type สำเร็จ",
                message: item.code || item.name,
                color: "green",
                icon: <IconCheck size={16} />,
            });
        } catch (err) {
            console.error("[RubberTypesPage] delete error:", err);
            showNotification({
                title: "ลบ Rubber Type ไม่สำเร็จ",
                message: err.message || "เกิดข้อผิดพลาดในการลบข้อมูล",
                color: "red",
                icon: <IconX size={16} />,
            });
        } finally {
            setLoadingAction(false);
        }
    };

    // ===== กรณีไม่มีสิทธิ์เข้าถึง =====
    if (!canViewRubberTypes) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    backgroundColor: "#f3f4f6",
                    backgroundImage:
                        "radial-gradient(at 0% 0%, rgba(59,130,246,0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(139,92,246,0.1) 0px, transparent 50%)",
                    fontFamily:
                        "Outfit, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}
            >
                <AppShell
                    padding="md"
                    styles={{ main: { backgroundColor: "transparent" } }}
                >
                    <AppShell.Main>
                        <Container size="lg" py="md">
                            <Stack gap="xl">
                                <Group justify="space-between" align="center">
                                    <Group gap="md">
                                        <ThemeIcon
                                            size={48}
                                            radius="md"
                                            variant="gradient"
                                            gradient={{ from: "blue", to: "indigo", deg: 135 }}
                                        >
                                            <IconActivity size={28} />
                                        </ThemeIcon>
                                        <div>
                                            <Text size="xl" fw={800} style={{ letterSpacing: "-0.5px", lineHeight: 1.1, color: "#1e293b" }}>
                                                RUBBER TYPES
                                            </Text>
                                            <Text size="xs" fw={500} c="dimmed" tt="uppercase" style={{ letterSpacing: "1px" }}>
                                                YTRC Master Data
                                            </Text>
                                        </div>
                                    </Group>
                                    <UserHeaderPanel
                                        user={user}
                                        displayName={displayName}
                                        onBackClick={handleGoBackSystem}
                                        onNotificationsClick={() => { }}
                                        onLogout={onLogout}
                                        notificationsCount={effectiveNotificationsCount}
                                    />
                                </Group>

                                <Card withBorder radius="md" shadow="xs">
                                    <Stack gap="sm" align="center">
                                        <Title order={4}>คุณไม่มีสิทธิ์เข้าถึงข้อมูล Rubber Types</Title>
                                        <Text size="sm" c="dimmed" ta="center">
                                            กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์{" "}
                                            <Badge size="xs" variant="dot" color="violet">
                                                portal.cuplump.rubbertypes.view
                                            </Badge>
                                        </Text>
                                        <Button leftSection={<IconArrowLeft size={14} />} mt="sm" onClick={handleGoBackSystem}>
                                            กลับไป System Center
                                        </Button>
                                    </Stack>
                                </Card>
                            </Stack>
                        </Container>
                    </AppShell.Main>
                </AppShell>
            </div>
        );
    }

    // ===== กรณีปกติ =====
    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f3f4f6",
                backgroundImage:
                    "radial-gradient(at 0% 0%, rgba(59,130,246,0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(139,92,246,0.1) 0px, transparent 50%)",
                fontFamily:
                    "Outfit, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
        >
            <AppShell
                padding="md"
                styles={{ main: { backgroundColor: "transparent" } }}
            >
                <AppShell.Main>
                    <Container size="lg" py="md">
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
                                        <IconCookie size={28} />
                                    </ThemeIcon>
                                    <div>
                                        <Text size="xl" fw={800} style={{ letterSpacing: "-0.5px", lineHeight: 1.1, color: "#1e293b" }}>
                                            RUBBER TYPES
                                        </Text>
                                        <Text size="xs" fw={500} c="dimmed" tt="uppercase" style={{ letterSpacing: "1px" }}>
                                            Purchasing Data
                                        </Text>
                                    </div>
                                </Group>

                                <UserHeaderPanel
                                    user={user}
                                    displayName={displayName}
                                    onBackClick={handleGoBackSystem}
                                    onNotificationsClick={() => { }}
                                    onLogout={onLogout}
                                    notificationsCount={effectiveNotificationsCount}
                                />
                            </Group>

                            {/* MAIN CARD */}
                            <Card withBorder radius="md" shadow="xs" p="md" pt="sm">
                                <Stack gap="xs">
                                    {/* Title + Filters */}
                                    <Group justify="space-between" align="flex-end" wrap="wrap">
                                        <Stack gap={2}>
                                            <Text size="sm" fw={600} c="gray.8" style={{ letterSpacing: "0.04em", textTransform: "uppercase" }}>
                                                Rubber Types
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                จัดการประเภทของยาง เช่น STR20, USS, FSC ฯลฯ
                                            </Text>
                                        </Stack>

                                        <Group gap="xs">
                                            <TextInput
                                                placeholder="ค้นหาด้วย code หรือ name"
                                                size="xs"
                                                value={search}
                                                onChange={(e) => setSearch(e.currentTarget.value)}
                                                style={{ minWidth: 220 }}
                                            />
                                            <Select
                                                placeholder="Status"
                                                size="xs"
                                                data={STATUS_FILTER_OPTIONS}
                                                value={statusFilter}
                                                onChange={(v) => setStatusFilter(v)}
                                                clearable
                                                style={{ width: 130 }}
                                            />
                                            {canManageRubberTypes && (
                                                <Button
                                                    size="xs"
                                                    leftSection={<IconPlus size={14} />}
                                                    onClick={handleCreate}
                                                >
                                                    New Rubber Type
                                                </Button>
                                            )}
                                        </Group>
                                    </Group>

                                    <Divider my="xs" />

                                    {/* Table */}
                                    <Box
                                        style={{
                                            borderRadius: 8,
                                            border: "1px solid rgba(226,232,240,1)",
                                            overflow: "hidden",
                                        }}
                                    >
                                        <RubberTypesTable
                                            rubberTypes={pageItems} // ส่งเฉพาะหน้าที่ตัดแล้ว
                                            loading={loading}
                                            canManageRubberTypes={canManageRubberTypes}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
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