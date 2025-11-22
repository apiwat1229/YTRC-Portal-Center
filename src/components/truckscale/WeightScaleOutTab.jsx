// src/components/truckscale/WeightScaleOutTab.jsx
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
import { DateInput } from "@mantine/dates";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

import { http } from "@/helpers/http";

/* ========= Toast helpers (Mantine notifications) ========= */

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

/** ฟอร์แมตเวลา ISO → "HH:mm" */
const fmtTime = (iso) =>
    iso
        ? new Date(iso).toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
        })
        : "-";

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

/** ฟอร์แมตตัวเลขให้มี comma */
const formatNumberWithCommas = (value) => {
    const digitsOnly = String(value ?? "").replace(/\D/g, "");
    if (!digitsOnly) return "";
    return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/** เช็คว่าเป็นรถ 10 ล้อ(พ่วง) หรือไม่ — ใช้รูปแบบชื่อเดียวกับหน้า Weight In */
const isTrailerTruckType = (t = "") =>
    /10\s*ล้อ\s*\(\s*พ่วง\s*\)/i.test(String(t).trim()) ||
    /10\s*ล้อ\s*พ่วง/i.test(String(t).trim());

/** แปลง Date → "YYYY-MM-DD" */
const toISODate = (d) => {
    if (!d) return null;
    const dd = new Date(d);
    return dd.toISOString().slice(0, 10);
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

export default function WeightScaleOutTab({ user }) {
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

    /* ===== Weight Out modal state ===== */
    const [woOpen, setWoOpen] = useState(false);
    const [woRow, setWoRow] = useState(null);

    const [woModeTrailer, setWoModeTrailer] = useState(false);
    const [woSingleValue, setWoSingleValue] = useState("");
    const [woMainValue, setWoMainValue] = useState("");
    const [woTrailerValue, setWoTrailerValue] = useState("");

    /* ===== ดึงเฉพาะรายการที่:
       - checkin แล้ว
       - มี start_drain_at, stop_drain_at
       - มี weight_in_kg
       - ยังไม่มี weight_out_kg / weight_out
    ===== */
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

            const completed = items.filter((r) => {
                const hasDrain =
                    !!r.checkin_at && !!r.start_drain_at && !!r.stop_drain_at;

                const hasWeightIn =
                    r.weight_in_kg != null && r.weight_in_kg !== 0;

                const noWeightOut =
                    r.weight_out_kg == null && r.weight_out == null;

                return hasDrain && hasWeightIn && noWeightOut;
            });

            setRows(completed);
            setTotal(data?.total ?? completed.length);
        } catch (e) {
            console.error("[weight-scale-out] fetch error:", e);
            toastError("โหลดรายการ Check-OUT ไม่สำเร็จ");
            setRows([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRows();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate, page, limit, searchText]);

    // เปลี่ยนจำนวนแถว / วันที่ / text search → ย้อนกลับไปหน้า 1
    useEffect(() => {
        setPage(1);
    }, [rowsPerPage, selectedDate, searchText]);

    const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
    const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

    /* ===== Weight Out actions ===== */
    const openWeightOut = (row) => {
        const trailer = isTrailerTruckType(row.truck_type);

        setWoRow(row);
        setWoModeTrailer(trailer);

        if (trailer) {
            setWoMainValue(
                row?.weight_out_main_kg
                    ? formatNumberWithCommas(
                        String(Math.round(row.weight_out_main_kg)),
                    )
                    : "",
            );
            setWoTrailerValue(
                row?.weight_out_trailer_kg
                    ? formatNumberWithCommas(
                        String(Math.round(row.weight_out_trailer_kg)),
                    )
                    : "",
            );
            setWoSingleValue("");
        } else {
            setWoSingleValue(
                row?.weight_out_kg
                    ? formatNumberWithCommas(
                        String(Math.round(row.weight_out_kg)),
                    )
                    : "",
            );
            setWoMainValue("");
            setWoTrailerValue("");
        }

        setWoOpen(true);
    };

    const closeWeightOutModal = () => {
        setWoOpen(false);
        setWoRow(null);
        setWoModeTrailer(false);
        setWoSingleValue("");
        setWoMainValue("");
        setWoTrailerValue("");
    };

    const handleSingleWeightChange = (val) =>
        setWoSingleValue(formatNumberWithCommas(val));

    const handleMainWeightChange = (val) =>
        setWoMainValue(formatNumberWithCommas(val));

    const handleTrailerWeightChange = (val) =>
        setWoTrailerValue(formatNumberWithCommas(val));

    const saveWeightOut = () => {
        if (!woRow?.id) return;

        // ----- โหมดรถพ่วง: ตัวรถ + พ่วง -----
        if (woModeTrailer) {
            const nMain = Number(
                String(woMainValue || "").replace(/,/g, "").trim(),
            );
            const nTrailer = Number(
                String(woTrailerValue || "").replace(/,/g, "").trim(),
            );

            const hasMain = Number.isFinite(nMain) && nMain >= 0;
            const hasTrailer =
                Number.isFinite(nTrailer) && nTrailer >= 0;

            if (!hasMain && !hasTrailer) {
                toastWarn(
                    "กรุณากรอกน้ำหนักขาออกของตัวรถและ/หรือพ่วงเป็นตัวเลข",
                );
                return;
            }

            const mainDisplay =
                hasMain && nMain > 0
                    ? `${nMain.toLocaleString()} กก.`
                    : "-";
            const trailerDisplay =
                hasTrailer && nTrailer > 0
                    ? `${nTrailer.toLocaleString()} กก.`
                    : "-";
            const total =
                (hasMain && nMain > 0 ? nMain : 0) +
                (hasTrailer && nTrailer > 0 ? nTrailer : 0);

            const lines = [
                `คิว : ${woRow.queue_no ?? "-"}`,
                `ทะเบียน : ${woRow.truck_register || "-"}`,
                `ประเภท : ${woRow.truck_type || "-"}`,
                `น้ำหนักขาเข้า (รวม) : ${woRow.weight_in_kg != null
                    ? woRow.weight_in_kg.toLocaleString()
                    : "-"
                } กก.`,
                `น้ำหนักขาออก ตัวรถ : ${mainDisplay}`,
                `น้ำหนักขาออก พ่วง : ${trailerDisplay}`,
                `น้ำหนักขาออกรวม : ${total.toLocaleString()} กก.`,
            ];

            openConfirmModal({
                title: "ยืนยันบันทึกน้ำหนักขาออก (ตัวรถ / พ่วง)",
                color: "green",
                lines,
                onConfirm: async () => {
                    try {
                        const payload = {
                            weight_out_main_kg: hasMain ? nMain : null,
                            weight_out_trailer_kg: hasTrailer ? nTrailer : null,
                        };

                        await http.post(
                            `/bookings/${woRow.id}/weight-out`,
                            payload,
                        );

                        toastSuccess(
                            "บันทึกน้ำหนักขาออกแล้ว (Check-OUT) — ตัวรถ / พ่วง",
                        );
                        closeWeightOutModal();
                        fetchRows();
                    } catch (e) {
                        console.error(
                            "[weight-scale-out] weight-out trailer error:",
                            e,
                        );
                        toastError("บันทึกน้ำหนักขาออกไม่สำเร็จ");
                    }
                },
            });

            return;
        }

        // ----- โหมดธรรมดา: น้ำหนักเดียว -----
        const n = Number(
            String(woSingleValue || "").replace(/,/g, "").trim(),
        );
        if (!Number.isFinite(n) || n < 0) {
            toastWarn("กรุณากรอกน้ำหนักขาออกเป็นตัวเลขเท่านั้น");
            return;
        }

        const lines = [
            `คิว : ${woRow.queue_no ?? "-"}`,
            `ทะเบียน : ${woRow.truck_register || "-"}`,
            `ประเภท : ${woRow.truck_type || "-"}`,
            `น้ำหนักขาเข้า : ${woRow.weight_in_kg != null
                ? woRow.weight_in_kg.toLocaleString()
                : "-"
            } กก.`,
            `น้ำหนักขาออก : ${n.toLocaleString()} กก.`,
        ];

        openConfirmModal({
            title: "ยืนยันบันทึกน้ำหนักขาออก (Check-OUT)",
            color: "green",
            lines,
            onConfirm: async () => {
                try {
                    await http.post(`/bookings/${woRow.id}/weight-out`, {
                        weight_out_kg: n,
                    });

                    toastSuccess("บันทึกน้ำหนักขาออกแล้ว (Check-OUT)");
                    closeWeightOutModal();
                    fetchRows();
                } catch (e) {
                    console.error(
                        "[weight-scale-out] weight-out error:",
                        e,
                    );
                    toastError("บันทึกน้ำหนักขาออกไม่สำเร็จ");
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
                        CHECK-OUT — DRAIN MONITOR
                    </Text>
                    <Text size="xs" c="dimmed">
                        Operations / Check-OUT — Drain Monitor
                    </Text>
                </Group>

                {/* Filters */}
                <Group
                    justify="space-between"
                    align="center"
                    wrap="wrap"
                    gap="sm"
                >
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
                            onChange={(e) =>
                                setSearchText(e.currentTarget.value)
                            }
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
                            <Table.Th>Weight Out</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {loading ? (
                            <Table.Tr>
                                <Table.Td
                                    colSpan={9}
                                    style={{ textAlign: "center" }}
                                >
                                    <Text size="sm" c="dimmed">
                                        กำลังโหลดข้อมูล...
                                    </Text>
                                </Table.Td>
                            </Table.Tr>
                        ) : rows.length === 0 ? (
                            <Table.Tr>
                                <Table.Td
                                    colSpan={9}
                                    style={{ textAlign: "center" }}
                                >
                                    <Text size="sm" c="dimmed">
                                        ไม่มีรายการที่พร้อม Check-OUT
                                    </Text>
                                </Table.Td>
                            </Table.Tr>
                        ) : (
                            rows.map((r) => {
                                let totalSecs = 0;
                                if (
                                    Number.isFinite(
                                        Number(r.total_drain_secs),
                                    )
                                ) {
                                    totalSecs = Number(r.total_drain_secs);
                                } else if (
                                    r.start_drain_at &&
                                    r.stop_drain_at
                                ) {
                                    const start = new Date(r.start_drain_at);
                                    const stop = new Date(r.stop_drain_at);
                                    const diff =
                                        (stop.getTime() - start.getTime()) /
                                        1000;
                                    totalSecs = diff > 0 ? diff : 0;
                                }

                                const isTrailer =
                                    isTrailerTruckType(r.truck_type);

                                const supplierText =
                                    (r.supplier_code
                                        ? `${r.supplier_code} : `
                                        : "") + (r.supplier_name || "-");

                                const slotText =
                                    r.start_time && r.end_time
                                        ? `${r.start_time} - ${r.end_time}${r.queue_no != null
                                            ? ` (${r.queue_no})`
                                            : ""
                                        }`
                                        : r.queue_no != null
                                            ? `Q${r.queue_no}`
                                            : "-";

                                const outSingle = r.weight_out_kg;

                                return (
                                    <Table.Tr key={r.id}>
                                        <Table.Td>{supplierText}</Table.Td>
                                        <Table.Td>{slotText}</Table.Td>
                                        <Table.Td>
                                            {r.truck_register || "-"}
                                        </Table.Td>
                                        <Table.Td>
                                            {r.truck_type || "-"}
                                        </Table.Td>

                                        <Table.Td
                                            style={{ textAlign: "center" }}
                                        >
                                            {fmtTime(r.start_drain_at)}
                                        </Table.Td>
                                        <Table.Td
                                            style={{ textAlign: "center" }}
                                        >
                                            {fmtTime(r.stop_drain_at)}
                                        </Table.Td>
                                        <Table.Td
                                            style={{ textAlign: "center" }}
                                        >
                                            {fmtDurationText(totalSecs)}
                                        </Table.Td>

                                        {/* Weight In */}
                                        <Table.Td>
                                            {isTrailer &&
                                                (r.weight_in_main_kg ||
                                                    r.weight_in_trailer_kg) ? (
                                                <Stack gap={2}>
                                                    <Text size="xs">
                                                        ตัวรถ:{" "}
                                                        {r.weight_in_main_kg
                                                            ? `${formatNumberWithCommas(
                                                                String(
                                                                    Math.round(
                                                                        r.weight_in_main_kg,
                                                                    ),
                                                                ),
                                                            )} กก.`
                                                            : "-"}
                                                    </Text>
                                                    <Text size="xs">
                                                        พ่วง:{" "}
                                                        {r.weight_in_trailer_kg
                                                            ? `${formatNumberWithCommas(
                                                                String(
                                                                    Math.round(
                                                                        r.weight_in_trailer_kg,
                                                                    ),
                                                                ),
                                                            )} กก.`
                                                            : "-"}
                                                    </Text>
                                                    <Text
                                                        size="xs"
                                                        fw={700}
                                                    >
                                                        รวม:{" "}
                                                        {r.weight_in_kg
                                                            ? `${formatNumberWithCommas(
                                                                String(
                                                                    Math.round(
                                                                        r.weight_in_kg,
                                                                    ),
                                                                ),
                                                            )} กก.`
                                                            : "-"}
                                                    </Text>
                                                </Stack>
                                            ) : r.weight_in_kg != null &&
                                                r.weight_in_kg !== 0 ? (
                                                <Text size="xs" fw={700}>
                                                    {formatNumberWithCommas(
                                                        String(
                                                            Math.round(
                                                                r.weight_in_kg,
                                                            ),
                                                        ),
                                                    )}{" "}
                                                    กก.
                                                </Text>
                                            ) : (
                                                <Text size="xs">-</Text>
                                            )}
                                        </Table.Td>

                                        {/* Weight Out */}
                                        <Table.Td>
                                            {outSingle != null &&
                                                outSingle !== 0 ? (
                                                <Group gap={6} align="center">
                                                    <Text size="xs" fw={700}>
                                                        {formatNumberWithCommas(
                                                            String(
                                                                Math.round(
                                                                    outSingle,
                                                                ),
                                                            ),
                                                        )}{" "}
                                                        กก.
                                                    </Text>
                                                    <Button
                                                        size="xs"
                                                        variant="light"
                                                        onClick={() =>
                                                            openWeightOut(r)
                                                        }
                                                    >
                                                        แก้ไข
                                                    </Button>
                                                </Group>
                                            ) : (
                                                <Button
                                                    size="xs"
                                                    color="indigo"
                                                    variant="light"
                                                    onClick={() =>
                                                        openWeightOut(r)
                                                    }
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

            {/* Weight Out Modal (Mantine) */}
            <Modal
                opened={woOpen}
                onClose={closeWeightOutModal}
                title={
                    woModeTrailer
                        ? "บันทึกน้ำหนักขาออก (ตัวรถ / พ่วง)"
                        : "บันทึกน้ำหนักขาออก (กก.)"
                }
                centered
                size="sm"
            >
                {!woRow ? null : woModeTrailer ? (
                    <Stack gap="md">
                        <Box>
                            <Text fw={700} size="sm" mb={4}>
                                ตัวรถ (ขาออก)
                            </Text>
                            <TextInput
                                type="text"
                                inputMode="numeric"
                                value={woMainValue}
                                onChange={(e) =>
                                    handleMainWeightChange(
                                        e.currentTarget.value,
                                    )
                                }
                                placeholder="เช่น 18,560"
                                size="sm"
                            />
                        </Box>
                        <Box>
                            <Text fw={700} size="sm" mb={4}>
                                พ่วง (ขาออก)
                            </Text>
                            <TextInput
                                type="text"
                                inputMode="numeric"
                                value={woTrailerValue}
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
                            <Button
                                variant="default"
                                onClick={closeWeightOutModal}
                            >
                                ยกเลิก
                            </Button>
                            <Button color="indigo" onClick={saveWeightOut}>
                                บันทึก
                            </Button>
                        </Group>
                    </Stack>
                ) : (
                    <Stack gap="md">
                        <Box>
                            <Text fw={700} size="sm" mb={4}>
                                น้ำหนักขาออก
                            </Text>
                            <TextInput
                                type="text"
                                inputMode="numeric"
                                value={woSingleValue}
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
                            <Button
                                variant="default"
                                onClick={closeWeightOutModal}
                            >
                                ยกเลิก
                            </Button>
                            <Button color="indigo" onClick={saveWeightOut}>
                                บันทึก
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Modal>
        </>
    );
}