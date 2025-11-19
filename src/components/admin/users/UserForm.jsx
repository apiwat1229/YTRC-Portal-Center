// src/components/admin/users/UserForm.jsx
import { Button, Group, Select, Stack, Text, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { apiRequest } from "./userApi";

// ใช้ enum ให้ตรงกับฝั่ง FastAPI
const ROLE_OPTIONS = [
    { value: "super_admin", label: "Super Admin" },
    { value: "admin", label: "Admin" },
    { value: "user", label: "Staff" }, // map Staff -> user
    { value: "viewer", label: "Viewer" },
];

const STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "suspended", label: "Suspended" },
];

export default function UserForm({
    auth,
    mode, // "create" | "edit"
    initial,
    onSubmitSuccess,
    onCancel,
    setLoadingAction,
}) {
    const isEdit = mode === "edit";

    // รองรับ id หลายแบบ เผื่อ backend เปลี่ยนชื่อ field
    const userId = initial?.id || initial?._id || initial?.user_id || null;

    const buildInitialForm = (initialUser) => ({
        email: initialUser?.email || "",
        username: initialUser?.username || "",
        first_name: initialUser?.first_name || "",
        last_name: initialUser?.last_name || "",
        display_name: initialUser?.display_name || "",
        department: initialUser?.department || "",
        position: initialUser?.position || "",
        // ⚠️ default เป็นค่า enum ตัวเล็กให้ตรง backend
        role: initialUser?.role || "user",
        status: initialUser?.status || "active",
        permissions: Array.isArray(initialUser?.permissions)
            ? initialUser.permissions.join(", ")
            : "",
        is_superuser: Boolean(initialUser?.is_superuser),
        hod_user_id: initialUser?.hod_user_id || "",
        password: "", // create: required, edit: optional
    });

    const [form, setForm] = useState(() => buildInitialForm(initial));
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEdit && initial) {
            setForm(buildInitialForm(initial));
        }
    }, [isEdit, initial]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!form.email) {
            setError("กรุณากรอกอีเมล");
            return;
        }
        if (mode === "create" && !form.password) {
            setError("กรุณากำหนดรหัสผ่านสำหรับผู้ใช้ใหม่");
            return;
        }
        if (form.password && form.password.length < 6) {
            setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
            return;
        }

        const payload = {
            email: form.email.trim(),
            username: form.username.trim() || null,
            first_name: form.first_name || null,
            last_name: form.last_name || null,
            display_name: form.display_name || null,
            department: form.department || null,
            position: form.position || null,
            // #### ตรงนี้ส่ง enum ตัวเล็กไปตรง ๆ ####
            role: form.role,
            status: form.status,
            is_superuser: form.is_superuser,
            hod_user_id: form.hod_user_id || null,
            permissions: form.permissions
                ? form.permissions
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [],
        };

        if (form.password) {
            payload.password = form.password;
        }

        try {
            setLoadingAction(true);
            let result;

            if (mode === "create") {
                console.log("[UserForm] CREATE payload:", payload);
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
                if (!userId) {
                    const msg = "ไม่พบ ID ของผู้ใช้งาน (userId is missing)";
                    setError(msg);
                    showNotification({
                        title: "บันทึกข้อมูลไม่สำเร็จ",
                        message: msg,
                        color: "red",
                        icon: <IconX size={16} />,
                    });
                    setLoadingAction(false);
                    return;
                }

                console.log("[UserForm] UPDATE userId:", userId);
                console.log("[UserForm] UPDATE payload:", payload);

                result = await apiRequest(
                    `/users/${userId}`,
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

            if (typeof onSubmitSuccess === "function") {
                onSubmitSuccess(result);
            }
        } catch (err) {
            console.error("[UserForm] submit error:", err);
            setError(err.message || "ไม่สามารถบันทึกข้อมูลผู้ใช้ได้");
            showNotification({
                title: "บันทึกข้อมูลไม่สำเร็จ",
                message: err.message || "",
                color: "red",
                icon: <IconX size={16} />,
            });
        } finally {
            setLoadingAction(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Stack gap="sm">
                <Group grow wrap="wrap">
                    <TextInput
                        label="อีเมล"
                        required
                        value={form.email}
                        onChange={(e) => handleChange("email", e.currentTarget.value)}
                    />
                    <TextInput
                        label="Username"
                        value={form.username}
                        onChange={(e) =>
                            handleChange("username", e.currentTarget.value)
                        }
                        description="ถ้าเว้นว่าง ระบบจะใช้เฉพาะอีเมล"
                    />
                </Group>

                <Group grow wrap="wrap">
                    <TextInput
                        label="ชื่อ"
                        value={form.first_name}
                        onChange={(e) =>
                            handleChange("first_name", e.currentTarget.value)
                        }
                    />
                    <TextInput
                        label="สกุล"
                        value={form.last_name}
                        onChange={(e) => handleChange("last_name", e.currentTarget.value)}
                    />
                </Group>

                <TextInput
                    label="Display name"
                    value={form.display_name}
                    onChange={(e) =>
                        handleChange("display_name", e.currentTarget.value)
                    }
                    description="ชื่อที่จะแสดงใน Portal (ถ้าเว้นว่าง จะใช้ชื่อ+สกุล)"
                />

                <Group grow wrap="wrap">
                    <TextInput
                        label="Department"
                        value={form.department}
                        onChange={(e) =>
                            handleChange("department", e.currentTarget.value)
                        }
                    />
                    <TextInput
                        label="Position"
                        value={form.position}
                        onChange={(e) => handleChange("position", e.currentTarget.value)}
                    />
                </Group>

                <Group grow wrap="wrap">
                    <Select
                        label="Role"
                        data={ROLE_OPTIONS}
                        value={form.role}
                        onChange={(v) => handleChange("role", v)}
                        required
                    />
                    <Select
                        label="Status"
                        data={STATUS_OPTIONS}
                        value={form.status}
                        onChange={(v) => handleChange("status", v)}
                    />
                </Group>

                <TextInput
                    label="Permissions (comma separated)"
                    value={form.permissions}
                    onChange={(e) =>
                        handleChange("permissions", e.currentTarget.value)
                    }
                    placeholder="เช่น portal.app.qr.view, portal.admin.users.manage"
                />

                <TextInput
                    label="HOD User ID (optional)"
                    value={form.hod_user_id}
                    onChange={(e) =>
                        handleChange("hod_user_id", e.currentTarget.value)
                    }
                />

                <TextInput
                    label={isEdit ? "Password (เปลี่ยนรหัสผ่านใหม่)" : "Password"}
                    type="password"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.currentTarget.value)}
                    required={!isEdit}
                    description={
                        isEdit
                            ? "ถ้าไม่ต้องการเปลี่ยนรหัสผ่าน ให้เว้นว่าง"
                            : "รหัสผ่านเริ่มต้นสำหรับผู้ใช้ใหม่"
                    }
                />

                {error && (
                    <Text size="xs" c="red">
                        {error}
                    </Text>
                )}

                <Group justify="flex-end" mt="sm">
                    <Button variant="default" onClick={onCancel}>
                        ยกเลิก
                    </Button>
                    <Button type="submit">
                        {isEdit ? "บันทึกการเปลี่ยนแปลง" : "สร้างผู้ใช้"}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}