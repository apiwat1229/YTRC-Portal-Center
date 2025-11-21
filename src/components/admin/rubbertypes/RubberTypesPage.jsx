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

export default function RubberTypesPage({ auth, onLogout }) {
    const { user } = auth || {};
    const navigate = useNavigate();

    const canViewRubberTypes = can(user, "portal.cuplump.rubbertypes.view");
    const canManageRubberTypes =
        can(user, "portal.cuplump.rubbertypes.manage") || isSuperuser(user);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState(null);
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

    // โหลดรายการ Rubber Types
    const fetchRubberTypes = async () => {
        if (!canViewRubberTypes) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append("q", search);
            if (statusFilter) params.append("status_filter", statusFilter);
            params.append("limit", String(limit));
            params.append("skip", String((page - 1) * limit));

            const data = await apiRequest(
                `/rubber-types?${params.toString()}`,
                {},
                auth
            );
            setItems(Array.isArray(data) ? data : []);
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
    }, [search, statusFilter, page]);

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
        if (!item?.id && !item?._id) return;
        const id = item.id || item._id;
        navigate(`/system/rubber-types/${id}/edit`);
    };

    const handleDelete = async (item) => {
        if (!canManageRubberTypes) return;
        const id = item.id || item._id;
        if (!id) return;

        try {
            setLoadingAction(true);
            await apiRequest(`/rubber-types/${id}`, { method: "DELETE" }, auth);
            setItems((prev) => prev.filter((x) => (x.id || x._id) !== id));

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

    const effectiveNotificationsCount = 0;

    // ถ้าไม่มีสิทธิ์ view เลย
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
                                {/* Header */}
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
                                                RUBBER TYPES
                                            </Text>
                                            <Text
                                                size="xs"
                                                fw={500}
                                                c="dimmed"
                                                tt="uppercase"
                                                style={{ letterSpacing: "1px" }}
                                            >
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
                                        <Title order={4}>
                                            คุณไม่มีสิทธิ์เข้าถึงข้อมูล Rubber Types
                                        </Title>
                                        <Text size="sm" c="dimmed" ta="center">
                                            กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์{" "}
                                            <Badge
                                                size="xs"
                                                variant="dot"
                                                color="violet"
                                            >
                                                portal.cuplump.rubbertypes.view
                                            </Badge>
                                        </Text>
                                        <Button
                                            leftSection={<IconArrowLeft size={14} />}
                                            mt="sm"
                                            onClick={handleGoBackSystem}
                                        >
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

    // ปกติ (มีสิทธิ์)
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
                            {/* HEADER แบบ StarterPage */}
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
                                        <IconCookie size={28} />
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
                                            RUBBER TYPES
                                        </Text>
                                        <Text
                                            size="xs"
                                            fw={500}
                                            c="dimmed"
                                            tt="uppercase"
                                            style={{ letterSpacing: "1px" }}
                                        >
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

                            {/* MAIN CONTENT */}
                            <Card withBorder radius="md" shadow="xs">
                                <Stack gap="sm">
                                    <Group
                                        justify="space-between"
                                        align="flex-end"
                                    >
                                        <Stack gap={2}>
                                            <Title order={5}>Rubber Types</Title>
                                            <Text size="xs" c="dimmed">
                                                จัดการประเภทของยาง เช่น STR20, USS, FSC ฯลฯ
                                            </Text>
                                        </Stack>

                                        <Group gap="xs">
                                            <TextInput
                                                placeholder="ค้นหาด้วย code หรือ name"
                                                size="xs"
                                                value={search}
                                                onChange={(e) => {
                                                    setPage(1);
                                                    setSearch(
                                                        e.currentTarget.value
                                                    );
                                                }}
                                                style={{ minWidth: 220 }}
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
                                            {canManageRubberTypes && (
                                                <Button
                                                    size="xs"
                                                    leftSection={
                                                        <IconPlus size={14} />
                                                    }
                                                    onClick={handleCreate}
                                                >
                                                    New Rubber Type
                                                </Button>
                                            )}
                                        </Group>
                                    </Group>

                                    <Divider my="xs" />

                                    <Box
                                        style={{
                                            borderRadius: 8,
                                            border: "1px solid rgba(226,232,240,1)",
                                            overflow: "hidden",
                                        }}
                                    >
                                        <RubberTypesTable
                                            rubberTypes={items}  // 👈 แก้ตรงนี้
                                            loading={loading}
                                            canManageRubberTypes={
                                                canManageRubberTypes
                                            }
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
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