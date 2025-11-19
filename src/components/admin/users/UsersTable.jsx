// src/components/admin/users/UsersTable.jsx
import {
    ActionIcon,
    Badge,
    Center,
    Group,
    Loader,
    Table,
    Text,
    Tooltip,
} from "@mantine/core";
import { IconPencil, IconTrash } from "@tabler/icons-react";

/* ---------- แผนที่ Role -> label + สี ---------- */
const ROLE_META = {
    super_admin: { label: "Super Admin", color: "grape" },
    admin: { label: "Admin", color: "blue" },
    manager: { label: "Manager", color: "teal" },
    editor: { label: "Editor", color: "cyan" },
    support: { label: "Support", color: "violet" },
    member: { label: "Member", color: "indigo" },
    viewer: { label: "Viewer", color: "gray" },
    guest: { label: "Guest", color: "gray" },
    user: { label: "User", color: "dark" },
};

/* ---------- แผนที่ Status -> label + สี ---------- */
const STATUS_META = {
    active: { label: "Active", color: "green" },
    inactive: { label: "Inactive", color: "gray" },
    suspended: { label: "Suspended", color: "red" },
};

// helper ให้ได้ id ที่แน่นอน
const getUserId = (u) => u?.id || u?._id || u?.user_id || u?.userId || null;

function RoleBadge({ value }) {
    const key = value ? String(value).toLowerCase() : "user";
    const meta = ROLE_META[key] || { label: value || "User", color: "dark" };

    return (
        <Badge size="xs" radius="lg" color={meta.color} variant="light">
            {meta.label}
        </Badge>
    );
}

function StatusBadge({ value }) {
    const key = value ? String(value).toLowerCase() : "inactive";
    const meta = STATUS_META[key] || {
        label: value || "Unknown",
        color: "gray",
    };

    return (
        <Badge size="xs" radius="lg" color={meta.color} variant="light">
            {meta.label}
        </Badge>
    );
}

export default function UsersTable({
    users,
    loading,
    canManageUsers,
    onEdit,
    onDelete,
}) {
    if (loading) {
        return (
            <Center py="lg">
                <Loader size="sm" />
            </Center>
        );
    }

    if (!users || users.length === 0) {
        return (
            <Center py="lg">
                <Text size="sm" c="dimmed">
                    ไม่พบผู้ใช้งานในระบบ
                </Text>
            </Center>
        );
    }

    const rows = users.map((u) => {
        const id = getUserId(u);
        const fullName =
            [u.first_name, u.last_name].filter(Boolean).join(" ") ||
            u.display_name ||
            u.username ||
            u.email;

        return (
            <Table.Tr key={id || u.email}>
                <Table.Td>
                    <Text size="sm" fw={500}>
                        {fullName}
                    </Text>
                    <Text size="xs" c="dimmed">
                        {u.email}
                    </Text>
                </Table.Td>

                <Table.Td>
                    <Text size="xs">{u.department || "-"}</Text>
                </Table.Td>

                <Table.Td>
                    <Text size="xs">{u.position || "-"}</Text>
                </Table.Td>

                <Table.Td>
                    <RoleBadge value={u.role} />
                </Table.Td>

                <Table.Td>
                    <StatusBadge value={u.status} />
                </Table.Td>

                {canManageUsers && (
                    <Table.Td width={90}>
                        <Group gap={4} justify="flex-end">
                            <Tooltip label="แก้ไขผู้ใช้งาน" openDelay={300}>
                                <ActionIcon
                                    size="sm"
                                    variant="subtle"
                                    color="blue"
                                    onClick={() => onEdit && onEdit(u)}
                                >
                                    <IconPencil size={14} />
                                </ActionIcon>
                            </Tooltip>

                            <Tooltip label="ลบผู้ใช้งาน" openDelay={300}>
                                <ActionIcon
                                    size="sm"
                                    variant="subtle"
                                    color="red"
                                    onClick={() => onDelete && onDelete(u)}
                                >
                                    <IconTrash size={14} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    </Table.Td>
                )}
            </Table.Tr>
        );
    });

    return (
        <Table
            striped
            highlightOnHover
            withRowBorders={false}
            verticalSpacing="xs"
            horizontalSpacing="md"
        >
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>ชื่อ - สกุล / อีเมล</Table.Th>
                    <Table.Th>Department</Table.Th>
                    <Table.Th>Position</Table.Th>
                    <Table.Th>Role</Table.Th>
                    <Table.Th>Status</Table.Th>
                    {canManageUsers && <Table.Th style={{ width: 90 }}>Actions</Table.Th>}
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
        </Table>
    );
}