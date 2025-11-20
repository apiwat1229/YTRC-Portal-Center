// src/components/admin/rubbertypes/RubberTypesTable.jsx
import {
    ActionIcon,
    Badge,
    Group,
    Skeleton,
    Table,
    Text,
    Tooltip,
} from "@mantine/core";
import { IconPencil, IconTrash } from "@tabler/icons-react";

const getId = (r) => r?.id || r?._id || r?.rubbertype_id || null;

export default function RubberTypesTable({
    rubberTypes = [],
    loading = false,
    canManageRubberTypes = false,
    onEdit,
    onDelete,
}) {
    const hasData = Array.isArray(rubberTypes) && rubberTypes.length > 0;

    return (
        <Table
            striped
            highlightOnHover
            withTableBorder={false}
            withColumnBorders={false}
            horizontalSpacing="md"
            verticalSpacing="xs"
            fontSize="sm"
        >
            <Table.Thead>
                <Table.Tr>
                    <Table.Th style={{ width: "22%" }}>Code</Table.Th>
                    <Table.Th style={{ width: "30%" }}>Name</Table.Th>
                    <Table.Th style={{ width: "14%" }}>Status</Table.Th>
                    <Table.Th>Description</Table.Th>
                    {canManageRubberTypes && (
                        <Table.Th
                            style={{ width: 120, textAlign: "right" }}
                        >
                            Actions
                        </Table.Th>
                    )}
                </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
                {/* ====== Loading state ====== */}
                {loading && (
                    <>
                        {Array.from({ length: 5 }).map((_, idx) => (
                            <Table.Tr key={`skeleton-${idx}`}>
                                <Table.Td>
                                    <Skeleton height={12} radius="xl" />
                                </Table.Td>
                                <Table.Td>
                                    <Skeleton height={12} radius="xl" />
                                </Table.Td>
                                <Table.Td>
                                    <Skeleton height={12} radius="xl" />
                                </Table.Td>
                                <Table.Td>
                                    <Skeleton height={12} radius="xl" />
                                </Table.Td>
                                {canManageRubberTypes && (
                                    <Table.Td>
                                        <Skeleton
                                            height={22}
                                            width={90}
                                            radius="xl"
                                        />
                                    </Table.Td>
                                )}
                            </Table.Tr>
                        ))}
                    </>
                )}

                {/* ====== No data ====== */}
                {!loading && !hasData && (
                    <Table.Tr>
                        <Table.Td colSpan={canManageRubberTypes ? 5 : 4}>
                            <Text
                                size="xs"
                                c="dimmed"
                                ta="center"
                                py="xs"
                            >
                                ยังไม่มีข้อมูล Rubber Types
                            </Text>
                        </Table.Td>
                    </Table.Tr>
                )}

                {/* ====== Data rows ====== */}
                {!loading &&
                    hasData &&
                    rubberTypes.map((item) => {
                        const id = getId(item);
                        return (
                            <Table.Tr key={id || item.code}>
                                <Table.Td>
                                    <Text fw={600} size="sm">
                                        {item.code}
                                    </Text>
                                    {id && (
                                        <Text
                                            size="xs"
                                            c="dimmed"
                                            mt={2}
                                            style={{
                                                fontFamily:
                                                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                                            }}
                                        >
                                            ID: {id}
                                        </Text>
                                    )}
                                </Table.Td>

                                <Table.Td>
                                    <Text size="sm">{item.name}</Text>
                                </Table.Td>

                                <Table.Td>
                                    <Badge
                                        size="xs"
                                        radius="lg"
                                        variant="light"
                                        color={
                                            item.status === "inactive"
                                                ? "gray"
                                                : "green"
                                        }
                                    >
                                        {String(item.status || "")
                                            .toUpperCase()
                                            .replace("_", " ")}
                                    </Badge>
                                </Table.Td>

                                <Table.Td>
                                    <Text size="sm" c="dimmed">
                                        {item.description || "-"}
                                    </Text>
                                </Table.Td>

                                {canManageRubberTypes && (
                                    <Table.Td>
                                        <Group
                                            gap={6}
                                            justify="flex-end"
                                        >
                                            {/* Edit */}
                                            <Tooltip label="Edit" withArrow>
                                                <ActionIcon
                                                    size="sm"
                                                    radius="xl"
                                                    variant="light"
                                                    color="blue"
                                                    onClick={() =>
                                                        onEdit &&
                                                        onEdit(item)
                                                    }
                                                >
                                                    <IconPencil size={16} />
                                                </ActionIcon>
                                            </Tooltip>

                                            {/* Delete */}
                                            <Tooltip
                                                label="Delete"
                                                withArrow
                                            >
                                                <ActionIcon
                                                    size="sm"
                                                    radius="xl"
                                                    variant="light"
                                                    color="red"
                                                    onClick={() =>
                                                        onDelete &&
                                                        onDelete(item)
                                                    }
                                                >
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </Tooltip>
                                        </Group>
                                    </Table.Td>
                                )}
                            </Table.Tr>
                        );
                    })}
            </Table.Tbody>
        </Table>
    );
}