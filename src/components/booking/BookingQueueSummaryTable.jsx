// src/components/booking/BookingQueueSummaryTable.jsx
import {
    Badge,
    Group,
    Paper,
    ScrollArea,
    Stack,
    Table,
    Text,
} from "@mantine/core";
import dayjs from "dayjs";

function buildSlotLabel(q) {
    if (q.slot) return q.slot;
    if (q.start_time && q.end_time) {
        return `${q.start_time}-${q.end_time}`;
    }
    return "-";
}

function buildSupplierLabel(q) {
    const code = q.supplier_code || q.code || "";
    const name = q.supplier_name || q.name || "";
    return [code, name].filter(Boolean).join("  ");
}

function buildTruckLabel(q) {
    const plate = q.truck_register || q.truck || "";
    const type = q.truck_type || "";
    return [plate, type].filter(Boolean).join(" ");
}

function getRubberType(q) {
    return q.rubber_type || q.type || "Unknown";
}

function getStatus(q) {
    return q.status || "Pending";
}

function statusColor(status) {
    const s = String(status).toLowerCase();
    if (s === "completed" || s === "done" || s === "success") return "teal";
    if (s === "cancelled" || s === "canceled") return "red";
    return "gray";
}

export default function BookingQueueSummaryTable({ queues }) {
    // summary by rubber type
    const countsByType = queues.reduce((acc, q) => {
        const type = getRubberType(q);
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    const typeBadges = Object.entries(countsByType);

    return (
        <Stack gap="sm">
            {/* แถบ summary Rubber Type ด้านบน */}
            <Paper
                shadow="xs"
                radius="md"
                p="sm"
                withBorder
                style={{ backgroundColor: "#ffffff" }}
            >
                <Text size="sm" fw={600} mb={6}>
                    สรุปประเภทยาง
                </Text>
                <Group gap="xs" wrap="wrap">
                    {typeBadges.length === 0 ? (
                        <Text size="xs" c="dimmed">
                            ยังไม่มีข้อมูล
                        </Text>
                    ) : (
                        typeBadges.map(([type, count]) => (
                            <Badge
                                key={type}
                                size="sm"
                                variant="light"
                                radius="xl"
                            >
                                {type}: {count}
                            </Badge>
                        ))
                    )}
                </Group>
            </Paper>

            {/* ตารางรายละเอียด */}
            <Paper
                shadow="xs"
                radius="md"
                withBorder
                style={{ backgroundColor: "#ffffff" }}
            >
                <ScrollArea h={360}>
                    <Table
                        highlightOnHover
                        horizontalSpacing="md"
                        verticalSpacing="xs"
                        fontSize="xs"
                    >
                        <Table.Thead
                            style={{
                                position: "sticky",
                                top: 0,
                                zIndex: 1,
                                backgroundColor: "#f9fafb",
                            }}
                        >
                            <Table.Tr>
                                <Table.Th>Date</Table.Th>
                                <Table.Th>Slot</Table.Th>
                                <Table.Th>Queue</Table.Th>
                                <Table.Th>Booking Code</Table.Th>
                                <Table.Th>Supplier</Table.Th>
                                <Table.Th>Truck</Table.Th>
                                <Table.Th>Rubber Type</Table.Th>
                                <Table.Th>Status</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {queues.length === 0 ? (
                                <Table.Tr>
                                    <Table.Td colSpan={8}>
                                        <Text size="xs" c="dimmed">
                                            ยังไม่มีการจองในช่วงนี้
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                            ) : (
                                queues.map((q) => {
                                    const date = q.date
                                        ? dayjs(q.date).format("YYYY-MM-DD")
                                        : "-";
                                    const slotLabel = buildSlotLabel(q);
                                    const rubberType = getRubberType(q);
                                    const status = getStatus(q);

                                    return (
                                        <Table.Tr key={q.booking_code || `${date}-${q.queue_no}`}>
                                            <Table.Td>{date}</Table.Td>
                                            <Table.Td>{slotLabel}</Table.Td>
                                            <Table.Td>{q.queue_no}</Table.Td>
                                            <Table.Td>{q.booking_code}</Table.Td>
                                            <Table.Td>{buildSupplierLabel(q)}</Table.Td>
                                            <Table.Td>{buildTruckLabel(q)}</Table.Td>
                                            <Table.Td>{rubberType}</Table.Td>
                                            <Table.Td>
                                                <Badge
                                                    size="xs"
                                                    radius="xl"
                                                    variant="light"
                                                    color={statusColor(status)}
                                                >
                                                    {status}
                                                </Badge>
                                            </Table.Td>
                                        </Table.Tr>
                                    );
                                })
                            )}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>

                {/* footer ข้างล่างตาราง แบบง่าย ๆ */}
                <Group justify="space-between" p="xs">
                    <Text size="xs" c="dimmed">
                        Page 1 / 1 • Showing {queues.length} records
                    </Text>
                    {/* ถ้าทีหลังจะทำ pagination จริง ค่อยมาแทนที่ปุ่มพวกนี้ */}
                    <Group gap="xs">
                        <Badge size="xs" variant="outline" radius="sm">
                            Prev
                        </Badge>
                        <Badge size="xs" variant="outline" radius="sm">
                            Next
                        </Badge>
                    </Group>
                </Group>
            </Paper>
        </Stack>
    );
}