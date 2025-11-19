// src/components/admin/users/UserForm.jsx
import {
    Button,
    Group,
    PasswordInput,
    Select,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { apiRequest } from "./userApi";

/* ======= enums/choices ======= */
const roleOptions = [
    { value: "super_admin", label: "Super Admin" },
    { value: "admin", label: "Admin" },
    { value: "manager", label: "Manager" },
    { value: "editor", label: "Editor" },
    { value: "support", label: "Support" },
    { value: "member", label: "Member" },
    { value: "viewer", label: "Viewer" },
    { value: "guest", label: "Guest" },
    { value: "user", label: "User" },
];

const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "suspended", label: "Suspended" },
];

const departmentOptions = [
    { value: "QA", label: "QA" },
    { value: "QC", label: "QC" },
    { value: "IT", label: "IT" },
    { value: "HR", label: "HR" },
    { value: "ACC", label: "Accounting" },
    { value: "SALE", label: "Sales" },
];

const positionOptions = [
    { value: "Manager", label: "Manager" },
    { value: "Supervisor", label: "Supervisor" },
    { value: "Officer", label: "Officer" },
    { value: "Staff", label: "Staff" },
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

    const [form, setForm] = useState(() => {
        const role =
            (initial?.role ? String(initial.role).toLowerCase() : "user") || "user";
        const status =
            (initial?.status ? String(initial.status).toLowerCase() : "active") ||
            "active";

        return {
            email: initial?.email || "",
            username: initial?.username || "",
            first_name: initial?.first_name || "",
            last_name: initial?.last_name || "",
            display_name: initial?.display_name || "",
            department: initial?.department || "",
            position: initial?.position || "",
            role,
            status,
            permissions: Array.isArray(initial?.permissions)
                ? initial.permissions.join(", ")
                : "",
            is_superuser: Boolean(initial?.is_superuser),
            hod_user_id: initial?.hod_user_id || "",
            password: "", // create: required, edit: optional
            confirm_password: "",
        };
    });

    const [error, setError] = useState(null);

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

        // validate password & confirm
        if (mode === "create") {
            if (!form.password) {
                setError("กรุณากำหนดรหัสผ่านสำหรับผู้ใช้ใหม่");
                return;
            }
            if (form.password !== form.confirm_password) {
                setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
                return;
            }
        } else {
            // edit mode: ถ้ากรอกอย่างใดอย่างหนึ่ง ต้องให้ตรงกันทั้งคู่
            const hasPassword = !!form.password;
            const hasConfirm = !!form.confirm_password;
            if (hasPassword || hasConfirm) {
                if (!hasPassword || !hasConfirm) {
                    setError("กรุณากรอกทั้งรหัสผ่านใหม่และยืนยันรหัสผ่าน");
                    return;
                }
                if (form.password !== form.confirm_password) {
                    setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
                    return;
                }
            }
        }

        if (!form.role) {
            setError("กรุณาเลือก Role");
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
            role: form.role, // ตัวเล็กตาม enum
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
                const userId =
                    initial?.id || initial?._id || initial?.user_id || initial?.userId;

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
            const msg =
                typeof err.message === "string"
                    ? err.message
                    : Array.isArray(err)
                        ? JSON.stringify(err)
                        : "ไม่สามารถบันทึกข้อมูลผู้ใช้ได้";

            setError(msg);
            showNotification({
                title: "บันทึกข้อมูลไม่สำเร็จ",
                message: msg,
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
                        description="ใช้เฉพาะอีเมล"
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
                        onChange={(e) =>
                            handleChange("last_name", e.currentTarget.value)
                        }
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
                    <Select
                        label="Department"
                        placeholder="เลือกแผนก"
                        data={departmentOptions}
                        value={form.department}
                        onChange={(v) => handleChange("department", v || "")}
                        clearable
                    />
                    <Select
                        label="Position"
                        placeholder="ตำแหน่ง"
                        data={positionOptions}
                        value={form.position}
                        onChange={(v) => handleChange("position", v || "")}
                        clearable
                    />
                </Group>

                <Group grow wrap="wrap">
                    <Select
                        label="Role *"
                        placeholder="เลือก Role"
                        data={roleOptions}
                        value={form.role}
                        onChange={(v) => handleChange("role", v || "user")}
                        required
                    />
                    <Select
                        label="Status"
                        placeholder="สถานะ"
                        data={statusOptions}
                        value={form.status}
                        onChange={(v) => handleChange("status", v || "active")}
                    />
                </Group>

                <TextInput
                    label="HOD User ID (optional)"
                    value={form.hod_user_id}
                    onChange={(e) =>
                        handleChange("hod_user_id", e.currentTarget.value)
                    }
                />

                <Group grow wrap="wrap">
                    <PasswordInput
                        label={isEdit ? "Password (เปลี่ยนรหัสผ่านใหม่)" : "Password"}
                        value={form.password}
                        onChange={(e) =>
                            handleChange("password", e.currentTarget.value)
                        }
                        required={!isEdit}
                        description={
                            isEdit
                                ? "ถ้าไม่ต้องการเปลี่ยนรหัสผ่าน ให้เว้นว่าง"
                                : ""
                        }
                    />
                    <PasswordInput
                        label={isEdit ? "ยืนยันรหัสผ่านใหม่" : "Confirm password"}
                        value={form.confirm_password}
                        onChange={(e) =>
                            handleChange("confirm_password", e.currentTarget.value)
                        }
                        required={!isEdit}
                        description={
                            isEdit
                                ? "ถ้าไม่ต้องการเปลี่ยนรหัสผ่าน ให้เว้นว่าง"
                                : ""
                        }
                    />
                </Group>

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