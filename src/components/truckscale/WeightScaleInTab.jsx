// src/components/truckscale/WeightScaleInTab.jsx
import {
    Box,
    Button,
    Group,
    Modal,
    Select,
    Stack,
    Table,
    Text,
    TextInput,
} from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

import { http } from "@/helpers/http";

/* ========= Toast helpers ========= */

const toastError = (message) =>
    notifications.show({
        color: "red",
        title: "เกิดข้อผิดพลาด",
        message,
    });

const toastSuccess = (message) =>
    notifications.show({
        color: "green",
        title: "สำเร็จ",
        message,
    });

const toastWarn = (message) =>
    notifications.show({
        color: "yellow",
        title: "แจ้งเตือน",
        message,
    });

/* ========= Utils ========= */

/** แปลง Date → "YYYY-MM-DD" */
const toISODate = (d) => {
    if (!d) return null;
    const dd = new Date(d);
    return dd.toISOString().slice(0, 10);
};

/** ฟอร์แมตเวลาจาก ISO string → "HH:mm" */
const fmtTime = (iso) =>
    iso
        ? new Date(iso).toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
        })
        : "-";

/** ใช้สำหรับ tooltip / dialog: HH:MM:SS */
const fmtDuration = (sec) => {
    const n = Number(sec);
    if (!Number.isFinite(n) || n < 0) return "00:00:00";
    const hh = String(Math.floor(n / 3600)).padStart(2, "0");
    const mm = String(Math.floor((n % 3600) / 60)).padStart(2, "0");
    const ss = String(Math.floor(n % 60)).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
};

/** ใช้สำหรับแสดงในตาราง: "01 ชั่วโมง 33 นาที" (ไม่แสดงวินาที) */
const fmtDurationText = (sec) => {
    const n = Number(sec);
    if (!Number.isFinite(n) || n < 0) return "00 ชั่วโมง 00 นาที";
    const h = Math.floor(n / 3600);
    const m = Math.floor((n % 3600) / 60);

    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");

    if (h === 0) {
        return `${mm} นาที`;
    }
    return `${hh} ชั่วโมง ${mm} นาที`;
};

/** local Date → ISO string (ปรับ timezone ให้เป็น UTC) */
const toISO = (d) => {
    const date = d instanceof Date && !Number.isNaN(d.getTime()) ? d : new Date();
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
};

/** รวม dateStr (yyyy-mm-dd) + เวลา t → ISO (local→UTC) */
const toISOOnDateWithTime = (dateStr, t) => {
    try {
        if (!dateStr || !(t instanceof Date) || Number.isNaN(t.getTime())) {
            return toISO(new Date());
        }
        const base = new Date(`${dateStr}T00:00:00`);
        if (Number.isNaN(base.getTime())) return toISO(new Date());
        base.setHours(t.getHours(), t.getMinutes(), t.getSeconds(), 0);
        return new Date(
            base.getTime() - base.getTimezoneOffset() * 60000,
        ).toISOString();
    } catch {
        return toISO(new Date());
    }
};

/** ฟอร์แมตตัวเลขให้มี comma */
const formatNumberWithCommas = (value) => {
    const digitsOnly = String(value ?? "").replace(/\D/g, "");
    if (!digitsOnly) return "";
    return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

/** แปลง Date → "HH:mm" (ไว้ใช้กับ TimeInput) */
const dateToTimeString = (d) => {
    const date = d instanceof Date && !Number.isNaN(d.getTime()) ? d : new Date();
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
};

/** confirm modal สำหรับใช้ซ้ำ */
const openConfirmModal = ({ title, lines, color = "indigo", onConfirm }) => {
    modals.openConfirmModal({
        title,
        centered: true,
        children: (
            <Stack gap={4}>
                {lines.map((line, idx) => (
                    <Text key={idx} size="sm">
                        {line}
                    </Text>
                ))}
            </Stack>
        ),
        labels: { confirm: "ยืนยัน", cancel: "ยกเลิก" },
        confirmProps: { color },
        onConfirm,
    });
};

export default function WeightScaleInTab({ user }) {
    /* ===== Filters / paging ===== */
    const [rowsPerPage, setRowsPerPage] = useState("10");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const limit = useMemo(() => Number(rowsPerPage) || 10, [rowsPerPage]);
    const totalPages = useMemo(
        () => Math.max(1, Math.ceil((total || 1) / limit)),
        [total, limit],
    );

    /* ===== Rows + loading ===== */
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);

    /* ===== Live timer for Total Drain ===== */
    const [nowTick, setNowTick] = useState(() => Date.now());

    /* ===== Inline Start Drain editor ===== */
    // เปลี่ยนให้เก็บเป็น string "HH:mm" แทน Date
    const [editStart, setEditStart] = useState({}); // { [id]: "HH:mm" }
    const [editingId, setEditingId] = useState(null);

    /* ===== Weight modal state ===== */
    const [wModalOpen, setWModalOpen] = useState(false);
    const [wRow, setWRow] = useState(null);
    const [wModeTrailer, setWModeTrailer] = useState(false); // true = 10 ล้อ(พ่วง)

    // single mode
    const [wSingleValue, setWSingleValue] = useState("");
    const [wRubberSingle, setWRubberSingle] = useState("");
    const [wProvinceSingle, setWProvinceSingle] = useState("");

    // trailer mode
    const [wMainValue, setWMainValue] = useState("");
    const [wTrailerValue, setWTrailerValue] = useState("");
    const [wRubberMain, setWRubberMain] = useState("");
    const [wRubberTrailer, setWRubberTrailer] = useState("");
    const [wProvinceMain, setWProvinceMain] = useState("");
    const [wProvinceTrailer, setWProvinceTrailer] = useState("");

    /* ===== Rubber types & Provinces (for Select) ===== */
    const [rubberList, setRubberList] = useState([]);
    const [provinceList, setProvinceList] = useState([]);

    const rubberOptions = useMemo(
        () =>
            rubberList.map((rt) => ({
                value:
                    rt.code ||
                    rt.rubbertype_code ||
                    rt.name ||
                    rt.name_th ||
                    rt.id ||
                    rt._id,
                label:
                    rt.name ||
                    rt.name_th ||
                    rt.rubber_name ||
                    rt.code ||
                    rt.rubbertype_code ||
                    "",
            })),
        [rubberList],
    );

    const provinceOptions = useMemo(
        () =>
            provinceList.map((name) => ({
                value: name,
                label: name,
            })),
        [provinceList],
    );

    const getProvinceLabel = (val) => {
        if (!val) return "(ไม่ระบุ)";
        const opt = provinceOptions.find(
            (o) => o.value === val || o.label === val,
        );
        return opt?.label || String(val);
    };

    /* ===== Load Rubber Types from API ===== */
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
            setRubberList(arr);
        } catch (e) {
            console.error("[weight-scale-in] rubber-types error:", e);
        }
    };

    /* ===== Load Provinces from API ===== */
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
            console.error("[weight-scale-in] provinces error:", e);
        }
    };

    useEffect(() => {
        fetchRubberTypes();
        fetchProvinces();
    }, []);

    /* ===== Interval for live total drain ===== */
    useEffect(() => {
        const hasActive = rows.some((r) => r.start_drain_at && !r.stop_drain_at);
        if (!hasActive) return;
        const id = setInterval(() => setNowTick(Date.now()), 1000);
        return () => clearInterval(id);
    }, [rows]);

    /* ===== Fetch rows: only Check-in & ยังไม่มี Weight Out ===== */
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

            // เฉพาะที่ check-in แล้ว
            const checkedIn = items.filter((r) => !!r.checkin_at);

            // ซ่อนรายการที่มี weight_out_kg / weight_out (เหมือน project เก่า)
            const visible = checkedIn.filter(
                (r) => r.weight_out_kg == null && r.weight_out == null,
            );

            setRows(visible);
            setTotal(data?.total ?? visible.length);
        } catch (e) {
            console.error("[weight-scale-in] fetch error:", e);
            toastError("โหลดข้อมูล WEIGHT SCALE IN ไม่สำเร็จ");
            setRows([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRows();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate, searchText, page, limit]);

    // เปลี่ยนจำนวนแถว / วันที่ / text search → ย้อนกลับไปหน้า 1
    useEffect(() => {
        setPage(1);
    }, [rowsPerPage, selectedDate, searchText]);

    const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
    const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

    /* ===== Weight modal helpers ===== */
    const resetWeightState = () => {
        setWRow(null);
        setWModeTrailer(false);

        setWSingleValue("");
        setWRubberSingle("");
        setWProvinceSingle("");

        setWMainValue("");
        setWTrailerValue("");
        setWRubberMain("");
        setWRubberTrailer("");
        setWProvinceMain("");
        setWProvinceTrailer("");
    };

    const closeWeightModal = () => {
        setWModalOpen(false);
        resetWeightState();
    };

    /* ===== Start Drain editor helpers ===== */
    const openStartEditor = (row) => {
        setEditingId(row.id);

        let initial = "";
        if (row.start_drain_at) {
            initial = dateToTimeString(new Date(row.start_drain_at));
        } else {
            initial = dateToTimeString(new Date());
        }

        setEditStart((m) => ({
            ...m,
            [row.id]: initial,
        }));
    };

    const closeStartEditor = (rowId) => {
        setEditingId((prev) => (prev === rowId ? null : prev));
        setEditStart((m) => {
            const clone = { ...m };
            delete clone[rowId];
            return clone;
        });
    };

    /* ===== Start / Update Drain ===== */
    const handleStartConfirm = (row) => {
        const nowTimeStr = dateToTimeString(new Date());
        const timeStr = editStart[row.id] || nowTimeStr;

        const [hStr, mStr] = String(timeStr || "00:00").split(":");
        const h = Number(hStr) || 0;
        const m = Number(mStr) || 0;

        const picked = new Date();
        picked.setHours(h, m, 0, 0);

        const prettyNew = picked.toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
        });
        const oldStartTxt = row.start_drain_at ? fmtTime(row.start_drain_at) : null;

        const lines = [
            `คิว : ${row.queue_no ?? "-"}`,
            `ทะเบียน : ${row.truck_register || "-"}`,
            `ประเภท : ${row.truck_type || "-"}`,
        ];
        if (oldStartTxt) lines.push(`เวลาเดิม : ${oldStartTxt}`);
        lines.push(`เวลาใหม่ : ${prettyNew}`);

        openConfirmModal({
            title: row.start_drain_at
                ? "ยืนยันแก้ไขเวลา Start Drain"
                : "ยืนยันเริ่มจับเวลา Drain",
            color: "green",
            lines,
            onConfirm: async () => {
                try {
                    const dateStr = toISODate(selectedDate) || toISODate(new Date());
                    const isoStart = dateStr
                        ? toISOOnDateWithTime(dateStr, picked)
                        : toISO(picked);

                    await http.post(`/bookings/${row.id}/start-drain`, {
                        started_at: isoStart,
                    });

                    closeStartEditor(row.id);

                    toastSuccess(
                        row.start_drain_at
                            ? "ปรับเวลา Start Drain แล้ว"
                            : "เริ่มจับเวลา Drain แล้ว",
                    );
                    fetchRows();
                } catch (e) {
                    console.error("[weight-scale-in] start error:", e);
                    toastError("บันทึกเวลา Start Drain ไม่สำเร็จ");
                }
            },
        });
    };

    /* ===== Stop Drain ===== */
    const handleStopDrain = (row) => {
        if (!row.start_drain_at) {
            toastWarn("ยังไม่มีเวลา Start Drain");
            return;
        }

        const now = new Date();
        const start = new Date(row.start_drain_at);
        const diffSecs = Math.max(0, (now.getTime() - start.getTime()) / 1000);
        const roundedSecs = Math.round(diffSecs);

        const lines = [
            `คิว : ${row.queue_no ?? "-"}`,
            `ทะเบียน : ${row.truck_register || "-"}`,
            `ประเภท : ${row.truck_type || "-"}`,
            `Start : ${fmtTime(row.start_drain_at)}`,
            `Stop : ${now.toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
            })}`,
            `รวมเวลา : ${fmtDuration(roundedSecs)}`,
        ];

        openConfirmModal({
            title: "ยืนยันหยุดจับเวลา Drain",
            color: "red",
            lines,
            onConfirm: async () => {
                try {
                    await http.post(`/bookings/${row.id}/stop-drain`, {
                        stopped_at: toISO(now),
                        total_drain_secs: roundedSecs,
                    });

                    toastSuccess("หยุดจับเวลา Drain แล้ว");
                    fetchRows();
                } catch (e) {
                    console.error("[weight-scale-in] stop error:", e);
                    toastError("บันทึกเวลา Stop Drain ไม่สำเร็จ");
                }
            },
        });
    };

    /* ===== Weight In modal open ===== */
    const openWeight = (row) => {
        if (!row.stop_drain_at) {
            toastWarn("ต้องกด Stop Drain ก่อน จึงจะบันทึกน้ำหนักได้");
            return;
        }

        const trailer = isTrailerTruckType(row.truck_type);

        setWRow(row);
        setWModeTrailer(trailer);

        if (trailer) {
            // Provinces
            setWProvinceMain(row.province_main || "");
            setWProvinceTrailer(row.province_trailer || "");

            // Weights
            setWMainValue(
                row.weight_in_main_kg
                    ? formatNumberWithCommas(String(Math.round(row.weight_in_main_kg)))
                    : "",
            );
            setWTrailerValue(
                row.weight_in_trailer_kg
                    ? formatNumberWithCommas(
                        String(Math.round(row.weight_in_trailer_kg)),
                    )
                    : "",
            );

            // Rubber
            setWRubberMain(row.rubber_type_main || "");
            setWRubberTrailer(row.rubber_type_trailer || "");
        } else {
            setWProvinceSingle(row.province || "");
            setWSingleValue(
                row.weight_in_kg
                    ? formatNumberWithCommas(String(Math.round(row.weight_in_kg)))
                    : "",
            );
            setWRubberSingle(row.rubber_type || "");
        }

        setWModalOpen(true);
    };

    /* ===== Weight field handlers ===== */
    const handleSingleWeightChange = (val) =>
        setWSingleValue(formatNumberWithCommas(val));
    const handleMainWeightChange = (val) =>
        setWMainValue(formatNumberWithCommas(val));
    const handleTrailerWeightChange = (val) =>
        setWTrailerValue(formatNumberWithCommas(val));

    /* ===== Save Weight In ===== */
    const saveWeight = () => {
        if (!wRow?.id) return;
        if (!wRow.stop_drain_at) {
            toastWarn("ต้องกด Stop Drain ก่อนจึงจะบันทึกน้ำหนักได้");
            return;
        }

        // ----- Trailer mode -----
        if (wModeTrailer) {
            const nMain = Number(
                String(wMainValue || "").replace(/,/g, "").trim(),
            );
            const nTrailer = Number(
                String(wTrailerValue || "").replace(/,/g, "").trim(),
            );

            if (
                (!Number.isFinite(nMain) || nMain < 0) &&
                (!Number.isFinite(nTrailer) || nTrailer < 0)
            ) {
                toastWarn("กรุณากรอกน้ำหนักตัวรถและ/หรือพ่วงเป็นตัวเลข");
                return;
            }

            const mainDisplay =
                Number.isFinite(nMain) && nMain > 0
                    ? `${nMain.toLocaleString()} กก.`
                    : "-";
            const trailerDisplay =
                Number.isFinite(nTrailer) && nTrailer > 0
                    ? `${nTrailer.toLocaleString()} กก.`
                    : "-";

            const total =
                (Number.isFinite(nMain) && nMain > 0 ? nMain : 0) +
                (Number.isFinite(nTrailer) && nTrailer > 0 ? nTrailer : 0);

            const provinceMainLabel = getProvinceLabel(wProvinceMain);
            const provinceTrailerLabel = getProvinceLabel(wProvinceTrailer);

            const lines = [
                `คิว : ${wRow.queue_no ?? "-"}`,
                `ทะเบียน : ${wRow.truck_register || "-"}`,
                `ประเภท : ${wRow.truck_type || "-"}`,
                `จังหวัด (ตัวรถ) : ${provinceMainLabel}`,
                `จังหวัด (พ่วง) : ${provinceTrailerLabel}`,
                `ตัวรถ : ${mainDisplay}`,
                `พ่วง : ${trailerDisplay}`,
                `รวม : ${total.toLocaleString()} กก.`,
            ];

            openConfirmModal({
                title: "ยืนยันบันทึกน้ำหนักขาเข้า (ตัวรถ/พ่วง)",
                color: "indigo",
                lines,
                onConfirm: async () => {
                    try {
                        await http.post(`/bookings/${wRow.id}/weight-in`, {
                            weight_in_main_kg:
                                Number.isFinite(nMain) && nMain > 0 ? nMain : null,
                            weight_in_trailer_kg:
                                Number.isFinite(nTrailer) && nTrailer > 0
                                    ? nTrailer
                                    : null,
                            rubber_type_main: wRubberMain || null,
                            rubber_type_trailer: wRubberTrailer || null,
                            province_main:
                                provinceMainLabel === "(ไม่ระบุ)"
                                    ? null
                                    : provinceMainLabel,
                            province_trailer:
                                provinceTrailerLabel === "(ไม่ระบุ)"
                                    ? null
                                    : provinceTrailerLabel,
                        });

                        toastSuccess("บันทึกน้ำหนักขาเข้าแล้ว");
                        closeWeightModal();
                        fetchRows();
                    } catch (e) {
                        console.error("[weight-scale-in] weight-in trailer error:", e);
                        const detail =
                            e?.response?.data?.detail ||
                            e?.message ||
                            "บันทึกน้ำหนักไม่สำเร็จ";
                        toastError(detail);
                    }
                },
            });

            return;
        }

        // ----- Single mode -----
        const n = Number(String(wSingleValue || "").replace(/,/g, "").trim());
        if (!Number.isFinite(n) || n < 0) {
            toastWarn("กรุณากรอกน้ำหนักเป็นตัวเลขเท่านั้น");
            return;
        }

        const provinceSingleLabel = getProvinceLabel(wProvinceSingle);

        const lines = [
            `คิว : ${wRow.queue_no ?? "-"}`,
            `ทะเบียน : ${wRow.truck_register || "-"}`,
            `ประเภท : ${wRow.truck_type || "-"}`,
            `จังหวัด : ${provinceSingleLabel}`,
            `น้ำหนัก : ${n.toLocaleString()} กก.`,
        ];

        openConfirmModal({
            title: "ยืนยันบันทึกน้ำหนักขาเข้า",
            color: "indigo",
            lines,
            onConfirm: async () => {
                try {
                    await http.post(`/bookings/${wRow.id}/weight-in`, {
                        weight_in_kg: n,
                        rubber_type: wRubberSingle || null,
                        province:
                            provinceSingleLabel === "(ไม่ระบุ)"
                                ? null
                                : provinceSingleLabel,
                    });

                    toastSuccess("บันทึกน้ำหนักขาเข้าแล้ว");
                    closeWeightModal();
                    fetchRows();
                } catch (e) {
                    console.error("[weight-scale-in] weight-in error:", e);
                    const detail =
                        e?.response?.data?.detail ||
                        e?.message ||
                        "บันทึกน้ำหนักไม่สำเร็จ";
                    toastError(detail);
                }
            },
        });
    };

    return (
        <>
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
                            data={["10", "20", "50"]}
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
                            <Table.Th style={{ textAlign: "center" }}>
                                Start Drain
                            </Table.Th>
                            <Table.Th style={{ textAlign: "center" }}>
                                Stop Drain
                            </Table.Th>
                            <Table.Th style={{ textAlign: "center" }}>
                                Total Drain
                            </Table.Th>
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
                            rows.map((r) => {
                                const started = r.start_drain_at;
                                const stopped = r.stop_drain_at;
                                const editing = editingId === r.id;

                                const isTrailer = isTrailerTruckType(r.truck_type);

                                // total drain (live)
                                let totalSecs = 0;
                                if (r.start_drain_at) {
                                    const start = new Date(r.start_drain_at);
                                    const end = r.stop_drain_at
                                        ? new Date(r.stop_drain_at)
                                        : new Date(nowTick);
                                    const diff =
                                        (end.getTime() - start.getTime()) / 1000;
                                    totalSecs = diff > 0 ? diff : 0;
                                }

                                const slotText =
                                    r.start_time && r.end_time
                                        ? `${r.start_time} - ${r.end_time}${r.queue_no != null ? ` (${r.queue_no})` : ""
                                        }`
                                        : r.queue_no != null
                                            ? `Q${r.queue_no}`
                                            : "-";

                                const supplierText =
                                    (r.supplier_code ? `${r.supplier_code} : ` : "") +
                                    (r.supplier_name || "-");

                                const wiMain = formatKg(r.weight_in_main_kg);
                                const wiTrailer = formatKg(r.weight_in_trailer_kg);
                                const wiTotal = formatKg(r.weight_in_kg);

                                return (
                                    <Table.Tr key={r.id}>
                                        <Table.Td>{supplierText}</Table.Td>
                                        <Table.Td>{slotText}</Table.Td>
                                        <Table.Td>{r.truck_register || "-"}</Table.Td>
                                        <Table.Td>{r.truck_type || "-"}</Table.Td>

                                        {/* Start Drain */}
                                        <Table.Td
                                            style={{
                                                minWidth: 230,
                                                textAlign: "center",
                                            }}
                                        >
                                            {editing ? (
                                                <Group
                                                    gap={6}
                                                    justify="center"
                                                    align="center"
                                                    wrap="nowrap"
                                                >
                                                    <TimeInput
                                                        value={editStart[r.id] ?? ""}
                                                        onChange={(event) => {
                                                            const val =
                                                                event.currentTarget.value;
                                                            setEditStart((m) => ({
                                                                ...m,
                                                                [r.id]: val,
                                                            }));
                                                        }}
                                                        size="xs"
                                                        style={{ maxWidth: 110 }}
                                                    />
                                                    <Button
                                                        size="xs"
                                                        color="green"
                                                        onClick={() =>
                                                            handleStartConfirm(r)
                                                        }
                                                    >
                                                        Update
                                                    </Button>
                                                    <Button
                                                        size="xs"
                                                        variant="subtle"
                                                        onClick={() =>
                                                            closeStartEditor(r.id)
                                                        }
                                                    >
                                                        ✕
                                                    </Button>
                                                </Group>
                                            ) : started ? (
                                                <Text
                                                    size="sm"
                                                    fw={700}
                                                    style={{
                                                        color: "#16a34a",
                                                        cursor: "pointer",
                                                    }}
                                                    onClick={() =>
                                                        openStartEditor(r)
                                                    }
                                                    title={`คลิกเพื่อแก้ไขเวลาเริ่ม (รวมเวลา: ${fmtDuration(
                                                        totalSecs,
                                                    )})`}
                                                >
                                                    {fmtTime(started)}
                                                </Text>
                                            ) : (
                                                <Button
                                                    size="xs"
                                                    color="green"
                                                    variant="light"
                                                    onClick={() =>
                                                        openStartEditor(r)
                                                    }
                                                >
                                                    Start
                                                </Button>
                                            )}
                                        </Table.Td>

                                        {/* Stop Drain */}
                                        <Table.Td
                                            style={{
                                                minWidth: 120,
                                                textAlign: "center",
                                            }}
                                        >
                                            {!stopped ? (
                                                <Button
                                                    size="xs"
                                                    color="red"
                                                    variant="light"
                                                    onClick={() =>
                                                        handleStopDrain(r)
                                                    }
                                                    disabled={!started}
                                                >
                                                    Stop
                                                </Button>
                                            ) : (
                                                <Text
                                                    size="sm"
                                                    fw={700}
                                                    style={{ color: "#ef4444" }}
                                                >
                                                    {fmtTime(stopped)}
                                                </Text>
                                            )}
                                        </Table.Td>

                                        {/* Total Drain */}
                                        <Table.Td style={{ textAlign: "center" }}>
                                            {fmtDurationText(totalSecs)}
                                        </Table.Td>

                                        {/* Weight In */}
                                        <Table.Td>
                                            {isTrailer &&
                                                (r.weight_in_main_kg ||
                                                    r.weight_in_trailer_kg) ? (
                                                <Stack gap={2}>
                                                    <Text size="xs">
                                                        ตัวรถ: {wiMain}
                                                    </Text>
                                                    <Text size="xs">
                                                        พ่วง: {wiTrailer}
                                                    </Text>
                                                    <Group gap={6} align="center">
                                                        <Text
                                                            size="xs"
                                                            fw={700}
                                                        >
                                                            รวม: {wiTotal}
                                                        </Text>
                                                        <Button
                                                            size="xs"
                                                            variant="light"
                                                            onClick={() =>
                                                                openWeight(r)
                                                            }
                                                        >
                                                            แก้ไข
                                                        </Button>
                                                    </Group>
                                                </Stack>
                                            ) : r.weight_in_kg != null &&
                                                r.weight_in_kg !== 0 ? (
                                                <Group gap={6} align="center">
                                                    <Text size="xs" fw={700}>
                                                        {wiTotal}
                                                    </Text>
                                                    <Button
                                                        size="xs"
                                                        variant="light"
                                                        onClick={() =>
                                                            openWeight(r)
                                                        }
                                                    >
                                                        แก้ไข
                                                    </Button>
                                                </Group>
                                            ) : (
                                                <Button
                                                    size="xs"
                                                    color="orange"
                                                    variant="light"
                                                    onClick={() =>
                                                        openWeight(r)
                                                    }
                                                    disabled={!r.stop_drain_at}
                                                >
                                                    บันทึก
                                                </Button>
                                            )}
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

            {/* Weight Modal (Mantine version) */}
            <Modal
                opened={wModalOpen}
                onClose={closeWeightModal}
                title={
                    wModeTrailer
                        ? "บันทึกน้ำหนักขาเข้า (ตัวรถ / พ่วง)"
                        : "บันทึกน้ำหนักขาเข้า (กก.)"
                }
                centered
                size="lg"
            >
                {!wRow ? null : wModeTrailer ? (
                    <Stack gap="md">
                        {/* ตัวรถ */}
                        <Box>
                            <Text fw={700} size="sm">
                                ตัวรถ
                            </Text>
                            <Text size="xs" c="dimmed" mb={6}>
                                เลือกจังหวัด, ประเภทยาง และกรอกน้ำหนักตัวรถ
                            </Text>
                            <Group align="flex-start" grow gap="sm">
                                <Select
                                    label="จังหวัด (ตัวรถ)"
                                    data={provinceOptions}
                                    value={wProvinceMain || null}
                                    onChange={(val) =>
                                        setWProvinceMain(val || "")
                                    }
                                    searchable
                                    clearable
                                    size="sm"
                                />
                                <Select
                                    label="ประเภทยาง (ตัวรถ)"
                                    data={rubberOptions}
                                    value={wRubberMain || null}
                                    onChange={(val) =>
                                        setWRubberMain(val || "")
                                    }
                                    searchable
                                    clearable
                                    size="sm"
                                />
                            </Group>
                            <TextInput
                                mt="xs"
                                label="น้ำหนัก (กก.)"
                                value={wMainValue}
                                onChange={(e) =>
                                    handleMainWeightChange(e.currentTarget.value)
                                }
                                placeholder="เช่น 18,560"
                                size="sm"
                            />
                        </Box>

                        <Box
                            style={{
                                borderTop: "1px solid rgba(148,163,184,0.4)",
                                paddingTop: 10,
                            }}
                        >
                            <Text fw={700} size="sm">
                                พ่วง
                            </Text>
                            <Text size="xs" c="dimmed" mb={6}>
                                เลือกจังหวัด, ประเภทยาง และกรอกน้ำหนักพ่วง
                                (ถ้ามี)
                            </Text>
                            <Group align="flex-start" grow gap="sm">
                                <Select
                                    label="จังหวัด (พ่วง)"
                                    data={provinceOptions}
                                    value={wProvinceTrailer || null}
                                    onChange={(val) =>
                                        setWProvinceTrailer(val || "")
                                    }
                                    searchable
                                    clearable
                                    size="sm"
                                />
                                <Select
                                    label="ประเภทยาง (พ่วง)"
                                    data={rubberOptions}
                                    value={wRubberTrailer || null}
                                    onChange={(val) =>
                                        setWRubberTrailer(val || "")
                                    }
                                    searchable
                                    clearable
                                    size="sm"
                                />
                            </Group>
                            <TextInput
                                mt="xs"
                                label="น้ำหนัก (กก.)"
                                value={wTrailerValue}
                                onChange={(e) =>
                                    handleTrailerWeightChange(
                                        e.currentTarget.value,
                                    )
                                }
                                placeholder="เช่น 8,320"
                                size="sm"
                            />
                        </Box>

                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={closeWeightModal}>
                                ยกเลิก
                            </Button>
                            <Button color="indigo" onClick={saveWeight}>
                                บันทึก
                            </Button>
                        </Group>
                    </Stack>
                ) : (
                    <Stack gap="md">
                        <Box>
                            <Text fw={700} size="sm">
                                น้ำหนักเข้า (รถทั่วไป)
                            </Text>
                            <Text size="xs" c="dimmed" mb={6}>
                                เลือกจังหวัด, ประเภทยาง และกรอกน้ำหนักขาเข้า
                            </Text>
                            <Group align="flex-start" grow gap="sm">
                                <Select
                                    label="จังหวัด"
                                    data={provinceOptions}
                                    value={wProvinceSingle || null}
                                    onChange={(val) =>
                                        setWProvinceSingle(val || "")
                                    }
                                    searchable
                                    clearable
                                    size="sm"
                                />
                                <Select
                                    label="ประเภทยาง"
                                    data={rubberOptions}
                                    value={wRubberSingle || null}
                                    onChange={(val) =>
                                        setWRubberSingle(val || "")
                                    }
                                    searchable
                                    clearable
                                    size="sm"
                                />
                            </Group>
                            <TextInput
                                mt="xs"
                                label="น้ำหนัก (กก.)"
                                value={wSingleValue}
                                onChange={(e) =>
                                    handleSingleWeightChange(
                                        e.currentTarget.value,
                                    )
                                }
                                placeholder="เช่น 18,560"
                                size="sm"
                            />
                        </Box>

                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={closeWeightModal}>
                                ยกเลิก
                            </Button>
                            <Button color="indigo" onClick={saveWeight}>
                                บันทึก
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Modal>
        </>
    );
}