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
    MultiSelect,
    Select,
    Stack,
    Text,
    TextInput,
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
    { value: "Mr.", label: "Mr." },
    { value: "Ms.", label: "Ms." },
    { value: "Mrs.", label: "Mrs." },
    { value: "บริษัท", label: "บริษัท" },
];

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

    const [form, setForm] = useState({
        code: "",
        title: "",
        first_name: "",
        last_name: "",
        phone: "",
        email: "",
        status: "active",
        rubber_type_codes: [],
        address_line: "",
        sub_district_th: "",
        district_th: "",
        province_th: "",
        zipcode: "",
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
            navigate("/cuplump/suppliers");
        }
    };

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
                    label: `${rt.code} · ${rt.name}`,
                }))
                : [];
            setRubberTypeOptions(opts);
        } catch (err) {
            console.error("[SupplierEditorPage] loadRubberTypes error:", err);
        }
    };

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
            setForm({
                code: data.code || "",
                title: data.title || "",
                first_name: data.first_name || "",
                last_name: data.last_name || "",
                phone: data.phone || "",
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
                sub_district_th:
                    addr.sub_district_th ||
                    addr.tambon ||
                    addr.subdistrict ||
                    "",
                district_th:
                    addr.district_th || addr.amphoe || addr.district || "",
                province_th:
                    addr.province_th || addr.province || addr.changwat || "",
                zipcode: addr.zipcode || addr.zip_code || "",
            });
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

    useEffect(() => {
        loadRubberTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        loadSupplier();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supplierId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!form.code) {
            setError("กรุณากรอก Code ของ Supplier");
            return;
        }
        if (!form.first_name && !form.last_name && !form.title) {
            setError("กรุณากรอกอย่างน้อยชื่อ/นามสกุล หรือคำนำหน้า");
            return;
        }

        const payload = {
            code: form.code.trim(),
            title: form.title || None,
            first_name: form.first_name || None,
            last_name: form.last_name || None,
            phone: form.phone || None,
            email: form.email || None,
            status: form.status || "active",
            rubber_type_codes: Array.isArray(form.rubber_type_codes)
                ? form.rubber_type_codes
                : [],
            address: {
                address_line: form.address_line || None,
                sub_district_th: form.sub_district_th || None,
                district_th: form.district_th || None,
                province_th: form.province_th || None,
                zipcode: form.zipcode || None,
            },
        };

        try {
            setLoading(true);
            let result;
            if (!isEdit) {
                // CREATE
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
                // UPDATE
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

            navigate("/cuplump/suppliers");
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
                                        <Button
                                            mt="sm"
                                            onClick={handleGoBack}
                                        >
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

                                        {/* Row 1: Code + Status */}
                                        <Group grow wrap="wrap">
                                            <TextInput
                                                label="Code *"
                                                required
                                                value={form.code}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "code",
                                                        e.currentTarget.value
                                                    )
                                                }
                                                description="รหัสประจำ Supplier เช่น SUP001"
                                                disabled={isEdit} // โดยปกติ code ไม่ให้แก้
                                            />
                                            <Select
                                                label="Status"
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

                                        {/* Row 2: Title / First / Last */}
                                        <Group grow wrap="wrap">
                                            <Select
                                                label="คำนำหน้า"
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
                                                label="ชื่อ"
                                                value={form.first_name}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "first_name",
                                                        e.currentTarget.value
                                                    )
                                                }
                                            />
                                            <TextInput
                                                label="นามสกุล"
                                                value={form.last_name}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "last_name",
                                                        e.currentTarget.value
                                                    )
                                                }
                                            />
                                        </Group>

                                        {/* Row 3: Phone / Email */}
                                        <Group grow wrap="wrap">
                                            <TextInput
                                                label="เบอร์โทร"
                                                value={form.phone}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "phone",
                                                        e.currentTarget.value
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
                                        </Group>

                                        {/* Rubber Types */}
                                        <MultiSelect
                                            label="Rubber Types ที่เกี่ยวข้อง"
                                            placeholder="เลือกประเภทของยาง"
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
                                            description="ใช้สำหรับผูก Supplier กับประเภทยางที่อนุญาตให้ซื้อขาย"
                                        />

                                        {/* Address */}
                                        <Box>
                                            <Title order={6} mb={4}>
                                                Address
                                            </Title>
                                            <Stack gap="xs">
                                                <TextInput
                                                    label="ที่อยู่ (บรรทัดหลัก)"
                                                    value={form.address_line}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "address_line",
                                                            e.currentTarget
                                                                .value
                                                        )
                                                    }
                                                />
                                                <Group grow wrap="wrap">
                                                    <TextInput
                                                        label="ตำบล"
                                                        value={
                                                            form.sub_district_th
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "sub_district_th",
                                                                e
                                                                    .currentTarget
                                                                    .value
                                                            )
                                                        }
                                                    />
                                                    <TextInput
                                                        label="อำเภอ"
                                                        value={
                                                            form.district_th
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "district_th",
                                                                e
                                                                    .currentTarget
                                                                    .value
                                                            )
                                                        }
                                                    />
                                                    <TextInput
                                                        label="จังหวัด"
                                                        value={
                                                            form.province_th
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "province_th",
                                                                e
                                                                    .currentTarget
                                                                    .value
                                                            )
                                                        }
                                                    />
                                                    <TextInput
                                                        label="รหัสไปรษณีย์"
                                                        value={form.zipcode}
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "zipcode",
                                                                e
                                                                    .currentTarget
                                                                    .value
                                                            )
                                                        }
                                                    />
                                                </Group>
                                            </Stack>
                                        </Box>

                                        {error && (
                                            <Text size="xs" c="red">
                                                {error}
                                            </Text>
                                        )}

                                        <Group
                                            justify="flex-end"
                                            mt="sm"
                                        >
                                            <Button
                                                variant="default"
                                                onClick={handleGoBack}
                                            >
                                                ยกเลิก
                                            </Button>
                                            <Button
                                                type="submit"
                                                loading={loading && initialLoaded}
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