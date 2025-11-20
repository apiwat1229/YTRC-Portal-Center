// src/components/admin/rubbertypes/RubberTypeEditorPage.jsx
import {
    AppShell,
    Badge,
    Button,
    Card,
    Container,
    Group,
    Select,
    Stack,
    Text,
    TextInput,
    Textarea,
    ThemeIcon,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
    IconBox,
    IconCheck,
    IconX,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { can, isSuperuser } from "../../auth/permission";
import UserHeaderPanel from "../../common/UserHeaderPanel";
import { apiRequest } from "../users/userApi";

const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

const PAGE_TITLE = "Rubber Type Editor";
const APP_NAME = "YTRC Portal Center";

export default function RubberTypeEditorPage({ auth, onLogout }) {
    const { user } = auth || {};
    const navigate = useNavigate();
    const { rubbertypeId } = useParams();
    const isEdit = Boolean(rubbertypeId);

    const canManageRubberTypes =
        can(user, "portal.cuplump.rubbertypes.manage") || isSuperuser(user);

    const [loading, setLoading] = useState(false);
    const [initialLoaded, setInitialLoaded] = useState(false);
    const [error, setError] = useState(null);

    const [form, setForm] = useState({
        code: "",
        name: "",
        status: "active",
        description: "",
    });

    useEffect(() => {
        document.title = `${PAGE_TITLE} | ${APP_NAME}`;
    }, []);

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

    // โหลดข้อมูลตอน edit
    useEffect(() => {
        const fetchRubberType = async () => {
            if (!isEdit) {
                setInitialLoaded(true);
                return;
            }
            if (!canManageRubberTypes) {
                setInitialLoaded(true);
                return;
            }

            try {
                setLoading(true);
                const data = await apiRequest(
                    `/rubber-types/${rubbertypeId}`,
                    {},
                    auth
                );

                setForm({
                    code: data.code || "",
                    name: data.name || "",
                    status: (data.status || "active").toLowerCase(),
                    description: data.description || "",
                });
            } catch (err) {
                console.error("[RubberTypeEditor] fetch error:", err);
                showNotification({
                    title: "โหลดข้อมูลไม่สำเร็จ",
                    message:
                        err?.message ||
                        "ไม่สามารถโหลดข้อมูลประเภทยางจากเซิร์ฟเวอร์ได้",
                    color: "red",
                    icon: <IconX size={16} />,
                });
            } finally {
                setLoading(false);
                setInitialLoaded(true);
            }
        };

        fetchRubberType();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rubbertypeId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!form.code) {
            setError("กรุณาระบุรหัส (code)");
            return;
        }
        if (!form.name) {
            setError("กรุณาระบุชื่อประเภทยาง (name)");
            return;
        }

        const payload = {
            code: form.code.trim(),
            name: form.name.trim(),
            status: form.status || "active",
            description: form.description || null,
        };

        try {
            setLoading(true);
            let result;

            if (!isEdit) {
                // CREATE → POST /rubber-types/
                result = await apiRequest(
                    "/rubber-types/",
                    {
                        method: "POST",
                        body: JSON.stringify(payload),
                    },
                    auth
                );
                showNotification({
                    title: "สร้างประเภทยางสำเร็จ",
                    message: `${result.code} - ${result.name}`,
                    color: "green",
                    icon: <IconCheck size={16} />,
                });
            } else {
                // EDIT → PUT /rubber-types/{id}
                const body = {
                    name: payload.name,
                    status: payload.status,
                    description: payload.description,
                };

                result = await apiRequest(
                    `/rubber-types/${rubbertypeId}`,
                    {
                        method: "PUT",
                        body: JSON.stringify(body),
                    },
                    auth
                );
                showNotification({
                    title: "อัปเดตประเภทยางสำเร็จ",
                    message: `${result.code} - ${result.name}`,
                    color: "green",
                    icon: <IconCheck size={16} />,
                });
            }

            navigate("/system/rubber-types");
        } catch (err) {
            console.error("[RubberTypeEditor] submit error:", err);
            const msg =
                typeof err?.message === "string"
                    ? err.message
                    : "ไม่สามารถบันทึกข้อมูลประเภทยางได้";
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

    const handleBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            navigate("/system/rubber-types");
        }
    };

    // NO ACCESS
    if (!canManageRubberTypes) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    backgroundColor: "#f3f4f6",
                    backgroundImage:
                        "radial-gradient(at 0% 0%, rgba(59,130,246,0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(139,92,246,0.1) 0px, transparent 50%)",
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
                                <Group justify="space-between" align="center">
                                    <Group gap="md">
                                        <ThemeIcon
                                            size={48}
                                            radius="md"
                                            variant="gradient"
                                            gradient={{
                                                from: "green",
                                                to: "teal",
                                                deg: 135,
                                            }}
                                        >
                                            <IconBox size={28} />
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
                                                style={{
                                                    letterSpacing: "1px",
                                                }}
                                            >
                                                Master Data
                                            </Text>
                                        </div>
                                    </Group>

                                    <UserHeaderPanel
                                        user={user}
                                        displayName={displayName}
                                        onBackClick={handleBack}
                                        onLogout={onLogout}
                                        notificationsCount={0}
                                    />
                                </Group>

                                <Card withBorder radius="md">
                                    <Stack gap="xs" align="center" py="lg">
                                        <Text fw={600}>
                                            คุณไม่มีสิทธิ์จัดการประเภทยาง
                                        </Text>
                                        <Text size="sm" c="dimmed" ta="center">
                                            กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์{" "}
                                            <Badge
                                                size="xs"
                                                variant="dot"
                                                color="violet"
                                            >
                                                portal.cuplump.rubbertypes.manage
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

    if (!initialLoaded && isEdit) {
        // กำลังโหลดข้อมูลตอน edit
        return null;
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f3f4f6",
                backgroundImage:
                    "radial-gradient(at 0% 0%, rgba(59,130,246,0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(139,92,246,0.1) 0px, transparent 50%)",
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
                            {/* HEADER แบบ StarterPage */}
                            <Group justify="space-between" align="center">
                                <Group gap="md">
                                    <ThemeIcon
                                        size={48}
                                        radius="md"
                                        variant="gradient"
                                        gradient={{
                                            from: "green",
                                            to: "teal",
                                            deg: 135,
                                        }}
                                    >
                                        <IconBox size={28} />
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
                                                ? "EDIT RUBBER TYPE"
                                                : "CREATE RUBBER TYPE"}
                                        </Text>
                                        <Text
                                            size="xs"
                                            fw={500}
                                            c="dimmed"
                                            tt="uppercase"
                                            style={{ letterSpacing: "1px" }}
                                        >
                                            {isEdit
                                                ? "Update existing rubber type"
                                                : "Register new rubber type"}
                                        </Text>
                                    </div>
                                </Group>

                                <UserHeaderPanel
                                    user={user}
                                    displayName={displayName}
                                    onBackClick={handleBack}
                                    onLogout={onLogout}
                                    notificationsCount={0}
                                />
                            </Group>

                            {/* FORM CARD */}
                            <Card withBorder radius="md">
                                <form onSubmit={handleSubmit}>
                                    <Stack gap="md">
                                        {/* code / name */}
                                        <Group grow wrap="wrap">
                                            <TextInput
                                                label="Code"
                                                placeholder="เช่น STR20_CL"
                                                value={form.code}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "code",
                                                        e.currentTarget.value
                                                    )
                                                }
                                                required
                                                disabled={isEdit} // code ไม่ให้แก้ตอน edit
                                            />
                                            <TextInput
                                                label="Name"
                                                placeholder="เช่น STR20 Crumb Latex"
                                                value={form.name}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "name",
                                                        e.currentTarget.value
                                                    )
                                                }
                                                required
                                            />
                                        </Group>

                                        {/* status */}
                                        <Group grow wrap="wrap">
                                            <Select
                                                label="Status"
                                                data={statusOptions}
                                                value={form.status}
                                                onChange={(v) =>
                                                    handleChange(
                                                        "status",
                                                        v || "active"
                                                    )
                                                }
                                                required
                                            />
                                        </Group>

                                        {/* description */}
                                        <Textarea
                                            label="Description"
                                            minRows={3}
                                            value={form.description}
                                            onChange={(e) =>
                                                handleChange(
                                                    "description",
                                                    e.currentTarget.value
                                                )
                                            }
                                            placeholder="รายละเอียดเพิ่มเติมของประเภทยาง เช่น คุณสมบัติการรับซื้อ เงื่อนไข ฯลฯ"
                                        />

                                        {error && (
                                            <Text size="xs" c="red">
                                                {error}
                                            </Text>
                                        )}

                                        <Group justify="flex-end" mt="sm">
                                            <Button
                                                variant="default"
                                                onClick={handleBack}
                                                disabled={loading}
                                            >
                                                ยกเลิก
                                            </Button>
                                            <Button
                                                type="submit"
                                                loading={loading}
                                            >
                                                {isEdit
                                                    ? "บันทึกการเปลี่ยนแปลง"
                                                    : "สร้างประเภทยาง"}
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