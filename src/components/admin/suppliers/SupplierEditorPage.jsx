// src/components/admin/suppliers/SupplierEditorPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    AppShell,
    Badge,
    Box,
    Button,
    Card,
    Container,
    Divider,
    Group,
    InputBase,
    MultiSelect,
    Select,
    Stack,
    Text,
    TextInput,
    Textarea,
    ThemeIcon,
    Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
    IconCheck,
    IconTruck,
    IconUser,
    IconUserPlus,
    IconX,
} from "@tabler/icons-react";

import { can, isSuperuser } from "../../auth/permission";
import UserHeaderPanel from "../../common/UserHeaderPanel";
import { apiRequest } from "../users/userApi";

const STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "suspended", label: "Suspended" },
];

const TITLE_OPTIONS = [
    { value: "นาย", label: "นาย" },
    { value: "นาง", label: "นาง" },
    { value: "นางสาว", label: "นางสาว" },
    { value: "บริษัท", label: "บริษัท" },
    { value: "ว่าที่ ร.ต.", label: "ว่าที่ ร.ต." },
    { value: "สหกรณ์", label: "สหกรณ์" },
    { value: "หจก.", label: "หจก." },
];

// helper: เก็บเลขล้วน 0-9 ไม่เกิน 11 หลัก
const normalizePhoneDigits = (value) =>
    (value || "").replace(/\D/g, "").slice(0, 11);

// helper: แสดงผลแบบ xxx-xxxx-xxxx
const formatPhone = (value) => {
    const digits = normalizePhoneDigits(value);
    if (!digits) return "";
    if (digits.length <= 3) return digits;
    if (digits.length <= 7)
        return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

export default function SupplierEditorPage({ auth, onLogout }) {
    const { user } = auth || {};
    const navigate = useNavigate();
    const params = useParams();
    const supplierId = params.supplierId || null;
    const isEdit = Boolean(supplierId);

    const canManageSuppliers =
        can(user, "portal.cuplump.suppliers.manage") || isSuperuser(user);

    const [loading, setLoading] = useState(false);
    const [initialLoaded, setInitialLoaded] = useState(false);
    const [error, setError] = useState(null);

    const [rubberTypeOptions, setRubberTypeOptions] = useState([]);

    // options: จังหวัด / อำเภอ / ตำบล
    const [provinceOptions, setProvinceOptions] = useState([]);
    const [districtOptions, setDistrictOptions] = useState([]);
    const [subDistrictOptions, setSubDistrictOptions] = useState([]);

    // ฟอร์มหลัก
    const [form, setForm] = useState({
        code: "",
        title: "",
        first_name: "",
        last_name: "",
        phone: "", // เก็บเลขล้วน เช่น "0812345678"
        email: "",
        status: "active",
        rubber_type_codes: [],

        address_line: "",
        province_id: null,
        province_th: "",
        district_id: null,
        district_th: "",
        sub_district_id: null,
        sub_district_th: "",
        zipcode: "",

        remark: "", // 👈 เพิ่ม remark
    });

    const displayName = useMemo(() => {
        if (!user) return "";
        return (
            user.display_name ||
            [user.first_name, user.last_name].filter(Boolean).join(" ") ||
            user.username ||
            user.email
        );
    }, [user]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleGoBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            navigate("/system/suppliers");
        }
    };

    // ---------- โหลด Rubber Types ----------
    const loadRubberTypes = async () => {
        try {
            const data = await apiRequest(
                "/rubber-types?status_filter=active&limit=200",
                {},
                auth
            );
            const opts = Array.isArray(data)
                ? data.map((rt) => ({
                    value: rt.code,
                    // ให้แสดงเฉพาะ name
                    label: rt.name || rt.code,
                }))
                : [];
            setRubberTypeOptions(opts);
        } catch (err) {
            console.error("[SupplierEditorPage] loadRubberTypes error:", err);
        }
    };

    // ---------- Thai Geo APIs ----------
    const loadProvinces = async () => {
        try {
            const res = await apiRequest(
                "/th/provinces?limit=200&sort=name_th",
                {},
                auth
            );
            const items = Array.isArray(res.items) ? res.items : res;

            setProvinceOptions(
                items.map((p) => ({
                    value: String(p.id ?? p._id),
                    label: p.name_th,
                }))
            );
        } catch (err) {
            console.error("[SupplierEditorPage] loadProvinces error:", err);
            showNotification({
                title: "โหลดจังหวัดไม่สำเร็จ",
                message: err.message || "ไม่สามารถดึงรายการจังหวัดได้",
                color: "red",
                icon: <IconX size={16} />,
            });
        }
    };

    const loadDistricts = async (provinceId) => {
        if (!provinceId) {
            setDistrictOptions([]);
            return;
        }
        try {
            const res = await apiRequest(
                `/th/districts?province_id=${provinceId}&limit=200&sort=name_th`,
                {},
                auth
            );
            const items = Array.isArray(res.items) ? res.items : res;

            setDistrictOptions(
                items.map((d) => ({
                    value: String(d.id ?? d._id),
                    label: d.name_th,
                }))
            );
        } catch (err) {
            console.error("[SupplierEditorPage] loadDistricts error:", err);
            showNotification({
                title: "โหลดอำเภอไม่สำเร็จ",
                message: err.message || "ไม่สามารถดึงรายการอำเภอได้",
                color: "red",
                icon: <IconX size={16} />,
            });
        }
    };

    const loadSubDistricts = async (districtId) => {
        if (!districtId) {
            setSubDistrictOptions([]);
            return;
        }
        try {
            const res = await apiRequest(
                `/th/sub-districts?district_id=${districtId}&limit=200&sort=name_th`,
                {},
                auth
            );
            const items = Array.isArray(res.items) ? res.items : res;

            setSubDistrictOptions(
                items.map((s) => ({
                    value: String(s.id ?? s._id),
                    label: s.name_th,
                    zip_code: s.zip_code || "",
                }))
            );
        } catch (err) {
            console.error("[SupplierEditorPage] loadSubDistricts error:", err);
            showNotification({
                title: "โหลดตำบลไม่สำเร็จ",
                message: err.message || "ไม่สามารถดึงรายการตำบลได้",
                color: "red",
                icon: <IconX size={16} />,
            });
        }
    };

    // ---------- โหลด Supplier ตอนแก้ไข ----------
    const loadSupplier = async () => {
        if (!isEdit || !canManageSuppliers) {
            setInitialLoaded(true);
            return;
        }

        try {
            setLoading(true);
            const data = await apiRequest(
                `/suppliers/${supplierId}`,
                {},
                auth
            );

            const addr = data.address || {};
            const provinceId = addr.province_id ?? null;
            const districtId = addr.district_id ?? null;
            const subDistrictId = addr.sub_district_id ?? null;

            const rawPhone = normalizePhoneDigits(data.phone || "");

            setForm({
                code: data.code || "",
                title: data.title || "",
                first_name: data.first_name || "",
                last_name: data.last_name || "",
                phone: rawPhone,
                email: data.email || "",
                status:
                    (data.status
                        ? String(data.status).toLowerCase()
                        : "active") || "active",
                rubber_type_codes:
                    Array.isArray(data.rubber_type_codes) &&
                        data.rubber_type_codes.length > 0
                        ? data.rubber_type_codes
                        : [],

                address_line: addr.address_line || "",
                province_id: provinceId ? String(provinceId) : null,
                province_th:
                    addr.province_th || addr.province || addr.changwat || "",
                district_id: districtId ? String(districtId) : null,
                district_th:
                    addr.district_th || addr.amphoe || addr.district || "",
                sub_district_id: subDistrictId ? String(subDistrictId) : null,
                sub_district_th:
                    addr.sub_district_th ||
                    addr.tambon ||
                    addr.subdistrict ||
                    "",
                zipcode: addr.zipcode || addr.zip_code || "",

                remark: data.remark || "", // 👈 โหลด remark จาก backend
            });

            if (provinceId) {
                await loadDistricts(provinceId);
            }
            if (districtId) {
                await loadSubDistricts(districtId);
            }
        } catch (err) {
            console.error("[SupplierEditorPage] loadSupplier error:", err);
            showNotification({
                title: "โหลดข้อมูล Supplier ไม่สำเร็จ",
                message:
                    err.message ||
                    "เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ขายจากเซิร์ฟเวอร์",
                color: "red",
                icon: <IconX size={16} />,
            });
        } finally {
            setLoading(false);
            setInitialLoaded(true);
        }
    };

    // ---------- useEffect ----------
    useEffect(() => {
        loadRubberTypes();
        loadProvinces();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        loadSupplier();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supplierId]);

    // ---------- Submit ----------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!form.code.trim()) {
            setError("กรุณากรอก Code ของ Supplier");
            return;
        }
        if (!form.first_name && !form.last_name && !form.title) {
            setError("กรุณากรอกอย่างน้อยชื่อ/นามสกุล หรือคำนำหน้า");
            return;
        }

        const payload = {
            code: form.code.trim(),
            title: form.title || null,
            first_name: form.first_name || null,
            last_name: form.last_name || null,
            // ส่งเลขล้วนไปที่ backend
            phone: form.phone ? normalizePhoneDigits(form.phone) : null,
            email: form.email || null,
            status: form.status || "active",
            rubber_type_codes: Array.isArray(form.rubber_type_codes)
                ? form.rubber_type_codes
                : [],
            address: {
                address_line: form.address_line || null,
                sub_district_th: form.sub_district_th || null,
                district_th: form.district_th || null,
                province_th: form.province_th || null,
                zipcode: form.zipcode || null,
                sub_district_id: form.sub_district_id
                    ? Number(form.sub_district_id)
                    : null,
                district_id: form.district_id
                    ? Number(form.district_id)
                    : null,
                province_id: form.province_id
                    ? Number(form.province_id)
                    : null,
            },
            remark: form.remark || null, // 👈 ส่ง remark ไป backend
        };

        try {
            setLoading(true);
            let result;
            if (!isEdit) {
                result = await apiRequest(
                    "/suppliers/",
                    {
                        method: "POST",
                        body: JSON.stringify(payload),
                    },
                    auth
                );
                showNotification({
                    title: "สร้าง Supplier สำเร็จ",
                    message: result.display_name || result.code,
                    color: "green",
                    icon: <IconCheck size={16} />,
                });
            } else {
                result = await apiRequest(
                    `/suppliers/${supplierId}`,
                    {
                        method: "PATCH",
                        body: JSON.stringify(payload),
                    },
                    auth
                );
                showNotification({
                    title: "อัปเดต Supplier สำเร็จ",
                    message: result.display_name || result.code,
                    color: "green",
                    icon: <IconCheck size={16} />,
                });
            }

            navigate("/system/suppliers");
        } catch (err) {
            console.error("[SupplierEditorPage] submit error:", err);
            const msg =
                typeof err.message === "string"
                    ? err.message
                    : "ไม่สามารถบันทึกข้อมูล Supplier ได้";
            setError(msg);
            showNotification({
                title: "บันทึกข้อมูลไม่สำเร็จ",
                message: msg,
                color: "red",
                icon: <IconX size={16} />,
            });
        } finally {
            setLoading(false);
        }
    };

    /* ====== ไม่มีสิทธิ์ manage ====== */
    if (!canManageSuppliers) {
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
                                            gradient={{
                                                from: "blue",
                                                to: "indigo",
                                                deg: 135,
                                            }}
                                        >
                                            <IconTruck size={28} />
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
                                                YTRC Master Data
                                            </Text>
                                        </div>
                                    </Group>

                                    <UserHeaderPanel
                                        user={user}
                                        displayName={displayName}
                                        onBackClick={handleGoBack}
                                        onNotificationsClick={() => { }}
                                        onLogout={onLogout}
                                        notificationsCount={0}
                                    />
                                </Group>

                                <Card withBorder radius="md" shadow="xs">
                                    <Stack gap="sm" align="center">
                                        <Title order={4}>
                                            คุณไม่มีสิทธิ์สร้าง/แก้ไข Supplier
                                        </Title>
                                        <Text size="sm" c="dimmed" ta="center">
                                            กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์{" "}
                                            <Badge
                                                size="xs"
                                                variant="dot"
                                                color="violet"
                                            >
                                                portal.cuplump.suppliers.manage
                                            </Badge>
                                        </Text>
                                        <Button mt="sm" onClick={handleGoBack}>
                                            กลับไปหน้า Suppliers
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

    /* ====== ปกติ ====== */
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
                                        {isEdit ? (
                                            <IconUser size={26} />
                                        ) : (
                                            <IconUserPlus size={26} />
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
                                                ? "EDIT SUPPLIER"
                                                : "NEW SUPPLIER"}
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
                                    onBackClick={handleGoBack}
                                    onNotificationsClick={() => { }}
                                    onLogout={onLogout}
                                    notificationsCount={0}
                                />
                            </Group>

                            <Card withBorder radius="md" shadow="xs">
                                <form onSubmit={handleSubmit}>
                                    <Stack gap="md">
                                        {/* Title section */}
                                        <Stack gap={2}>
                                            <Title order={5}>
                                                {isEdit
                                                    ? "แก้ไขข้อมูล Supplier"
                                                    : "สร้าง Supplier ใหม่"}
                                            </Title>
                                            <Text size="xs" c="dimmed">
                                                ระบุรายละเอียดผู้ขายและประเภทของยางที่เกี่ยวข้อง
                                            </Text>
                                        </Stack>

                                        <Divider my="xs" />

                                        {/* Row 1: Code + Title + First + Last */}
                                        <Group grow align="flex-end" wrap="wrap">
                                            <TextInput
                                                label="Sup code"
                                                required
                                                value={form.code}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "code",
                                                        e.currentTarget.value
                                                    )
                                                }
                                                placeholder="เช่น 0065"
                                            />
                                            <Select
                                                label="คำนำหน้า"
                                                required
                                                placeholder="เลือกคำนำหน้า"
                                                data={TITLE_OPTIONS}
                                                value={form.title}
                                                onChange={(v) =>
                                                    handleChange(
                                                        "title",
                                                        v || ""
                                                    )
                                                }
                                                clearable
                                            />
                                            <TextInput
                                                label="First name"
                                                required
                                                value={form.first_name}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "first_name",
                                                        e.currentTarget.value
                                                    )
                                                }
                                                placeholder="ชื่อ"
                                            />
                                            <TextInput
                                                label="Last name"
                                                required
                                                value={form.last_name}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "last_name",
                                                        e.currentTarget.value
                                                    )
                                                }
                                                placeholder="นามสกุล"
                                            />
                                        </Group>

                                        {/* Address textarea */}
                                        <Box>
                                            <Text fw={600} size="sm" mb={4}>
                                                Address
                                            </Text>
                                            <Textarea
                                                minRows={3}
                                                value={form.address_line}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "address_line",
                                                        e.currentTarget.value
                                                    )
                                                }
                                                placeholder="บ้านเลขที่, หมู่, ถนน ฯลฯ"
                                            />
                                        </Box>

                                        {/* Row: Province / District / Sub-district / Zip */}
                                        <Group grow align="flex-end" wrap="wrap">
                                            <Select
                                                label="จังหวัด"
                                                required
                                                placeholder="เลือกจังหวัด"
                                                data={provinceOptions}
                                                value={form.province_id}
                                                onChange={(val) => {
                                                    const option =
                                                        provinceOptions.find(
                                                            (p) =>
                                                                p.value === val
                                                        );
                                                    handleChange(
                                                        "province_id",
                                                        val
                                                    );
                                                    handleChange(
                                                        "province_th",
                                                        option?.label || ""
                                                    );
                                                    // reset lower level
                                                    handleChange(
                                                        "district_id",
                                                        null
                                                    );
                                                    handleChange(
                                                        "district_th",
                                                        ""
                                                    );
                                                    handleChange(
                                                        "sub_district_id",
                                                        null
                                                    );
                                                    handleChange(
                                                        "sub_district_th",
                                                        ""
                                                    );
                                                    handleChange("zipcode", "");
                                                    if (val) {
                                                        loadDistricts(
                                                            Number(val)
                                                        );
                                                        setSubDistrictOptions(
                                                            []
                                                        );
                                                    } else {
                                                        setDistrictOptions([]);
                                                        setSubDistrictOptions(
                                                            []
                                                        );
                                                    }
                                                }}
                                                searchable
                                                clearable
                                            />
                                            <Select
                                                label="อำเภอ"
                                                required
                                                placeholder="เลือกอำเภอ"
                                                data={districtOptions}
                                                value={form.district_id}
                                                onChange={(val) => {
                                                    const option =
                                                        districtOptions.find(
                                                            (d) =>
                                                                d.value === val
                                                        );
                                                    handleChange(
                                                        "district_id",
                                                        val
                                                    );
                                                    handleChange(
                                                        "district_th",
                                                        option?.label || ""
                                                    );
                                                    // reset ตำบล
                                                    handleChange(
                                                        "sub_district_id",
                                                        null
                                                    );
                                                    handleChange(
                                                        "sub_district_th",
                                                        ""
                                                    );
                                                    handleChange("zipcode", "");
                                                    if (val) {
                                                        loadSubDistricts(
                                                            Number(val)
                                                        );
                                                    } else {
                                                        setSubDistrictOptions(
                                                            []
                                                        );
                                                    }
                                                }}
                                                searchable
                                                clearable
                                                disabled={!form.province_id}
                                            />
                                            <Select
                                                label="ตำบล"
                                                required
                                                placeholder="เลือกตำบล"
                                                data={subDistrictOptions}
                                                value={form.sub_district_id}
                                                onChange={(val) => {
                                                    const option =
                                                        subDistrictOptions.find(
                                                            (s) =>
                                                                s.value === val
                                                        );
                                                    handleChange(
                                                        "sub_district_id",
                                                        val
                                                    );
                                                    handleChange(
                                                        "sub_district_th",
                                                        option?.label || ""
                                                    );
                                                    handleChange(
                                                        "zipcode",
                                                        option?.zip_code || ""
                                                    );
                                                }}
                                                searchable
                                                clearable
                                                disabled={!form.district_id}
                                            />
                                            <TextInput
                                                label="รหัสไปรษณีย์"
                                                value={form.zipcode}
                                                placeholder="เช่น 95000"
                                                disabled // ห้ามแก้ไขด้วยมือ
                                            />
                                        </Group>

                                        {/* Row: Phone / Email / Status */}
                                        <Group grow align="flex-end" wrap="wrap">
                                            <InputBase
                                                label="Phone"
                                                required
                                                component="input"
                                                type="tel"
                                                placeholder="081-234-5678"
                                                value={formatPhone(form.phone)}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "phone",
                                                        normalizePhoneDigits(
                                                            e.currentTarget
                                                                .value
                                                        )
                                                    )
                                                }
                                            />
                                            <TextInput
                                                label="Email"
                                                type="email"
                                                value={form.email}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "email",
                                                        e.currentTarget.value
                                                    )
                                                }
                                            />
                                            <Select
                                                label="Status"
                                                required
                                                data={STATUS_OPTIONS}
                                                value={form.status}
                                                onChange={(v) =>
                                                    handleChange(
                                                        "status",
                                                        v || "active"
                                                    )
                                                }
                                            />
                                        </Group>

                                        {/* Rubber Types */}
                                        <MultiSelect
                                            label="Rubber Types"
                                            required
                                            placeholder="เลือกประเภทยางที่เกี่ยวข้อง"
                                            data={rubberTypeOptions}
                                            value={form.rubber_type_codes}
                                            onChange={(v) =>
                                                handleChange(
                                                    "rubber_type_codes",
                                                    v
                                                )
                                            }
                                            searchable
                                            clearable
                                        />

                                        {/* Remark / Note */}
                                        <Box>
                                            <Text fw={600} size="sm" mb={4}>
                                                Remark / Note
                                            </Text>
                                            <Textarea
                                                minRows={2}
                                                value={form.remark}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "remark",
                                                        e.currentTarget.value
                                                    )
                                                }
                                                placeholder="บันทึกโน้ตเพิ่มเติม เช่น เงื่อนไขการจ่ายเงิน, เงื่อนไขการส่งของ ฯลฯ"
                                            />
                                        </Box>

                                        {error && (
                                            <Text size="xs" c="red">
                                                {error}
                                            </Text>
                                        )}

                                        <Group justify="flex-end" mt="sm">
                                            <Button
                                                variant="default"
                                                onClick={handleGoBack}
                                            >
                                                ยกเลิก
                                            </Button>
                                            <Button
                                                type="submit"
                                                loading={
                                                    loading && initialLoaded
                                                }
                                            >
                                                {isEdit
                                                    ? "บันทึกการเปลี่ยนแปลง"
                                                    : "สร้าง Supplier"}
                                            </Button>
                                        </Group>
                                    </Stack>
                                </form>
                            </Card>
                        </Stack>
                    </Container>
                </AppShell.Main>
            </AppShell>
        </div>
    );
}