// src/components/admin/suppliers/SuppliersTable.jsx
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

const getId = (s) => s?.id || s?._id || s?.supplier_id || null;

function renderStatus(status) {
    const val = String(status || "").toLowerCase();
    let color = "green";
    if (val === "inactive") color = "gray";
    if (val === "suspended") color = "red";

    return (
        <Badge size="xs" radius="lg" variant="light" color={color}>
            {String(status || "")
                .toUpperCase()
                .replace("_", " ")}
        </Badge>
    );
}

function renderRubberTypes(rubber_type_codes) {
    if (!Array.isArray(rubber_type_codes) || rubber_type_codes.length === 0) {
        return (
            <Text size="xs" c="dimmed">
                -
            </Text>
        );
    }
    return (
        <Group gap={4} wrap="wrap">
            {rubber_type_codes.map((code) => (
                <Badge
                    key={code}
                    size="xs"
                    radius="sm"
                    variant="light"
                    color="teal"
                >
                    {code}
                </Badge>
            ))}
        </Group>
    );
}

function renderAddress(address) {
    if (!address) return "-";
    const parts = [
        address.sub_district_th,
        address.district_th,
        address.province_th,
        address.zipcode || address.zip_code,
    ]
        .filter(Boolean)
        .join(" · ");
    return parts || address.address_line || "-";
}

export default function SuppliersTable({
    suppliers = [],
    loading = false,
    canManageSuppliers = false,
    onEdit,
    onDelete,
}) {
    const hasData = Array.isArray(suppliers) && suppliers.length > 0;

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
                    <Table.Th style={{ width: "16%" }}>Code</Table.Th>
                    <Table.Th style={{ width: "24%" }}>Name</Table.Th>
                    <Table.Th style={{ width: "13%" }}>Phone</Table.Th>
                    <Table.Th style={{ width: "12%" }}>Status</Table.Th>
                    <Table.Th style={{ width: "20%" }}>Rubber Types</Table.Th>
                    <Table.Th>Address</Table.Th>
                    {canManageSuppliers && (
                        <Table.Th
                            style={{ width: 120, textAlign: "right" }}
                        >
                            Actions
                        </Table.Th>
                    )}
                </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
                {/* Loading state */}
                {loading && (
                    <>
                        {Array.from({ length: 6 }).map((_, idx) => (
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
                                <Table.Td>
                                    <Skeleton height={12} radius="xl" />
                                </Table.Td>
                                <Table.Td>
                                    <Skeleton height={12} radius="xl" />
                                </Table.Td>
                                {canManageSuppliers && (
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

                {/* No data */}
                {!loading && !hasData && (
                    <Table.Tr>
                        <Table.Td colSpan={canManageSuppliers ? 7 : 6}>
                            <Text
                                size="xs"
                                c="dimmed"
                                ta="center"
                                py="xs"
                            >
                                ยังไม่มีข้อมูล Supplier
                            </Text>
                        </Table.Td>
                    </Table.Tr>
                )}

                {/* Data rows */}
                {!loading &&
                    hasData &&
                    suppliers.map((item) => {
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
                                    <Text size="sm">
                                        {item.display_name ||
                                            [item.title, item.first_name, item.last_name]
                                                .filter(Boolean)
                                                .join(" ") ||
                                            "-"}
                                    </Text>
                                    {item.email && (
                                        <Text size="xs" c="dimmed">
                                            {item.email}
                                        </Text>
                                    )}
                                </Table.Td>

                                <Table.Td>
                                    <Text size="sm">{item.phone || "-"}</Text>
                                </Table.Td>

                                <Table.Td>{renderStatus(item.status)}</Table.Td>

                                <Table.Td>
                                    {renderRubberTypes(item.rubber_type_codes)}
                                </Table.Td>

                                <Table.Td>
                                    <Text size="sm" c="dimmed">
                                        {renderAddress(item.address)}
                                    </Text>
                                </Table.Td>

                                {canManageSuppliers && (
                                    <Table.Td>
                                        <Group
                                            gap={6}
                                            justify="flex-end"
                                        >
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