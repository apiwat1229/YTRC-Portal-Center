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

// ---- Helper: format phone xxx-xxx-xxxx ----
function formatPhone(phone) {
    if (!phone) return "-";
    const digits = String(phone).replace(/\D/g, "");
    if (digits.length === 10) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(
            6
        )}`;
    }
    return phone;
}

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

// ---- map ประเภทสีตามชนิดยาง ----
function getRubberTypeBadgeColor(label) {
    const txt = String(label || "").toUpperCase();
    if (txt.includes("EUDR")) return "orange";
    if (txt.includes("FSC")) return "green";
    return "blue"; // Regular / อื่น ๆ
}

function renderRubberTypes(rubber_type_codes, rubberTypesMap) {
    if (!Array.isArray(rubber_type_codes) || rubber_type_codes.length === 0) {
        return (
            <Text size="xs" c="dimmed">
                -
            </Text>
        );
    }

    return (
        <Group gap={4} wrap="wrap">
            {rubber_type_codes.map((code) => {
                const rt = rubberTypesMap?.[code];
                const label = rt?.name || code;
                const color = getRubberTypeBadgeColor(label);
                return (
                    <Badge
                        key={code}
                        size="xs"
                        radius="sm"
                        variant="light"
                        color={color}
                    >
                        {label}
                    </Badge>
                );
            })}
        </Group>
    );
}

function renderAddress(address) {
    if (!address) return "-";
    // แสดงเฉพาะจังหวัด
    const province =
        address.province_th ||
        address.province_en ||
        address.province ||
        address.changwat;
    return province || "-";
}

export default function SuppliersTable({
    suppliers = [],
    loading = false,
    canManageSuppliers = false,
    onEdit,
    onDelete,
    rubberTypesMap = {}, // 👈 map code -> { name, ... }
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
                    <Table.Th style={{ width: "12%" }}>Code</Table.Th>
                    <Table.Th style={{ width: "24%" }}>Name</Table.Th>
                    <Table.Th style={{ width: "14%" }}>Phone</Table.Th>
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

                        // ชื่อ: คำนำหน้า + ชื่อ (ติดกัน) + เว้นวรรค + นามสกุล
                        const fullName =
                            (item.title || "") +
                            (item.first_name || "") +
                            (item.last_name
                                ? ` ${item.last_name}`
                                : "") || item.display_name;

                        return (
                            <Table.Tr key={id || item.code}>
                                {/* Code (ไม่แสดง ID แล้ว) */}
                                <Table.Td>
                                    <Text fw={600} size="sm">
                                        {item.code}
                                    </Text>
                                </Table.Td>

                                {/* Name */}
                                <Table.Td>
                                    <Text size="sm">
                                        {fullName || item.display_name || "-"}
                                    </Text>
                                    {item.email && (
                                        <Text size="xs" c="dimmed">
                                            {item.email}
                                        </Text>
                                    )}
                                </Table.Td>

                                {/* Phone (format) */}
                                <Table.Td>
                                    <Text size="sm">
                                        {formatPhone(item.phone)}
                                    </Text>
                                </Table.Td>

                                {/* Status */}
                                <Table.Td>{renderStatus(item.status)}</Table.Td>

                                {/* Rubber Types (name + สี) */}
                                <Table.Td>
                                    {renderRubberTypes(
                                        item.rubber_type_codes,
                                        rubberTypesMap
                                    )}
                                </Table.Td>

                                {/* Address (จังหวัด) */}
                                <Table.Td>
                                    <Text size="sm" c="dimmed">
                                        {renderAddress(item.address)}
                                    </Text>
                                </Table.Td>

                                {/* Actions */}
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