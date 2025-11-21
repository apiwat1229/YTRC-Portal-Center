// src/components/admin/suppliers/SuppliersPage.jsx
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
    IconPlus,
    IconX,
} from "@tabler/icons-react";

import { can, isSuperuser } from "../../auth/permission";
import UserHeaderPanel from "../../common/UserHeaderPanel";
import { apiRequest } from "../users/userApi";
import SuppliersTable from "./SuppliersTable";

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

const FETCH_LIMIT = 200; // โหลดมาแล้ว filter + paginate ฝั่ง FE

export default function SuppliersPage({ auth, onLogout }) {
    const { user } = auth || {};
    const navigate = useNavigate();

    const canViewSuppliers = can(user, "portal.cuplump.suppliers.view");
    const canManageSuppliers =
        can(user, "portal.cuplump.suppliers.manage") || isSuperuser(user);

    const [allSuppliers, setAllSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState(null);
    const [addressFilter, setAddressFilter] = useState("");
    const [rubberTypeFilter, setRubberTypeFilter] = useState(null);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // rubber types สำหรับ map code -> name + filter
    const [rubberTypesMap, setRubberTypesMap] = useState({});
    const [rubberTypeOptions, setRubberTypeOptions] = useState([]);

    // province options สำหรับ address filter
    const addressOptions = useMemo(() => {
        const set = new Set();

        allSuppliers.forEach((s) => {
            const a = s.address || {};
            const province =
                a.province_th || a.province_en || a.province || a.changwat;
            if (province) set.add(province);
        });

        return Array.from(set)
            .sort((a, b) => a.localeCompare(b, "th"))
            .map((p) => ({ value: p, label: p }));
    }, [allSuppliers]);

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

    // ===== โหลด suppliers + rubber types =====
    useEffect(() => {
        const fetchData = async () => {
            if (!canViewSuppliers) return;

            setLoading(true);
            try {
                // suppliers
                const params = new URLSearchParams();
                params.append("limit", String(FETCH_LIMIT));
                params.append("page", "1");
                const supplierData = await apiRequest(
                    `/suppliers/?${params.toString()}`,
                    {},
                    auth
                );
                setAllSuppliers(Array.isArray(supplierData) ? supplierData : []);

                // rubber types (ใช้สำหรับ map ชื่อ + filter)
                const rt = await apiRequest(`/rubber-types?limit=200`, {}, auth);
                if (Array.isArray(rt)) {
                    const map = {};
                    rt.forEach((r) => {
                        map[r.code] = r;
                    });
                    setRubberTypesMap(map);
                    setRubberTypeOptions(
                        rt.map((r) => ({
                            value: r.code,
                            label: r.name,
                        }))
                    );
                }
            } catch (err) {
                console.error("[SuppliersPage] fetch error:", err);
                showNotification({
                    title: "โหลดรายการ Suppliers ไม่สำเร็จ",
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

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleGoBackSystem = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            navigate("/system");
        }
    };

    const handleCreate = () => {
        if (!canManageSuppliers) return;
        navigate("/system/suppliers/new");
    };

    const handleEdit = (item) => {
        if (!canManageSuppliers) return;
        const id = item.id || item._id || item.supplier_id;
        if (!id) return;
        navigate(`/system/suppliers/${id}/edit`);
    };

    const handleDelete = async (item) => {
        if (!canManageSuppliers) return;
        const id = item.id || item._id || item.supplier_id;
        if (!id) return;

        try {
            setLoadingAction(true);
            await apiRequest(`/suppliers/${id}`, { method: "DELETE" }, auth);
            setAllSuppliers((prev) =>
                prev.filter((s) => (s.id || s._id || s.supplier_id) !== id)
            );
            showNotification({
                title: "ลบ Supplier สำเร็จ",
                message: item.display_name || item.code,
                color: "green",
                icon: <IconCheck size={16} />,
            });
        } catch (err) {
            console.error("[SuppliersPage] delete error:", err);
            showNotification({
                title: "ลบ Supplier ไม่สำเร็จ",
                message: err.message || "เกิดข้อผิดพลาดในการลบข้อมูล",
                color: "red",
                icon: <IconX size={16} />,
            });
        } finally {
            setLoadingAction(false);
        }
    };

    // ===== Filter ทั้งหมด (q + status + address + rubberType) =====
    const filteredSuppliers = useMemo(() => {
        const q = search.trim().toLowerCase();

        return allSuppliers.filter((s) => {
            // status
            if (statusFilter && String(s.status) !== statusFilter) {
                return false;
            }

            // filter Rubber Type (เลือก code)
            if (rubberTypeFilter) {
                const codes = Array.isArray(s.rubber_type_codes)
                    ? s.rubber_type_codes
                    : [];
                if (!codes.includes(rubberTypeFilter)) return false;
            }

            // filter address (จังหวัด)
            if (addressFilter) {
                const a = s.address || {};
                const province =
                    a.province_th || a.province_en || a.province || a.changwat || "";
                if (
                    String(province).toLowerCase() !==
                    String(addressFilter).toLowerCase()
                ) {
                    return false;
                }
            }

            // global search q
            if (!q) return true;

            const addressText = (() => {
                const a = s.address || {};
                return (
                    [
                        a.sub_district_th,
                        a.district_th,
                        a.province_th,
                        a.zipcode || a.zip_code,
                        a.address_line,
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase() || ""
                );
            })();

            const rubberText = (() => {
                const codes = Array.isArray(s.rubber_type_codes)
                    ? s.rubber_type_codes
                    : [];
                return codes
                    .map((code) => rubberTypesMap[code]?.name || code)
                    .join(" ")
                    .toLowerCase();
            })();

            const fullName =
                (s.title || "") +
                (s.first_name || "") +
                (s.last_name ? ` ${s.last_name}` : "");
            const nameText =
                (fullName || s.display_name || "")
                    .toString()
                    .toLowerCase() || "";

            const phoneText = (s.phone || "").toString().toLowerCase();
            const emailText = (s.email || "").toString().toLowerCase();
            const codeText = (s.code || "").toString().toLowerCase();

            return (
                nameText.includes(q) ||
                codeText.includes(q) ||
                phoneText.includes(q) ||
                emailText.includes(q) ||
                addressText.includes(q) ||
                rubberText.includes(q)
            );
        });
    }, [
        allSuppliers,
        search,
        statusFilter,
        addressFilter,
        rubberTypeFilter,
        rubberTypesMap,
    ]);

    // reset page เมื่อ filter เปลี่ยน
    useEffect(() => {
        setPage(1);
    }, [search, statusFilter, addressFilter, rubberTypeFilter, pageSize]);

    // ===== Pagination =====
    const total = filteredSuppliers.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);

    const startIndex = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endIndex =
        total === 0
            ? 0
            : Math.min(currentPage * pageSize, filteredSuppliers.length);

    const pageItems = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        return filteredSuppliers.slice(start, end);
    }, [filteredSuppliers, currentPage, pageSize]);

    // ===== ถ้าไม่มีสิทธิ์ view =====
    if (!canViewSuppliers) {
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
                                                SUPPLIERS
                                            </Text>
                                            <Text
                                                size="xs"
                                                fw={500}
                                                c="dimmed"
                                                tt="uppercase"
                                                style={{ letterSpacing: "1px" }}
                                            >
                                                YTRC MASTER DATA
                                            </Text>
                                        </div>
                                    </Group>

                                    <UserHeaderPanel
                                        user={user}
                                        displayName={displayName}
                                        onBackClick={handleGoBackSystem}
                                        onNotificationsClick={() => { }}
                                        onLogout={onLogout}
                                        notificationsCount={
                                            effectiveNotificationsCount
                                        }
                                    />
                                </Group>

                                <Card withBorder radius="md" shadow="xs">
                                    <Stack gap="sm" align="center">
                                        <Title order={4}>
                                            คุณไม่มีสิทธิ์เข้าถึงข้อมูล Suppliers
                                        </Title>
                                        <Text size="sm" c="dimmed" ta="center">
                                            กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์{" "}
                                            <Badge
                                                size="xs"
                                                variant="dot"
                                                color="violet"
                                            >
                                                portal.cuplump.suppliers.view
                                            </Badge>
                                        </Text>
                                        <Button
                                            leftSection={
                                                <IconArrowLeft size={14} />
                                            }
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

    // ===== ปกติ =====
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
                                            SUPPLIERS
                                        </Text>
                                        <Text
                                            size="xs"
                                            fw={500}
                                            c="dimmed"
                                            tt="uppercase"
                                            style={{ letterSpacing: "1px" }}
                                        >
                                            YTRC MASTER DATA
                                        </Text>
                                    </div>
                                </Group>

                                <UserHeaderPanel
                                    user={user}
                                    displayName={displayName}
                                    onBackClick={handleGoBackSystem}
                                    onNotificationsClick={() => { }}
                                    onLogout={onLogout}
                                    notificationsCount={
                                        effectiveNotificationsCount
                                    }
                                />
                            </Group>

                            {/* MAIN CARD */}
                            <Card
                                withBorder
                                radius="md"
                                shadow="xs"
                                p="md"
                                pt="sm"   // ⬅ ทำให้หัวข้อชิดขอบบนมากขึ้น
                            >
                                <Stack gap="xs">
                                    {/* Title block + filters อยู่บนสุดของ Card */}
                                    <Group
                                        justify="space-between"
                                        align="flex-start"
                                        gap="md"
                                        wrap="wrap"
                                    >
                                        {/* Left: Title + subtitle */}
                                        <Box>
                                            <Text
                                                size="sm"
                                                fw={600}
                                                c="gray.8"
                                                style={{
                                                    letterSpacing: "0.04em",
                                                    textTransform: "uppercase",
                                                }}
                                            >
                                                Suppliers
                                            </Text>
                                            <Text
                                                size="xs"
                                                c="dimmed"
                                                mt={2}
                                                style={{ maxWidth: 420 }}
                                            >
                                                จัดการข้อมูลคู่ค้า/ผู้ส่งมอบ
                                                สำหรับระบบรับซื้อยางและระบบคิว
                                            </Text>
                                        </Box>

                                        {/* Right: filters + New button */}
                                        <Group gap="xs" wrap="wrap" align="flex-end">
                                            {/* Global search */}
                                            <TextInput
                                                placeholder="ค้นหาด้วยชื่อ, code, phone, email, address, rubber type"
                                                size="xs"
                                                value={search}
                                                onChange={(e) =>
                                                    setSearch(
                                                        e.currentTarget.value
                                                    )
                                                }
                                                style={{ minWidth: 260 }}
                                            />

                                            {/* Status */}
                                            <Select
                                                placeholder="Status"
                                                size="xs"
                                                data={STATUS_FILTER_OPTIONS}
                                                value={statusFilter}
                                                onChange={(v) =>
                                                    setStatusFilter(v)
                                                }
                                                clearable
                                                style={{ width: 130 }}
                                            />

                                            {/* Rubber Types filter */}
                                            <Select
                                                placeholder="Rubber Types"
                                                size="xs"
                                                data={rubberTypeOptions}
                                                value={rubberTypeFilter}
                                                onChange={(v) =>
                                                    setRubberTypeFilter(v)
                                                }
                                                searchable
                                                clearable
                                                style={{ width: 180 }}
                                            />

                                            {/* Address filter (จังหวัด) */}
                                            <Select
                                                placeholder="จังหวัด"
                                                size="xs"
                                                data={addressOptions}
                                                value={addressFilter}
                                                onChange={(v) =>
                                                    setAddressFilter(v || "")
                                                }
                                                searchable
                                                clearable
                                                style={{ width: 160 }}
                                            />

                                            {canManageSuppliers && (
                                                <Button
                                                    size="xs"
                                                    leftSection={
                                                        <IconPlus size={14} />
                                                    }
                                                    onClick={handleCreate}
                                                    style={{ marginLeft: 4 }}
                                                >
                                                    New Supplier
                                                </Button>
                                            )}
                                        </Group>
                                    </Group>

                                    <Divider my="xs" />

                                    {/* TABLE */}
                                    <Box
                                        style={{
                                            borderRadius: 8,
                                            border: "1px solid rgba(226,232,240,1)",
                                            overflow: "hidden",
                                        }}
                                    >
                                        <SuppliersTable
                                            suppliers={pageItems}
                                            loading={loading}
                                            canManageSuppliers={
                                                canManageSuppliers
                                            }
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            rubberTypesMap={rubberTypesMap}
                                        />
                                    </Box>

                                    {/* Footer: summary + pagination */}
                                    <Box
                                        mt="xs"
                                        pt={8}
                                        style={{
                                            borderTop:
                                                "1px solid rgba(226,232,240,1)",
                                        }}
                                    >
                                        <Group
                                            justify="space-between"
                                            align="center"
                                            wrap="wrap"
                                        >
                                            {/* summary */}
                                            <Text size="xs" c="dimmed">
                                                แสดง{" "}
                                                <strong>
                                                    {startIndex} - {endIndex}
                                                </strong>{" "}
                                                จาก{" "}
                                                <strong>{total}</strong>{" "}
                                                รายการ
                                            </Text>

                                            <Group
                                                gap="xs"
                                                align="center"
                                                wrap="wrap"
                                            >
                                                <Text
                                                    size="xs"
                                                    c="dimmed"
                                                    mr={2}
                                                >
                                                    แสดงต่อหน้า
                                                </Text>
                                                <Select
                                                    size="xs"
                                                    data={PAGE_SIZE_OPTIONS}
                                                    value={String(pageSize)}
                                                    onChange={(v) => {
                                                        const val = parseInt(
                                                            v || "10",
                                                            10
                                                        );
                                                        setPageSize(
                                                            isNaN(val)
                                                                ? 10
                                                                : val
                                                        );
                                                        setPage(1);
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