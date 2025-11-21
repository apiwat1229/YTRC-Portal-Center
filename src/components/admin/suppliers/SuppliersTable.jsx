// src/components/admin/suppliers/SuppliersTable.jsx
import {
    ActionIcon,
    Badge,
    Button,
    Group,
    Modal,
    Skeleton,
    Stack,
    Table,
    Text,
    Tooltip,
} from "@mantine/core";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

const getId = (s) => s?.id || s?._id || s?.supplier_id || null;

/* ---------------- Status Badge ---------------- */
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

/* ---------------- Phone Format xxx-xxx-xxxx ---------------- */
function formatPhone(phone) {
    if (!phone) return "-";
    const digits = String(phone).replace(/\D/g, "");
    if (digits.length !== 10) {
        // ถ้าไม่ครบ 10 ตัว แสดงตามเดิม
        return phone;
    }
    const part1 = digits.slice(0, 3);
    const part2 = digits.slice(3, 6);
    const part3 = digits.slice(6);
    return `${part1}-${part2}-${part3}`;
}

/* ---------------- Rubber Type Badge Color ---------------- */
function getRubberTypeColor(text) {
    const v = String(text || "").toUpperCase();
    if (v.includes("FSC")) return "green"; // FSC
    if (v.includes("EUDR")) return "yellow"; // EUDR
    return "teal"; // Regular / อื่น ๆ
}

/**
 * พยายามดึง "name" ของ Rubber Type
 * รองรับหลายรูปแบบ:
 * - item.rubber_types = [{ code, name, ... }]
 * - item.rubber_type_names = ["FSC CL", "Regular USS"]
 * - fallback: item.rubber_type_codes = ["FSC_CL", "USS_REG"]
 */
function getRubberTypesForDisplay(item) {
    if (Array.isArray(item?.rubber_types) && item.rubber_types.length > 0) {
        return item.rubber_types.map((rt) => ({
            key: rt.code || rt.name,
            label: rt.name || rt.code,
        }));
    }

    if (
        Array.isArray(item?.rubber_type_names) &&
        item.rubber_type_names.length > 0
    ) {
        return item.rubber_type_names.map((name) => ({
            key: name,
            label: name,
        }));
    }

    if (
        Array.isArray(item?.rubber_type_codes) &&
        item.rubber_type_codes.length > 0
    ) {
        return item.rubber_type_codes.map((code) => ({
            key: code,
            label: code,
        }));
    }

    return [];
}

function renderRubberTypesCell(item) {
    const types = getRubberTypesForDisplay(item);
    if (!types.length) {
        return (
            <Text size="xs" c="dimmed">
                -
            </Text>
        );
    }
    return (
        <Group gap={4} wrap="wrap">
            {types.map((t) => (
                <Badge
                    key={t.key}
                    size="xs"
                    radius="sm"
                    variant="light"
                    color={getRubberTypeColor(t.label)}
                >
                    {t.label}
                </Badge>
            ))}
        </Group>
    );
}

/* ---------------- Address: province only + plain text ---------------- */
function getAddressText(address) {
    if (!address) return "";
    const province =
        address.province_th ||
        address.province ||
        address.province_en ||
        null;
    return province || "";
}

function renderAddress(address) {
    const province = getAddressText(address);
    return province || "-";
}

/* ---------------- Main Table Component ---------------- */
export default function SuppliersTable({
    suppliers = [],
    loading = false,
    canManageSuppliers = false,
    onEdit,
    onDelete,
}) {
    const [deleteOpened, setDeleteOpened] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const hasData =
        !loading && Array.isArray(suppliers) && suppliers.length > 0;

    const closeDeleteModal = () => {
        setDeleteOpened(false);
        setDeleteTarget(null);
    };

    const handleConfirmDelete = () => {
        if (onDelete && deleteTarget) {
            onDelete(deleteTarget);
        }
        closeDeleteModal();
    };

    return (
        <>
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
                        <Table.Th style={{ width: "20%" }}>
                            Rubber Types
                        </Table.Th>
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

                            const fullName =
                                item.display_name ||
                                [
                                    (item.title || "") +
                                    (item.first_name || ""),
                                    item.last_name || "",
                                ]
                                    .filter(Boolean)
                                    .join(" ")
                                    .trim() || "-";

                            return (
                                <Table.Tr key={id || item.code}>
                                    {/* Code */}
                                    <Table.Td>
                                        <Text fw={600} size="sm">
                                            {item.code}
                                        </Text>
                                    </Table.Td>

                                    {/* Name + Email */}
                                    <Table.Td>
                                        <Text size="sm">{fullName}</Text>
                                        {item.email && (
                                            <Text size="xs" c="dimmed">
                                                {item.email}
                                            </Text>
                                        )}
                                    </Table.Td>

                                    {/* Phone */}
                                    <Table.Td>
                                        <Text size="sm">
                                            {formatPhone(item.phone)}
                                        </Text>
                                    </Table.Td>

                                    {/* Status */}
                                    <Table.Td>
                                        {renderStatus(item.status)}
                                    </Table.Td>

                                    {/* Rubber Types */}
                                    <Table.Td>
                                        {renderRubberTypesCell(item)}
                                    </Table.Td>

                                    {/* Address (province only) */}
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
                                                <Tooltip
                                                    label="Edit"
                                                    withArrow
                                                >
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
                                                        onClick={() => {
                                                            if (!onDelete)
                                                                return;
                                                            setDeleteTarget(
                                                                item
                                                            );
                                                            setDeleteOpened(
                                                                true
                                                            );
                                                        }}
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

            {/* Modal ยืนยันการลบ */}
            <Modal
                opened={deleteOpened}
                onClose={closeDeleteModal}
                centered
                title="ยืนยันการลบ Supplier"
            >
                <Stack gap="sm">
                    <Text size="sm">
                        คุณต้องการลบ Supplier นี้ใช่หรือไม่? การลบจะไม่สามารถย้อนกลับได้
                    </Text>

                    {deleteTarget && (
                        <Text size="sm" fw={600}>
                            {deleteTarget.code}{" "}
                            {(deleteTarget.title || "") +
                                (deleteTarget.first_name || "") +
                                (deleteTarget.last_name
                                    ? ` ${deleteTarget.last_name}`
                                    : "")}
                        </Text>
                    )}

                    <Group justify="flex-end" mt="sm">
                        <Button variant="default" onClick={closeDeleteModal}>
                            ยกเลิก
                        </Button>
                        <Button color="red" onClick={handleConfirmDelete}>
                            ยืนยันลบ
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}