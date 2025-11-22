// src/components/truckscale/WeightScaleInTab.jsx
import {
    Button,
    Group,
    Select,
    Stack,
    Table,
    Text,
    TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

import { http } from "@/helpers/http";

/* ========= Helpers ========= */

const toastError = (message) =>
    notifications.show({
        color: "red",
        title: "เกิดข้อผิดพลาด",
        message,
    });

/** แปลง Date → "YYYY-MM-DD" ส่งให้ API */
const toISODate = (d) => {
    if (!d) return null;
    const dd = new Date(d);
    return dd.toISOString().slice(0, 10);
};

/** ฟอร์แมตเวลาจาก ISO string → "HH:mm" */
const formatTimeHM = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
};

/** ฟอร์แมตจำนวนวินาที → "01 นาที", "05 นาที" ฯลฯ */
const formatDrainDuration = (secs) => {
    if (secs == null) return "-";
    const n = Number(secs);
    if (!Number.isFinite(n) || n <= 0) return "-";
    const mins = Math.floor(n / 60);
    // ถ้าอยากแสดงวินาทีด้วย ก็เพิ่มส่วนนี้
    // const remain = n % 60;
    return `${String(mins).padStart(2, "0")} นาที`;
};

/** เช็คว่าเป็นรถ 10 ล้อ(พ่วง) หรือไม่ */
const isTrailerTruckType = (t = "") =>
    /10\s*ล้อ\s*\(\s*พ่วง\s*\)/i.test(String(t).trim()) ||
    /10\s*ล้อ\s*พ่วง/i.test(String(t).trim());

/** ฟอร์แมตตัวเลข + comma + "กก." */
const formatKg = (n) => {
    const num = Number(n);
    if (!Number.isFinite(num) || num <= 0) return "-";
    const s = Math.round(num)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${s} กก.`;
};

export default function WeightScaleInTab({ user }) {
    const [rowsPerPage, setRowsPerPage] = useState("10");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [searchText, setSearchText] = useState("");

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const limit = useMemo(
        () => Number(rowsPerPage) || 10,
        [rowsPerPage],
    );
    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(total / limit || 1)),
        [total, limit],
    );

    /* ===== ดึงข้อมูลจาก /bookings เฉพาะที่ Check-in แล้ว ===== */
    const fetchRows = async () => {
        if (!selectedDate) return;

        setLoading(true);
        const dateStr = toISODate(selectedDate);

        try {
            const res = await http.get("/bookings", {
                params: {
                    date: dateStr,
                    page,
                    limit,
                    q: searchText || undefined,
                },
            });

            const data = res?.data ?? res;
            const items =
                (Array.isArray(data?.items) && data.items) ||
                (Array.isArray(data?.results) && data.results) ||
                (Array.isArray(data) && data) ||
                [];

            // เอาเฉพาะรายการที่มี checkin_at แล้ว
            const checkedIn = items.filter((b) => !!b.checkin_at);

            setRows(checkedIn);
            setTotal(data?.total ?? checkedIn.length);
        } catch (e) {
            console.error("[weight-scale-in] fetch error:", e);
            toastError("โหลดข้อมูล WEIGHT SCALE IN ไม่สำเร็จ");
            setRows([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    // เมื่อวันที่ / ข้อความค้นหา / page / limit เปลี่ยน → refetch
    useEffect(() => {
        fetchRows();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate, searchText, page, limit]);

    // เวลาปรับจำนวนแถว/เปลี่ยนวันที่/ค้นหาใหม่ → ย้ายกลับไปหน้า 1
    useEffect(() => {
        setPage(1);
    }, [rowsPerPage, selectedDate, searchText]);

    const handlePrevPage = () => {
        setPage((p) => Math.max(1, p - 1));
    };

    const handleNextPage = () => {
        setPage((p) => Math.min(totalPages, p + 1));
    };

    return (
        <Stack gap="lg">
            {/* Header row */}
            <Group justify="space-between" align="center">
                <Text fw={700} size="sm">
                    WEIGHT SCALE IN
                </Text>
                <Text size="xs" c="dimmed">
                    Operations / Weight Scale IN
                </Text>
            </Group>

            {/* Filters */}
            <Group justify="space-between" align="center" wrap="wrap" gap="sm">
                <Group gap="xs">
                    <Text size="sm" fw={600}>
                        แสดง
                    </Text>
                    <Select
                        data={["10", "25", "50"]}
                        value={rowsPerPage}
                        onChange={setRowsPerPage}
                        size="xs"
                        w={80}
                    />
                    <Text size="sm" fw={600}>
                        แถว
                    </Text>
                </Group>

                <Group gap="xs">
                    <DateInput
                        value={selectedDate}
                        onChange={setSelectedDate}
                        valueFormat="DD/MM/YYYY"
                        size="sm"
                        w={160}
                    />
                    <TextInput
                        placeholder="ค้นหา..."
                        leftSection={<IconSearch size={14} />}
                        size="sm"
                        value={searchText}
                        onChange={(e) => setSearchText(e.currentTarget.value)}
                        w={220}
                    />
                    <Button
                        variant="default"
                        size="xs"
                        onClick={fetchRows}
                        loading={loading}
                    >
                        รีเฟรช
                    </Button>
                </Group>
            </Group>

            {/* Table */}
            <Table striped highlightOnHover withColumnBorders={false}>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Supplier</Table.Th>
                        <Table.Th>Queue</Table.Th>
                        <Table.Th>ทะเบียนรถ</Table.Th>
                        <Table.Th>ประเภท</Table.Th>
                        <Table.Th>Start Drain</Table.Th>
                        <Table.Th>Stop Drain</Table.Th>
                        <Table.Th>Total Drain</Table.Th>
                        <Table.Th>Weight In</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {loading ? (
                        <Table.Tr>
                            <Table.Td colSpan={8} style={{ textAlign: "center" }}>
                                <Text size="sm" c="dimmed">
                                    กำลังโหลดข้อมูล...
                                </Text>
                            </Table.Td>
                        </Table.Tr>
                    ) : rows.length === 0 ? (
                        <Table.Tr>
                            <Table.Td colSpan={8} style={{ textAlign: "center" }}>
                                <Text size="sm" c="dimmed">
                                    ยังไม่มีรายการที่ Check-in แล้วในวันนี้
                                </Text>
                            </Table.Td>
                        </Table.Tr>
                    ) : (
                        rows.map((item) => {
                            const isTrailer = isTrailerTruckType(item.truck_type);

                            const slotText =
                                item.start_time && item.end_time
                                    ? `${item.start_time} - ${item.end_time}${item.queue_no != null
                                        ? ` (${item.queue_no})`
                                        : ""
                                    }`
                                    : item.queue_no != null
                                        ? `Q${item.queue_no}`
                                        : "-";

                            const startDrain = formatTimeHM(item.start_drain_at);
                            const stopDrain = formatTimeHM(item.stop_drain_at);
                            const totalDrain = formatDrainDuration(
                                item.total_drain_secs,
                            );

                            let weightLines = [];

                            if (isTrailer) {
                                const wiMain = formatKg(item.weight_in_main_kg);
                                const wiTrailer = formatKg(
                                    item.weight_in_trailer_kg,
                                );
                                const wiTotal = formatKg(item.weight_in_kg);

                                weightLines.push(`ตัวรถ: ${wiMain}`);
                                weightLines.push(`พ่วง: ${wiTrailer}`);
                                weightLines.push(`รวม: ${wiTotal}`);
                            } else {
                                const wiTotal = formatKg(item.weight_in_kg);
                                weightLines.push(wiTotal);
                            }

                            const supplierText =
                                (item.supplier_code
                                    ? `${item.supplier_code} : `
                                    : "") + (item.supplier_name || "-");

                            return (
                                <Table.Tr key={item.id}>
                                    <Table.Td>{supplierText}</Table.Td>
                                    <Table.Td>{slotText}</Table.Td>
                                    <Table.Td>{item.truck_register || "-"}</Table.Td>
                                    <Table.Td>{item.truck_type || "-"}</Table.Td>
                                    <Table.Td style={{ color: "#16a34a" }}>
                                        {startDrain}
                                    </Table.Td>
                                    <Table.Td style={{ color: "#ef4444" }}>
                                        {stopDrain}
                                    </Table.Td>
                                    <Table.Td>{totalDrain}</Table.Td>
                                    <Table.Td>
                                        {weightLines.map((line, idx) => (
                                            <Text
                                                key={idx}
                                                size="xs"
                                                fw={
                                                    isTrailer &&
                                                        idx === weightLines.length - 1
                                                        ? 700
                                                        : 400
                                                }
                                            >
                                                {line}
                                            </Text>
                                        ))}
                                    </Table.Td>
                                </Table.Tr>
                            );
                        })
                    )}
                </Table.Tbody>
            </Table>

            {/* Pagination */}
            <Group justify="space-between" mt="sm">
                <Text size="xs" c="dimmed">
                    หน้า {page} / {totalPages}
                </Text>
                <Group justify="flex-end">
                    <Button
                        variant="default"
                        size="xs"
                        onClick={handlePrevPage}
                        disabled={page <= 1}
                    >
                        ก่อนหน้า
                    </Button>
                    <Button variant="light" size="xs" disabled>
                        {page}
                    </Button>
                    <Button
                        color="indigo"
                        size="xs"
                        onClick={handleNextPage}
                        disabled={page >= totalPages}
                    >
                        ถัดไป
                    </Button>
                </Group>
            </Group>
        </Stack>
    );
}