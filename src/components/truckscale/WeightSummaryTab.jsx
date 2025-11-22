// src/components/truckscale/WeightSummaryTab.jsx
import {
    Button,
    Card,
    Grid,
    Group,
    Modal,
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

/* ===== Utils ===== */

/** ฟอร์แมตตัวเลขให้มี comma */
const formatNumberWithCommas = (value) => {
    const digitsOnly = String(value ?? "").replace(/\D/g, "");
    if (!digitsOnly) return "";
    return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/** ฟอร์แมตตัวเลข float → string พร้อม comma + กก. */
const fmtKg = (num) => {
    if (!Number.isFinite(num)) return "-";
    const rounded = Math.round(num);
    return `${formatNumberWithCommas(String(rounded))} Kg.`;
};

/** เช็คว่าเป็นรถ 10 ล้อ(พ่วง) หรือไม่ */
const isTrailerTruckType = (t = "") =>
    /10\s*ล้อ\s*\(\s*พ่วง\s*\)/i.test(String(t).trim()) ||
    /10\s*ล้อ\s*พ่วง/i.test(String(t).trim());

/** ฟอร์แมตวันที่เป็นรูปแบบ 15-Nov-2025 */
const fmtDateEN = (val) => {
    if (!val) return "-";
    let d;
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        d = new Date(`${val}T00:00:00`);
    } else {
        d = new Date(val);
    }
    if (Number.isNaN(d.getTime())) return val;

    const dd = String(d.getDate()).padStart(2, "0");
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    const mon = months[d.getMonth()];
    const yyyy = d.getFullYear();
    return `${dd}-${mon}-${yyyy}`;
};

/** แปลง string (มี comma ได้) → number หรือ null */
const parseNumOrNull = (v) => {
    const s = String(v ?? "").replace(/,/g, "").trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
};

/** ฟอร์แมตจังหวัดเป็น "จังหวัด xxx" (ใช้เฉพาะแสดงผล) */
const fmtProvince = (p) => {
    if (!p) return "";
    const s = String(p).trim();
    if (!s) return "";
    if (s.startsWith("จังหวัด")) return s;
    return `จังหวัด ${s}`;
};

/** แปลงค่า date ให้เป็น yyyy-mm-dd กัน toISOString พัง */
const normalizeDate = (value) => {
    if (!value) return null;

    // ถ้าเป็น Date ตรง ๆ
    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) return null;
        return value.toISOString().slice(0, 10);
    }

    // ถ้าเป็น string (จาก API หรือ state)
    if (typeof value === "string") {
        // ถ้ารูปแบบเป็น "2025-11-22" แบบตรง ๆ ใช้ได้เลย
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return value;
        }
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return null;
        return d.toISOString().slice(0, 10);
    }

    return null;
};

const LIMIT_PER_DAY = 500;

/* ===== Toast helper (ใช้ Mantine notifications) ===== */
function toastError(message) {
    notifications.show({
        color: "red",
        title: "เกิดข้อผิดพลาด",
        message,
    });
}

function toastSuccess(message) {
    notifications.show({
        color: "green",
        title: "สำเร็จ",
        message,
    });
}

export default function WeightSummaryTab() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);

    const [q, setQ] = useState("");
    // เก็บเป็น Date object แล้วไปแปลงตอนเรียก API
    const [selectedDate, setSelectedDate] = useState(() => new Date());

    const [rubberMap, setRubberMap] = useState({}); // { code: name }
    const [rubberList, setRubberList] = useState([]); // [{code,name}]
    const [provinceList, setProvinceList] = useState([]); // ["สงขลา", "ตรัง", ...]

    // ตอนนี้ยังไม่เช็ค permission ใช้ให้แก้ไขได้ทุกคนไปก่อน
    const canEditDrain = true;

    /* ===== โหลด Rubber Types → map + list (เรียกตรงผ่าน http) ===== */
    const fetchRubberTypes = async () => {
        try {
            const res = await http.get("/rubber-types", {
                params: {
                    limit: 200,
                    page: 1,
                    status: "active",
                },
            });

            const data = res?.data ?? res;
            const arr =
                (Array.isArray(data?.items) && data.items) ||
                (Array.isArray(data?.results) && data.results) ||
                (Array.isArray(data) && data) ||
                [];

            const map = {};
            const list = [];

            arr.forEach((rt) => {
                const code =
                    rt.code ||
                    rt.rubbertype_code ||
                    rt.name ||
                    rt.name_th ||
                    rt.id ||
                    rt._id;
                const name =
                    rt.name ||
                    rt.name_th ||
                    rt.rubber_name ||
                    rt.code ||
                    rt.rubbertype_code ||
                    code;

                if (code) {
                    const c = String(code);
                    const n = String(name);
                    map[c] = n;
                    list.push({ code: c, name: n });
                }
            });
            setRubberMap(map);
            setRubberList(list);
        } catch (e) {
            console.error("[weight-summary] rubber-types error:", e);
        }
    };

    /* ===== โหลด Provinces → รายชื่อจังหวัด (ชื่อไทย) ===== */
    const fetchProvinces = async () => {
        try {
            const res = await http.get("/th/provinces", {
                params: {
                    limit: 200,
                    page: 1,
                },
            });

            const data = res?.data ?? res;
            const arr =
                (Array.isArray(data?.items) && data.items) ||
                (Array.isArray(data?.results) && data.results) ||
                (Array.isArray(data) && data) ||
                [];

            const list = arr
                .map((p) => {
                    const name =
                        p.name_th ||
                        p.name_en ||
                        p.name ||
                        p.province_name_th ||
                        p.province_name_en;
                    return name ? String(name) : null;
                })
                .filter(Boolean)
                .sort((a, b) => a.localeCompare(b, "th"));
            setProvinceList(list);
        } catch (e) {
            console.error("[weight-summary] provinces error:", e);
        }
    };

    useEffect(() => {
        fetchRubberTypes();
        fetchProvinces();
    }, []);

    const getRubberNameFromCode = (code) => {
        if (!code) return "-";
        const key = String(code);
        return rubberMap[key] || key || "-";
    };

    /* options สำหรับ Select จังหวัด */
    const provinceOptions = useMemo(
        () => provinceList.map((name) => ({ value: name, label: name })),
        [provinceList],
    );

    /* options สำหรับ Select rubber type */
    const rubberOptions = useMemo(
        () =>
            rubberList.map((rt) => ({
                value: rt.code,
                label: rt.name,
            })),
        [rubberList],
    );

    /* ===== ดึง bookings ของวันนั้น ===== */
    const fetchRows = async () => {
        if (!selectedDate) return;

        setLoading(true);

        // ✅ แก้การแปลงวันที่ให้ปลอดภัยขึ้น
        const dateStr = normalizeDate(selectedDate);
        if (!dateStr) {
            setRows([]);
            setLoading(false);
            return;
        }

        try {
            const res = await http.get("/bookings", {
                params: {
                    date: dateStr,          // BE: Query(alias="date")
                    page: 1,
                    limit: LIMIT_PER_DAY,
                    q: q || undefined,
                },
            });

            const data = res?.data ?? res;
            const items =
                (Array.isArray(data?.items) && data.items) ||
                (Array.isArray(data?.results) && data.results) ||
                (Array.isArray(data) && data) ||
                [];

            // เงื่อนไข "Drain ครบ + ชั่งเข้า + ออก ครบ"
            const completed = items.filter(
                (r) =>
                    !!r.checkin_at &&
                    !!r.start_drain_at &&
                    !!r.stop_drain_at &&
                    r.weight_in_kg != null &&
                    r.weight_in_kg !== 0 &&
                    r.weight_out_kg != null &&
                    r.weight_out_kg !== 0,
            );

            setRows(completed);
        } catch (e) {
            console.error("[weight-summary] list error:", e);
            toastError("โหลดข้อมูลสรุปไม่สำเร็จ");
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    // เปลี่ยนวันที่ หรือ q → auto fetch ใหม่
    useEffect(() => {
        fetchRows();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate, q]);

    /* ===== Stats รวม ===== */
    const stats = useMemo(() => {
        if (!rows.length) {
            return {
                count: 0,
                totalIn: 0,
                totalOut: 0,
                totalNet: 0,
                avgNet: 0,
            };
        }

        let totalIn = 0;
        let totalOut = 0;
        let totalNet = 0;

        rows.forEach((r) => {
            const wi = Number(r.weight_in_kg) || 0;
            const wo = Number(r.weight_out_kg) || 0;
            const net =
                Number(
                    typeof r.net_weight_kg !== "undefined"
                        ? r.net_weight_kg
                        : wi - wo,
                ) || 0;

            totalIn += wi;
            totalOut += wo;
            totalNet += net;
        });

        const avgNet = rows.length ? totalNet / rows.length : 0;

        return {
            count: rows.length,
            totalIn,
            totalOut,
            totalNet,
            avgNet,
        };
    }, [rows]);

    /* ====== State สำหรับ Modal แก้ไข ====== */
    const [editOpen, setEditOpen] = useState(false);
    const [editSaving, setEditSaving] = useState(false);
    const [editRow, setEditRow] = useState(null);

    // rubber type
    const [editRubberSingle, setEditRubberSingle] = useState("");
    const [editRubberMain, setEditRubberMain] = useState("");
    const [editRubberTrailer, setEditRubberTrailer] = useState("");

    // weight in
    const [editWiSingle, setEditWiSingle] = useState("");
    const [editWiMain, setEditWiMain] = useState("");
    const [editWiTrailer, setEditWiTrailer] = useState("");

    // weight out
    const [editWoSingle, setEditWoSingle] = useState("");
    const [editWoMain, setEditWoMain] = useState("");
    const [editWoTrailer, setEditWoTrailer] = useState("");

    // provinces
    const [editProvinceSingle, setEditProvinceSingle] = useState("");
    const [editProvinceMain, setEditProvinceMain] = useState("");
    const [editProvinceTrailer, setEditProvinceTrailer] = useState("");

    const resetEditState = () => {
        setEditRow(null);
        setEditRubberSingle("");
        setEditRubberMain("");
        setEditRubberTrailer("");
        setEditWiSingle("");
        setEditWiMain("");
        setEditWiTrailer("");
        setEditWoSingle("");
        setEditWoMain("");
        setEditWoTrailer("");
        setEditProvinceSingle("");
        setEditProvinceMain("");
        setEditProvinceTrailer("");
    };

    const openEditModal = (row) => {
        if (!canEditDrain) return;

        const isTrailer = isTrailerTruckType(row.truck_type);
        setEditRow(row);

        if (isTrailer) {
            // Rubber
            setEditRubberMain(row.rubber_type_main || "");
            setEditRubberTrailer(row.rubber_type_trailer || "");

            // Weight In
            setEditWiMain(
                row.weight_in_main_kg != null
                    ? formatNumberWithCommas(
                        String(Math.round(row.weight_in_main_kg)),
                    )
                    : "",
            );
            setEditWiTrailer(
                row.weight_in_trailer_kg != null
                    ? formatNumberWithCommas(
                        String(Math.round(row.weight_in_trailer_kg)),
                    )
                    : "",
            );

            // Weight Out
            setEditWoMain(
                row.weight_out_main_kg != null
                    ? formatNumberWithCommas(
                        String(Math.round(row.weight_out_main_kg)),
                    )
                    : "",
            );
            setEditWoTrailer(
                row.weight_out_trailer_kg != null
                    ? formatNumberWithCommas(
                        String(Math.round(row.weight_out_trailer_kg)),
                    )
                    : "",
            );

            // Provinces
            setEditProvinceMain(row.province_main || "");
            setEditProvinceTrailer(row.province_trailer || "");

            setEditRubberSingle("");
            setEditWiSingle("");
            setEditWoSingle("");
            setEditProvinceSingle("");
        } else {
            setEditRubberSingle(row.rubber_type || "");

            setEditWiSingle(
                row.weight_in_kg != null
                    ? formatNumberWithCommas(
                        String(Math.round(row.weight_in_kg)),
                    )
                    : "",
            );
            setEditWoSingle(
                row.weight_out_kg != null
                    ? formatNumberWithCommas(
                        String(Math.round(row.weight_out_kg)),
                    )
                    : "",
            );

            setEditProvinceSingle(row.province || "");

            setEditRubberMain("");
            setEditRubberTrailer("");
            setEditWiMain("");
            setEditWiTrailer("");
            setEditWoMain("");
            setEditWoTrailer("");
            setEditProvinceMain("");
            setEditProvinceTrailer("");
        }

        setEditOpen(true);
    };

    const closeEditModal = () => {
        if (editSaving) return;
        setEditOpen(false);
        resetEditState();
    };

    /* ==== handlers สำหรับใส่ comma ใน weight fields ==== */
    const handleWiSingleChange = (val) =>
        setEditWiSingle(formatNumberWithCommas(val));
    const handleWiMainChange = (val) =>
        setEditWiMain(formatNumberWithCommas(val));
    const handleWiTrailerChange = (val) =>
        setEditWiTrailer(formatNumberWithCommas(val));

    const handleWoSingleChange = (val) =>
        setEditWoSingle(formatNumberWithCommas(val));
    const handleWoMainChange = (val) =>
        setEditWoMain(formatNumberWithCommas(val));
    const handleWoTrailerChange = (val) =>
        setEditWoTrailer(formatNumberWithCommas(val));

    const handleSaveEdit = async () => {
        if (!canEditDrain || !editRow?.id) return;

        const isTrailer = isTrailerTruckType(editRow.truck_type);
        const payload = {};

        if (isTrailer) {
            const wiMain = parseNumOrNull(editWiMain);
            const wiTrailer = parseNumOrNull(editWiTrailer);
            const woMain = parseNumOrNull(editWoMain);
            const woTrailer = parseNumOrNull(editWoTrailer);

            // rubber type
            if (editRubberMain) payload.rubber_type_main = editRubberMain;
            if (editRubberTrailer) payload.rubber_type_trailer = editRubberTrailer;

            // weight in
            if (wiMain !== null) payload.weight_in_main_kg = wiMain;
            if (wiTrailer !== null) payload.weight_in_trailer_kg = wiTrailer;

            // weight out
            if (woMain !== null) payload.weight_out_main_kg = woMain;
            if (woTrailer !== null) payload.weight_out_trailer_kg = woTrailer;

            // รวม total ให้ BE ด้วย
            if (wiMain !== null || wiTrailer !== null) {
                payload.weight_in_kg = (wiMain || 0) + (wiTrailer || 0);
            }
            if (woMain !== null || woTrailer !== null) {
                payload.weight_out_kg = (woMain || 0) + (woTrailer || 0);
            }

            // provinces
            if (editProvinceMain) payload.province_main = editProvinceMain;
            if (editProvinceTrailer) payload.province_trailer = editProvinceTrailer;
        } else {
            const wi = parseNumOrNull(editWiSingle);
            const wo = parseNumOrNull(editWoSingle);

            if (editRubberSingle) payload.rubber_type = editRubberSingle;
            if (wi !== null) payload.weight_in_kg = wi;
            if (wo !== null) payload.weight_out_kg = wo;

            if (editProvinceSingle) payload.province = editProvinceSingle;
        }

        if (!Object.keys(payload).length) {
            toastError("ไม่มีข้อมูลที่เปลี่ยนแปลง");
            return;
        }

        setEditSaving(true);
        try {
            await http.post(`/bookings/${editRow.id}/weight-out`, payload);

            toastSuccess("อัปเดตข้อมูล Drain / Weight สำเร็จ");
            setEditSaving(false);
            setEditOpen(false);
            resetEditState();
            fetchRows();
        } catch (e) {
            console.error("[weight-summary] edit save error:", e);
            toastError("บันทึกการแก้ไขไม่สำเร็จ");
            setEditSaving(false);
        }
    };

    // เอาไว้ใช้ใน table ตอนแสดงวันที่ (กรณี record ไม่มี field date)
    const currentDateStr =
        normalizeDate(selectedDate) ||
        new Date().toISOString().slice(0, 10);

    return (
        <>
            <Stack gap="lg">
                {/* Header */}
                <Group justify="space-between" align="center">
                    <Text fw={700} size="sm">
                        WEIGHT SUMMARY — DASHBOARD
                    </Text>
                    <Text size="xs" c="dimmed">
                        Operations / Weight Summary — Dashboard
                    </Text>
                </Group>

                {/* Filters */}
                <Group align="flex-end" gap="md" wrap="wrap">
                    <div>
                        <Text
                            size="xs"
                            fw={600}
                            c="dimmed"
                            style={{ marginBottom: 4 }}
                        >
                            วันที่
                        </Text>
                        <DateInput
                            value={selectedDate}
                            onChange={(d) => {
                                if (d) setSelectedDate(d);
                            }}
                            valueFormat="DD-MMM-YYYY"
                            size="sm"
                            w={180}
                        />
                    </div>

                    <div style={{ flex: 1, minWidth: 260 }}>
                        <Text
                            size="xs"
                            fw={600}
                            c="dimmed"
                            style={{ marginBottom: 4 }}
                        >
                            ค้นหา (Supplier / Truck / Type / Code)
                        </Text>
                        <TextInput
                            placeholder="พิมพ์เพื่อค้นหา…"
                            value={q}
                            onChange={(e) => setQ(e.currentTarget.value)}
                            leftSection={<IconSearch size={14} />}
                            size="sm"
                        />
                    </div>

                    <Button
                        mt="xs"
                        size="sm"
                        variant="default"
                        onClick={fetchRows}
                    >
                        รีเฟรชข้อมูล
                    </Button>
                </Group>

                {/* Summary Cards */}
                <Group gap="md" align="stretch">
                    <Card radius="md" withBorder padding="md" style={{ flex: 1 }}>
                        <Text
                            size="xs"
                            c="dimmed"
                            fw={600}
                            style={{
                                textTransform: "uppercase",
                                letterSpacing: ".04em",
                            }}
                        >
                            Total Weight In
                        </Text>
                        <Text size="xl" fw={800}>
                            {fmtKg(stats.totalIn)}
                        </Text>
                        <Text size="xs" c="dimmed">
                            จาก {stats.count} รายการ
                        </Text>
                    </Card>

                    <Card radius="md" withBorder padding="md" style={{ flex: 1 }}>
                        <Text
                            size="xs"
                            c="dimmed"
                            fw={600}
                            style={{
                                textTransform: "uppercase",
                                letterSpacing: ".04em",
                            }}
                        >
                            Total Weight Out
                        </Text>
                        <Text size="xl" fw={800}>
                            {fmtKg(stats.totalOut)}
                        </Text>
                        <Text size="xs" c="dimmed">
                            รวมทุกการ Check-OUT ในวันนั้น
                        </Text>
                    </Card>

                    <Card radius="md" withBorder padding="md" style={{ flex: 1 }}>
                        <Text
                            size="xs"
                            c="dimmed"
                            fw={600}
                            style={{
                                textTransform: "uppercase",
                                letterSpacing: ".04em",
                            }}
                        >
                            Net Weight รวม
                        </Text>
                        <Text size="xl" fw={800}>
                            {fmtKg(stats.totalNet)}
                        </Text>
                        <Text size="xs" c="dimmed">
                            เฉลี่ยต่อคัน: {fmtKg(stats.avgNet)}
                        </Text>
                    </Card>

                    <Card radius="md" withBorder padding="md" style={{ flex: 1 }}>
                        <Text
                            size="xs"
                            c="dimmed"
                            fw={600}
                            style={{
                                textTransform: "uppercase",
                                letterSpacing: ".04em",
                            }}
                        >
                            Quick Glance (Today)
                        </Text>
                        <Stack gap={4} mt="xs">
                            <Group justify="space-between">
                                <Text size="xs" c="dimmed">
                                    จำนวนคันที่ Drain ครบ
                                </Text>
                                <Text size="xs" fw={600}>
                                    {stats.count} คัน
                                </Text>
                            </Group>
                            <Group justify="space-between">
                                <Text size="xs" c="dimmed">
                                    รวม Net Weight
                                </Text>
                                <Text size="xs" fw={600}>
                                    {fmtKg(stats.totalNet)}
                                </Text>
                            </Group>
                            <Group justify="space-between">
                                <Text size="xs" c="dimmed">
                                    เฉลี่ย Net ต่อคัน
                                </Text>
                                <Text size="xs" fw={600}>
                                    {fmtKg(stats.avgNet)}
                                </Text>
                            </Group>
                        </Stack>
                    </Card>
                </Group>

                {/* Table header */}
                <Group justify="space-between" align="center" mt="md">
                    <Text fw={700} size="sm">
                        รายการ Drain ที่สมบูรณ์
                    </Text>
                    {loading && (
                        <Text size="xs" c="dimmed">
                            กำลังโหลด…
                        </Text>
                    )}
                </Group>

                {/* Table */}
                <Table striped highlightOnHover withColumnBorders={false}>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>วันที่</Table.Th>
                            <Table.Th>Supplier</Table.Th>
                            <Table.Th>ทะเบียนรถ</Table.Th>
                            <Table.Th>ประเภท</Table.Th>
                            <Table.Th>Rubber Type / จังหวัด</Table.Th>
                            <Table.Th>Weight In</Table.Th>
                            <Table.Th>Weight Out</Table.Th>
                            <Table.Th>Net</Table.Th>
                            {canEditDrain && (
                                <Table.Th style={{ textAlign: "right" }}>
                                    Actions
                                </Table.Th>
                            )}
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {loading ? (
                            <Table.Tr>
                                <Table.Td
                                    colSpan={canEditDrain ? 9 : 8}
                                    style={{ textAlign: "center" }}
                                >
                                    <Text size="sm" c="dimmed">
                                        กำลังโหลด…
                                    </Text>
                                </Table.Td>
                            </Table.Tr>
                        ) : rows.length === 0 ? (
                            <Table.Tr>
                                <Table.Td
                                    colSpan={canEditDrain ? 9 : 8}
                                    style={{ textAlign: "center" }}
                                >
                                    <Text size="sm" c="dimmed">
                                        ไม่มีข้อมูล
                                    </Text>
                                </Table.Td>
                            </Table.Tr>
                        ) : (
                            rows.map((r) => {
                                const isTrailer = isTrailerTruckType(r.truck_type);

                                const rowDateText = fmtDateEN(
                                    r.date || currentDateStr,
                                );

                                const wi = Number(r.weight_in_kg) || 0;
                                let wo = Number(r.weight_out_kg) || 0;

                                const wiMain = Number(r.weight_in_main_kg) || 0;
                                const wiTrailer =
                                    Number(r.weight_in_trailer_kg) || 0;
                                const woMain = Number(r.weight_out_main_kg) || 0;
                                const woTrailer =
                                    Number(r.weight_out_trailer_kg) || 0;

                                if (isTrailer && !wo && (woMain || woTrailer)) {
                                    wo = woMain + woTrailer;
                                }

                                let netTotal =
                                    Number(
                                        typeof r.net_weight_kg !== "undefined"
                                            ? r.net_weight_kg
                                            : wi - wo,
                                    ) || 0;

                                let netMain;
                                let netTrailer;
                                if (
                                    typeof r.net_main_kg !== "undefined" ||
                                    typeof r.net_trailer_kg !== "undefined"
                                ) {
                                    netMain = Number(r.net_main_kg) || 0;
                                    netTrailer = Number(r.net_trailer_kg) || 0;
                                } else if (isTrailer) {
                                    netMain = wiMain - woMain;
                                    netTrailer = wiTrailer - woTrailer;
                                }

                                const mainName = getRubberNameFromCode(
                                    r.rubber_type_main,
                                );
                                const trailerName = getRubberNameFromCode(
                                    r.rubber_type_trailer,
                                );
                                const singleName = getRubberNameFromCode(
                                    r.rubber_type,
                                );

                                const provinceSingle = fmtProvince(r.province);
                                const provinceMain = fmtProvince(
                                    r.province_main,
                                );
                                const provinceTrailer = fmtProvince(
                                    r.province_trailer,
                                );

                                return (
                                    <Table.Tr key={r.id}>
                                        <Table.Td>{rowDateText}</Table.Td>
                                        <Table.Td>
                                            {(r.supplier_code
                                                ? `${r.supplier_code} : `
                                                : "") + (r.supplier_name || "-")}
                                        </Table.Td>
                                        <Table.Td>{r.truck_register || "-"}</Table.Td>
                                        <Table.Td>{r.truck_type || "-"}</Table.Td>

                                        {/* Rubber Type + จังหวัด */}
                                        <Table.Td>
                                            {isTrailer ? (
                                                <Stack gap={2}>
                                                    <Text size="xs">
                                                        ตัวรถ: {mainName}
                                                    </Text>
                                                    {provinceMain && (
                                                        <Text size="xs" c="dimmed">
                                                            {provinceMain}
                                                        </Text>
                                                    )}
                                                    <Text
                                                        size="xs"
                                                        style={{ marginTop: 4 }}
                                                    >
                                                        พ่วง: {trailerName}
                                                    </Text>
                                                    {provinceTrailer && (
                                                        <Text size="xs" c="dimmed">
                                                            {provinceTrailer}
                                                        </Text>
                                                    )}
                                                </Stack>
                                            ) : (
                                                <Stack gap={2}>
                                                    <Text size="xs">{singleName}</Text>
                                                    {provinceSingle && (
                                                        <Text size="xs" c="dimmed">
                                                            {provinceSingle}
                                                        </Text>
                                                    )}
                                                </Stack>
                                            )}
                                        </Table.Td>

                                        {/* Weight In */}
                                        <Table.Td>
                                            {isTrailer ? (
                                                <Stack gap={2}>
                                                    <Text size="xs">
                                                        ตัวรถ:{" "}
                                                        {wiMain ? fmtKg(wiMain) : "-"}
                                                    </Text>
                                                    <Text size="xs">
                                                        พ่วง:{" "}
                                                        {wiTrailer
                                                            ? fmtKg(wiTrailer)
                                                            : "-"}
                                                    </Text>
                                                    <Text size="xs" fw={600}>
                                                        รวม: {fmtKg(wi)}
                                                    </Text>
                                                </Stack>
                                            ) : (
                                                <Text size="xs">{fmtKg(wi)}</Text>
                                            )}
                                        </Table.Td>

                                        {/* Weight Out */}
                                        <Table.Td>
                                            {isTrailer ? (
                                                <Stack gap={2}>
                                                    <Text size="xs">
                                                        ตัวรถ:{" "}
                                                        {woMain ? fmtKg(woMain) : "-"}
                                                    </Text>
                                                    <Text size="xs">
                                                        พ่วง:{" "}
                                                        {woTrailer
                                                            ? fmtKg(woTrailer)
                                                            : "-"}
                                                    </Text>
                                                    <Text size="xs" fw={600}>
                                                        รวม: {fmtKg(wo)}
                                                    </Text>
                                                </Stack>
                                            ) : (
                                                <Text size="xs">{fmtKg(wo)}</Text>
                                            )}
                                        </Table.Td>

                                        {/* Net */}
                                        <Table.Td>
                                            {isTrailer ? (
                                                <Stack gap={2}>
                                                    <Text size="xs">
                                                        ตัวรถ:{" "}
                                                        {Number.isFinite(netMain)
                                                            ? fmtKg(netMain)
                                                            : "-"}
                                                    </Text>
                                                    <Text size="xs">
                                                        พ่วง:{" "}
                                                        {Number.isFinite(netTrailer)
                                                            ? fmtKg(netTrailer)
                                                            : "-"}
                                                    </Text>
                                                    <Text size="xs" fw={600}>
                                                        รวม: {fmtKg(netTotal)}
                                                    </Text>
                                                </Stack>
                                            ) : (
                                                <Text size="xs">
                                                    {fmtKg(netTotal)}
                                                </Text>
                                            )}
                                        </Table.Td>

                                        {/* Actions */}
                                        {canEditDrain && (
                                            <Table.Td
                                                style={{
                                                    textAlign: "right",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                <Button
                                                    size="xs"
                                                    variant="light"
                                                    color="indigo"
                                                    onClick={() => openEditModal(r)}
                                                >
                                                    แก้ไข
                                                </Button>
                                            </Table.Td>
                                        )}
                                    </Table.Tr>
                                );
                            })
                        )}
                    </Table.Tbody>
                </Table>
            </Stack>

            {/* ===== Modal แก้ไข Drain / Weight + จังหวัด ===== */}
            <Modal
                opened={editOpen}
                onClose={closeEditModal}
                centered
                title="แก้ไขข้อมูล Drain / Weight"
                size="lg"
            >
                {editRow && (
                    <Stack gap="md">
                        <Stack
                            gap={2}
                            style={{ fontSize: 12, color: "#6b7280" }}
                        >
                            <Text size="xs">
                                <b>คิว:</b> {editRow.queue_no ?? "-"}
                            </Text>
                            <Text size="xs">
                                <b>ทะเบียน:</b> {editRow.truck_register || "-"}
                            </Text>
                            <Text size="xs">
                                <b>ประเภท:</b> {editRow.truck_type || "-"}
                            </Text>
                        </Stack>

                        {isTrailerTruckType(editRow.truck_type) ? (
                            <>
                                {/* Province ตัวรถ / พ่วง */}
                                <Grid gutter="md">
                                    <Grid.Col span={6}>
                                        <Text
                                            size="xs"
                                            fw={600}
                                            style={{ marginBottom: 4 }}
                                        >
                                            จังหวัด (ตัวรถ)
                                        </Text>
                                        <Select
                                            data={provinceOptions}
                                            value={editProvinceMain || null}
                                            onChange={(val) =>
                                                setEditProvinceMain(val || "")
                                            }
                                            searchable
                                            clearable
                                            placeholder="- เลือกจังหวัด -"
                                            comboboxProps={{
                                                withinPortal: true,
                                            }}
                                            nothingFoundMessage="ไม่พบจังหวัด"
                                            size="sm"
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Text
                                            size="xs"
                                            fw={600}
                                            style={{ marginBottom: 4 }}
                                        >
                                            จังหวัด (พ่วง)
                                        </Text>
                                        <Select
                                            data={provinceOptions}
                                            value={editProvinceTrailer || null}
                                            onChange={(val) =>
                                                setEditProvinceTrailer(val || "")
                                            }
                                            searchable
                                            clearable
                                            placeholder="- เลือกจังหวัด -"
                                            comboboxProps={{
                                                withinPortal: true,
                                            }}
                                            nothingFoundMessage="ไม่พบจังหวัด"
                                            size="sm"
                                        />
                                    </Grid.Col>
                                </Grid>

                                {/* Rubber Type ตัวรถ / พ่วง */}
                                <Grid gutter="md">
                                    <Grid.Col span={6}>
                                        <Text
                                            size="xs"
                                            fw={600}
                                            style={{ marginBottom: 4 }}
                                        >
                                            Rubber Type (ตัวรถ)
                                        </Text>
                                        <Select
                                            data={rubberOptions}
                                            value={editRubberMain || null}
                                            onChange={(val) =>
                                                setEditRubberMain(val || "")
                                            }
                                            searchable
                                            clearable
                                            placeholder="- เลือก Rubber Type -"
                                            comboboxProps={{
                                                withinPortal: true,
                                            }}
                                            nothingFoundMessage="ไม่พบข้อมูล"
                                            size="sm"
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Text
                                            size="xs"
                                            fw={600}
                                            style={{ marginBottom: 4 }}
                                        >
                                            Rubber Type (พ่วง)
                                        </Text>
                                        <Select
                                            data={rubberOptions}
                                            value={editRubberTrailer || null}
                                            onChange={(val) =>
                                                setEditRubberTrailer(val || "")
                                            }
                                            searchable
                                            clearable
                                            placeholder="- เลือก Rubber Type -"
                                            comboboxProps={{
                                                withinPortal: true,
                                            }}
                                            nothingFoundMessage="ไม่พบข้อมูล"
                                            size="sm"
                                        />
                                    </Grid.Col>
                                </Grid>

                                {/* Weight In */}
                                <Grid gutter="md">
                                    <Grid.Col span={6}>
                                        <Text
                                            size="xs"
                                            fw={600}
                                            style={{ marginBottom: 4 }}
                                        >
                                            Weight In (ตัวรถ)
                                        </Text>
                                        <TextInput
                                            value={editWiMain}
                                            onChange={(e) =>
                                                handleWiMainChange(
                                                    e.currentTarget.value,
                                                )
                                            }
                                            placeholder="เช่น 18,560"
                                            size="sm"
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Text
                                            size="xs"
                                            fw={600}
                                            style={{ marginBottom: 4 }}
                                        >
                                            Weight In (พ่วง)
                                        </Text>
                                        <TextInput
                                            value={editWiTrailer}
                                            onChange={(e) =>
                                                handleWiTrailerChange(
                                                    e.currentTarget.value,
                                                )
                                            }
                                            placeholder="เช่น 8,320"
                                            size="sm"
                                        />
                                    </Grid.Col>
                                </Grid>

                                {/* Weight Out */}
                                <Grid gutter="md">
                                    <Grid.Col span={6}>
                                        <Text
                                            size="xs"
                                            fw={600}
                                            style={{ marginBottom: 4 }}
                                        >
                                            Weight Out (ตัวรถ)
                                        </Text>
                                        <TextInput
                                            value={editWoMain}
                                            onChange={(e) =>
                                                handleWoMainChange(
                                                    e.currentTarget.value,
                                                )
                                            }
                                            placeholder="เช่น 12,450"
                                            size="sm"
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Text
                                            size="xs"
                                            fw={600}
                                            style={{ marginBottom: 4 }}
                                        >
                                            Weight Out (พ่วง)
                                        </Text>
                                        <TextInput
                                            value={editWoTrailer}
                                            onChange={(e) =>
                                                handleWoTrailerChange(
                                                    e.currentTarget.value,
                                                )
                                            }
                                            placeholder="เช่น 5,600"
                                            size="sm"
                                        />
                                    </Grid.Col>
                                </Grid>
                            </>
                        ) : (
                            <>
                                {/* Province (single) */}
                                <div>
                                    <Text
                                        size="xs"
                                        fw={600}
                                        style={{ marginBottom: 4 }}
                                    >
                                        จังหวัด
                                    </Text>
                                    <Select
                                        data={provinceOptions}
                                        value={editProvinceSingle || null}
                                        onChange={(val) =>
                                            setEditProvinceSingle(val || "")
                                        }
                                        searchable
                                        clearable
                                        placeholder="- เลือกจังหวัด -"
                                        comboboxProps={{ withinPortal: true }}
                                        nothingFoundMessage="ไม่พบจังหวัด"
                                        size="sm"
                                    />
                                </div>

                                {/* Rubber Type (single) */}
                                <div>
                                    <Text
                                        size="xs"
                                        fw={600}
                                        style={{ marginBottom: 4 }}
                                    >
                                        Rubber Type
                                    </Text>
                                    <Select
                                        data={rubberOptions}
                                        value={editRubberSingle || null}
                                        onChange={(val) =>
                                            setEditRubberSingle(val || "")
                                        }
                                        searchable
                                        clearable
                                        placeholder="- เลือก Rubber Type -"
                                        comboboxProps={{ withinPortal: true }}
                                        nothingFoundMessage="ไม่พบข้อมูล"
                                        size="sm"
                                    />
                                </div>

                                {/* Weight In / Out */}
                                <Grid gutter="md">
                                    <Grid.Col span={6}>
                                        <Text
                                            size="xs"
                                            fw={600}
                                            style={{ marginBottom: 4 }}
                                        >
                                            Weight In
                                        </Text>
                                        <TextInput
                                            value={editWiSingle}
                                            onChange={(e) =>
                                                handleWiSingleChange(
                                                    e.currentTarget.value,
                                                )
                                            }
                                            placeholder="เช่น 18,560"
                                            size="sm"
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Text
                                            size="xs"
                                            fw={600}
                                            style={{ marginBottom: 4 }}
                                        >
                                            Weight Out
                                        </Text>
                                        <TextInput
                                            value={editWoSingle}
                                            onChange={(e) =>
                                                handleWoSingleChange(
                                                    e.currentTarget.value,
                                                )
                                            }
                                            placeholder="เช่น 12,560"
                                            size="sm"
                                        />
                                    </Grid.Col>
                                </Grid>
                            </>
                        )}

                        <Group justify="flex-end" mt="md">
                            <Button
                                variant="default"
                                onClick={closeEditModal}
                                disabled={editSaving}
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                color="indigo"
                                onClick={handleSaveEdit}
                                loading={editSaving}
                            >
                                บันทึกการแก้ไข
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Modal>
        </>
    );
}