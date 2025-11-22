// src/components/truckscale/BookingCheckInTab.jsx
import {
    Box,
    Button,
    Grid,
    Group,
    Select,
    Stack,
    Text,
    Textarea,
    TextInput,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";

import { http } from "@/helpers/http";

/* ===== Helpers ===== */
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

const getUserDisplayName = (user) =>
    user?.display_name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    "";

/** ฟอร์แมตวันที่เป็น 22-Nov-2025 */
const formatDateEN = (val) => {
    if (!val) return "-";
    let d;

    if (val instanceof Date) {
        d = val;
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(String(val))) {
        // "2025-11-22"
        d = new Date(`${val}T00:00:00`);
    } else {
        d = new Date(val);
    }

    if (Number.isNaN(d.getTime())) return String(val);

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

/** ฟอร์แมต DateTime (ค่าใน DB เป็น UTC) → "22-Nov-2025 14:40" (บวก 7 ชม.) */
const formatDateTimeFriendly = (val) => {
    if (!val) return "-";
    const dUtc = new Date(val);
    if (Number.isNaN(dUtc.getTime())) return String(val);

    // บังคับ +7 ชั่วโมงจากค่าเดิม (มองว่าเป็น UTC)
    const localMs = dUtc.getTime() + 7 * 60 * 60 * 1000;
    const local = new Date(localMs);

    const hh = String(local.getHours()).padStart(2, "0");
    const mm = String(local.getMinutes()).padStart(2, "0");
    return `${formatDateEN(local)} ${hh}:${mm}`;
};

// ===== Truck type helpers (ให้ตรงกับฝั่ง Booking) =====
function isTrailerLike(text = "") {
    const s = String(text).trim();
    if (!s) return false;
    // รองรับ "10 ล้อ (พ่วง)", "10 ล้อ พ่วง", "10ล้อพ่วง"
    return /10\s*ล้อ\s*(\(\s*พ่วง\s*\)|พ่วง)/.test(s);
}

function normalizeTruckType(t) {
    const s = String(t || "").trim();
    if (!s) return "";
    if (isTrailerLike(s)) {
        // internal value ใช้แบบเดียวกับ AddBookingDrawer
        return "10 ล้อ พ่วง";
    }
    return s;
}

// truck type options (value = internal, label = ที่โชว์บนจอ)
const TRUCK_TYPE_OPTIONS = [
    { value: "กระบะ", label: "กระบะ" },
    { value: "6 ล้อ", label: "6 ล้อ" },
    { value: "10 ล้อ", label: "10 ล้อ" },
    { value: "10 ล้อ พ่วง", label: "10 ล้อ (พ่วง)" },
    { value: "เทรลเลอร์", label: "เทรลเลอร์" },
];

const getTruckLabel = (value) => {
    if (!value) return "-";
    const norm = normalizeTruckType(value);
    const found = TRUCK_TYPE_OPTIONS.find((opt) => opt.value === norm);
    return found?.label || norm || "-";
};

/** แถวแสดงรายละเอียดซ้ายชื่อ ขวาค่า */
function DetailRow({ label, value, bold = false, alignRight = false }) {
    return (
        <Box
            style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
            }}
        >
            <Text size="xs" c="dimmed">
                {label}
            </Text>
            <Text
                size="xs"
                fw={bold ? 700 : 400}
                style={{
                    flex: 1,
                    textAlign: alignRight ? "right" : "left",
                    whiteSpace: "nowrap",
                }}
            >
                {value}
            </Text>
        </Box>
    );
}

export default function BookingCheckInTab({ user }) {
    const [bookingCode, setBookingCode] = useState("");
    const [checkInTime, setCheckInTime] = useState(new Date());
    const [truckType, setTruckType] = useState(null);
    const [truckPlate, setTruckPlate] = useState("");
    const [note, setNote] = useState("");

    const [booking, setBooking] = useState(null);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [saving, setSaving] = useState(false);

    /* ====== SEARCH BOOKING BY CODE ====== */
    const handleSearch = async () => {
        const code = bookingCode.trim();
        if (!code) {
            toastError("กรุณากรอกรหัส Booking ก่อนค้นหา");
            return;
        }

        setLoadingSearch(true);
        try {
            const res = await http.get("/bookings", {
                params: {
                    booking_code: code,
                    page: 1,
                    limit: 1,
                },
            });

            const data = res?.data ?? res;
            const arr =
                (Array.isArray(data?.items) && data.items) ||
                (Array.isArray(data?.results) && data.results) ||
                (Array.isArray(data) && data) ||
                [];

            if (!arr.length) {
                setBooking(null);
                toastError("ไม่พบข้อมูล Booking ตามรหัสที่ระบุ");
                return;
            }

            const found = arr[0];
            setBooking(found);

            if (found.truck_type) {
                // ✅ normalize ก่อน set เข้า Select
                setTruckType(normalizeTruckType(found.truck_type));
            } else {
                setTruckType(null);
            }

            if (found.truck_register) {
                setTruckPlate(found.truck_register);
            } else {
                setTruckPlate("");
            }

            toastSuccess("ดึงข้อมูล Booking สำเร็จ");
        } catch (e) {
            console.error("[checkin] search error:", e);
            toastError("ค้นหา Booking ไม่สำเร็จ");
            setBooking(null);
        } finally {
            setLoadingSearch(false);
        }
    };

    // กด Enter ในช่อง booking code → ค้นหา
    const handleBookingCodeKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearch();
        }
    };

    const handleClear = () => {
        setBookingCode("");
        setBooking(null);
        setTruckType(null);
        setTruckPlate("");
        setNote("");
    };

    /* ====== SUBMIT CHECK-IN ====== */
    const handleSubmit = async () => {
        if (!booking?.id) {
            toastError("ยังไม่ได้เลือก Booking หรือไม่พบข้อมูล Booking");
            return;
        }

        // ถ้าเคย Check-in แล้ว → ไม่ให้ทำซ้ำ
        if (booking.checkin_at) {
            toastError("รายการนี้มีการ Check-in แล้ว ไม่สามารถทำซ้ำได้");
            return;
        }

        if (!checkInTime) {
            toastError("กรุณาเลือกเวลา Check-in");
            return;
        }

        // ยืนยันก่อนบันทึก
        const ok = window.confirm(
            "ยืนยันบันทึก Check-in สำหรับคันนี้ใช่หรือไม่?",
        );
        if (!ok) return;

        const checkerName = getUserDisplayName(user);
        const payload = {
            checkin_at: checkInTime.toISOString(),
        };

        if (checkerName) payload.checker = checkerName;
        if (truckType) payload.truck_type = normalizeTruckType(truckType);
        if (truckPlate) payload.truck_register = truckPlate;
        if (note.trim()) payload.note = note.trim();

        setSaving(true);
        try {
            const res = await http.post(
                `/bookings/${booking.id}/checkin`,
                payload,
            );

            const updated = res?.data ?? res;
            setBooking(updated);

            toastSuccess("บันทึก Check-in สำเร็จ");
        } catch (e) {
            console.error("[checkin] submit error:", e);
            toastError("บันทึก Check-in ไม่สำเร็จ");
        } finally {
            setSaving(false);
        }
    };

    const handleClearFormRight = () => {
        setTruckType(null);
        setTruckPlate("");
        setNote("");
    };

    const alreadyCheckedIn = !!booking?.checkin_at;

    return (
        <Grid gutter="xl">
            {/* LEFT SIDE – Booking Search */}
            <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="md">
                    <Text fw={700} size="sm">
                        รหัส Booking
                    </Text>

                    <Group align="flex-end" gap="xs">
                        <TextInput
                            placeholder="พิมพ์/สแกนรหัส (เช่น 25111401)"
                            value={bookingCode}
                            onChange={(e) => setBookingCode(e.currentTarget.value)}
                            onKeyDown={handleBookingCodeKeyDown}
                            flex={1}
                        />
                        <Button
                            leftSection={<IconSearch size={16} />}
                            radius="md"
                            onClick={handleSearch}
                            loading={loadingSearch}
                        >
                            ค้นหา
                        </Button>
                        <Button
                            variant="subtle"
                            radius="md"
                            color="gray"
                            onClick={handleClear}
                        >
                            ล้าง
                        </Button>
                    </Group>

                    <Text size="xs" c="dimmed">
                        * สแกนจาก QR/Barcode หรือกด Enter
                    </Text>

                    {/* Card รายละเอียด Booking */}
                    <Box
                        mt="lg"
                        p="md"
                        style={{
                            borderRadius: 18,
                            background: "#ffffff",
                            boxShadow: "0 14px 40px rgba(15,23,42,0.06)",
                            border: "1px solid rgba(148,163,184,0.18)",
                        }}
                    >
                        <Group justify="space-between" align="center" mb="xs">
                            <Group gap={8} align="center">
                                <Box
                                    style={{
                                        width: 3,
                                        height: 16,
                                        borderRadius: 999,
                                        background:
                                            "linear-gradient(180deg,#2563EB,#4F46E5)",
                                    }}
                                />
                                <Text fw={700} size="sm">
                                    รายละเอียด Booking
                                </Text>
                            </Group>

                            {booking?.queue_no != null && (
                                <Box
                                    px="sm"
                                    py={4}
                                    style={{
                                        borderRadius: 999,
                                        background: "#EEF2FF",
                                        color: "#3730A3",
                                        fontSize: 12,
                                        fontWeight: 700,
                                        minWidth: 42,
                                        textAlign: "center",
                                    }}
                                >
                                    Q{booking.queue_no}
                                </Box>
                            )}
                        </Group>

                        {!booking ? (
                            <Text size="xs" c="dimmed" mt="xs">
                                — ยังไม่มีข้อมูล —
                            </Text>
                        ) : (
                            <Stack gap={6} mt="xs">
                                <DetailRow
                                    label="วันที่"
                                    value={formatDateEN(booking.date)}
                                    bold
                                    alignRight
                                />
                                <DetailRow
                                    label="ช่วงเวลา"
                                    value={
                                        booking.start_time && booking.end_time
                                            ? `${booking.start_time}–${booking.end_time}`
                                            : "-"
                                    }
                                    bold
                                    alignRight
                                />
                                <DetailRow
                                    label="Booking"
                                    value={booking.booking_code || "-"}
                                    bold
                                    alignRight
                                />
                                <DetailRow
                                    label="Supplier"
                                    value={
                                        (booking.supplier_code
                                            ? `${booking.supplier_code} — `
                                            : "") + (booking.supplier_name || "-")
                                    }
                                    bold
                                    alignRight
                                />
                                <DetailRow
                                    label="Truck"
                                    value={getTruckLabel(
                                        booking.truck_type || truckType,
                                    )}
                                    bold
                                    alignRight
                                />
                                <DetailRow
                                    label="Recorder"
                                    value={
                                        booking.recorder ||
                                        getUserDisplayName(user) ||
                                        "-"
                                    }
                                    bold
                                    alignRight
                                />

                                {alreadyCheckedIn && (
                                    <Box
                                        mt="xs"
                                        p={6}
                                        style={{
                                            borderRadius: 8,
                                            background: "#ffffffff",
                                            border: "1px solid #4ADE80",
                                            fontSize: 11,
                                            textAlign: "center",
                                        }}
                                    >
                                        <Text size="xs" c="green.9">
                                            เคยทำการ Check-in แล้ว เวลา{" "}
                                            {formatDateTimeFriendly(booking.checkin_at)}{" "}
                                            (ไม่สามารถทำซ้ำได้)
                                        </Text>
                                    </Box>
                                )}
                            </Stack>
                        )}
                    </Box>
                </Stack>
            </Grid.Col>

            {/* RIGHT SIDE – Check-in Form */}
            <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="md">
                    <Group gap={8} align="center">
                        <Box
                            style={{
                                width: 3,
                                height: 16,
                                borderRadius: 999,
                                background:
                                    "linear-gradient(180deg,#2563EB,#4F46E5)",
                            }}
                        />
                        <Text fw={700} size="sm">
                            บันทึก Check-in
                        </Text>
                    </Group>

                    <Grid gutter="md">
                        {/* เวลา Check-in + ผู้บันทึก บรรทัดเดียวกัน */}
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <DateTimePicker
                                label="เวลา Check-in"
                                value={checkInTime}
                                onChange={setCheckInTime}
                                valueFormat="DD-MMM-YYYY, HH:mm"
                                size="sm"
                            />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <TextInput
                                label="ผู้บันทึก"
                                value={getUserDisplayName(user)}
                                readOnly
                                size="sm"
                            />
                        </Grid.Col>

                        <Grid.Col span={6}>
                            <Select
                                label="ประเภทตัวรถ *"
                                placeholder="เลือกประเภท"
                                data={TRUCK_TYPE_OPTIONS}
                                value={truckType}
                                onChange={(val) =>
                                    setTruckType(normalizeTruckType(val || ""))
                                }
                                allowDeselect
                                size="sm"
                            />
                        </Grid.Col>

                        <Grid.Col span={6}>
                            <TextInput
                                label="เลขทะเบียน"
                                placeholder="เช่น กทม-1234"
                                value={truckPlate}
                                onChange={(e) =>
                                    setTruckPlate(e.currentTarget.value)
                                }
                                size="sm"
                            />
                        </Grid.Col>

                        <Grid.Col span={12}>
                            <Textarea
                                label="หมายเหตุ"
                                placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                                minRows={3}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                size="sm"
                            />
                        </Grid.Col>
                    </Grid>

                    <Group justify="flex-end" mt="md">
                        <Button
                            variant="subtle"
                            color="gray"
                            onClick={handleClearFormRight}
                        >
                            ล้างฟอร์ม
                        </Button>
                        <Button
                            radius="md"
                            color="indigo"
                            onClick={handleSubmit}
                            loading={saving}
                            disabled={!booking || alreadyCheckedIn}
                        >
                            Check-in
                        </Button>
                    </Group>
                </Stack>
            </Grid.Col>
        </Grid>
    );
}