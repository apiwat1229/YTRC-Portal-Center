// src/components/admin/users/UsersTable.jsx
import {
    ActionIcon,
    Badge,
    Center,
    Group,
    Loader,
    ScrollArea,
    Stack,
    Table,
    Text,
} from "@mantine/core";
import {
    IconCheck,
    IconCircleX,
    IconEdit,
    IconTrash,
} from "@tabler/icons-react";

export default function UsersTable({
    users,
    loading,
    canManageUsers,
    onEdit,
    onDelete,
}) {
    return (
        <ScrollArea h={420}>
            {loading ? (
                <Center py="lg">
                    <Loader size="sm" />
                </Center>
            ) : users.length === 0 ? (
                <Center py="lg">
                    <Text size="sm" c="dimmed">
                        ไม่พบผู้ใช้งานตามเงื่อนไขที่ค้นหา
                    </Text>
                </Center>
            ) : (
                <Table striped highlightOnHover withTableBorder>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>ชื่อ - สกุล</Table.Th>
                            <Table.Th>อีเมล / Username</Table.Th>
                            <Table.Th>แผนก / ตำแหน่ง</Table.Th>
                            <Table.Th>Role</Table.Th>
                            <Table.Th>สถานะ</Table.Th>
                            <Table.Th w={110} ta="right">
                                Actions
                            </Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {users.map((u, index) => (
                            <Table.Tr
                                key={u.id || u.email || u.username || index}  // ✅ มี fallback
                            >
                                <Table.Td>
                                    <Stack gap={0}>
                                        <Text size="sm" fw={500}>
                                            {u.display_name ||
                                                [u.first_name, u.last_name].filter(Boolean).join(" ") ||
                                                "-"}
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            {u.id}
                                        </Text>
                                    </Stack>
                                </Table.Td>

                                <Table.Td>
                                    <Stack gap={0}>
                                        <Text size="sm">{u.email}</Text>
                                        <Text size="xs" c="dimmed">
                                            {u.username ? `@${u.username}` : "-"}
                                        </Text>
                                    </Stack>
                                </Table.Td>

                                <Table.Td>
                                    <Stack gap={0}>
                                        <Text size="sm">{u.department || <span>-</span>}</Text>
                                        <Text size="xs" c="dimmed">
                                            {u.position || ""}
                                        </Text>
                                    </Stack>
                                </Table.Td>

                                <Table.Td>
                                    <Badge
                                        size="xs"
                                        radius="lg"
                                        color={
                                            u.role === "SUPER_ADMIN"
                                                ? "red"
                                                : u.role === "ADMIN"
                                                    ? "indigo"
                                                    : u.role === "STAFF"
                                                        ? "teal"
                                                        : "gray"
                                        }
                                    >
                                        {u.role || "N/A"}
                                    </Badge>
                                </Table.Td>

                                <Table.Td>
                                    <Badge
                                        size="xs"
                                        radius="lg"
                                        leftSection={
                                            u.status === "ACTIVE" ? (
                                                <IconCheck size={12} />
                                            ) : (
                                                <IconCircleX size={12} />
                                            )
                                        }
                                        color={
                                            u.status === "ACTIVE"
                                                ? "green"
                                                : u.status === "SUSPENDED"
                                                    ? "orange"
                                                    : "gray"
                                        }
                                    >
                                        {u.status || "UNKNOWN"}
                                    </Badge>
                                </Table.Td>

                                <Table.Td>
                                    <Group gap={6} justify="flex-end" wrap="nowrap">
                                        <ActionIcon
                                            size="sm"
                                            variant="subtle"
                                            color="blue"
                                            disabled={!canManageUsers}
                                            onClick={() => onEdit?.(u)}
                                        >
                                            <IconEdit size={16} />
                                        </ActionIcon>
                                        <ActionIcon
                                            size="sm"
                                            variant="subtle"
                                            color="red"
                                            disabled={!canManageUsers}
                                            onClick={() => onDelete?.(u)}
                                        >
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            )}
        </ScrollArea>
    );
}