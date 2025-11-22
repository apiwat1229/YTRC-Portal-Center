// src/components/booking/BookingQueuePage.jsx
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

import {
    ActionIcon,
    AppShell,
    Badge,
    Button,
    Card,
    Container,
    Group,
    Loader,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { modals } from "@mantine/modals";
import {
    IconActivity,
    IconCalendar,
    IconPencil,
    IconTicket,
    IconTrash,
} from "@tabler/icons-react";

import { http } from "@/helpers/http";
import { IconCheck, IconTrashX } from "@tabler/icons-react";
import UserHeaderPanel from "../common/UserHeaderPanel";
import AddBookingDrawer from "./AddBookingDrawer";
import BookingTicketModal from "./BookingTicketModal";

// ===== config slot เวลาให้เหมือน BE =====
const SLOT_OPTIONS = [
    { label: "08:00 - 09:00", value: "08:00-09:00" },
    { label: "09:00 - 10:00", value: "09:00-10:00" },
    { label: "10:00 - 11:00", value: "10:00-11:00" },
    { label: "11:00 - 12:00", value: "11:00-12:00" },
    { label: "13:00 - 14:00", value: "13:00-14:00" },
    { label: "14:00 - 15:00", value: "14:00-15:00" },
];

function formatSlotLabel(value) {
    const found = SLOT_OPTIONS.find((s) => s.value === value);
    return found ? found.label : value;
}

/**
 * กติกาคิวต่อวัน:
 * - 08:00-09:00  → Queue 1-4   (max 4)
 * - 09:00-10:00  → Queue 5-8   (max 4)
 * - 10:00-11:00  → Queue 9-12  (max 4)
 * - 11:00-12:00  → Queue 13-16 (max 4)
 * - 13:00-14:00  → Queue 17-20 (max 4)
 * - 14:00-15:00  → Queue 21+   (ไม่จำกัด)
 */
const SLOT_QUEUE_CONFIG = {
    "08:00-09:00": { start: 1, limit: 4 },
    "09:00-10:00": { start: 5, limit: 4 },
    "10:00-11:00": { start: 9, limit: 4 },
    "11:00-12:00": { start: 13, limit: 4 },
    "13:00-14:00": { start: 17, limit: 4 },
    "14:00-15:00": { start: 21, limit: null }, // null = ไม่จำกัด
};

function getSlotConfig(slotValue) {
    return SLOT_QUEUE_CONFIG[slotValue] ?? { start: 1, limit: null };
}

// ===== helper =====

// หาค่า id ของ booking จาก object ที่ BE ส่งมา (รองรับหลายชื่อ)
function getQueueId(q) {
    return q?.id || q?._id || q?.booking_id || null;
}

// แปลง date จาก queue → Date object (สำหรับส่งเข้า Drawer)
function parseQueueDate(dateField) {
    if (!dateField) return new Date();
    if (dateField instanceof Date) return dateField;

    if (typeof dateField === "object" && "$date" in dateField) {
        const raw = dateField.$date;
        if (typeof raw === "string") return new Date(raw);
        return new Date(raw);
    }

    if (typeof dateField === "string") {
        const iso = dateField.includes("T")
            ? dateField
            : `${dateField}T00:00:00`;
        return new Date(iso);
    }

    return new Date();
}

/** helper: เช็คว่า string ไหน “ดูเหมือน” 10 ล้อพ่วง */
function isTrailerLike(text = "") {
    const s = String(text).trim();
    if (!s) return false;
    // รองรับ 10 ล้อ พ่วง / 10ล้อพ่วง / 10 ล้อ (พ่วง)
    return /10\s*ล้อ\s*(\(\s*พ่วง\s*\)|พ่วง)/.test(s);
}

/** normalize truck type ให้ใช้ค่าภายในระบบเดียวกัน */
function normalizeTruckType(t) {
    const s = String(t || "").trim();
    if (!s) return "";
    if (isTrailerLike(s)) {
        // ค่า value ที่เราตั้งใน <Select> (AddBookingDrawer) คือ "10 ล้อ พ่วง"
        return "10 ล้อ พ่วง";
    }
    return s;
}

// type ที่เรารองรับ (เอาไว้ใช้ split string ที่มาจาก field truck ตัวเดียว เช่น "6 ล้อ 123456")
const KNOWN_TRUCK_TYPES = ["6 ล้อ", "10 ล้อ", "เทรลเลอร์"];

// แยก truck_type + license_plate จาก queue object
function extractTruckFields(q) {
    // เริ่มจาก field ปกติที่ BE ส่งมา
    let truck_type = normalizeTruckType(q?.truck_type || "");
    let license_plate = q?.truck_register || q?.license_plate || "";

    const rawTruck = (q?.truck || "").toString().trim();
    let plateFromRaw = "";

    // ถ้ายังไม่มี truck_type แต่มีข้อความรวมอยู่ใน truck ให้ลอง split
    if (!truck_type && rawTruck) {
        // กรณีเป็น 10 ล้อพ่วง (มีหรือไม่มีวงเล็บ)
        if (isTrailerLike(rawTruck)) {
            truck_type = "10 ล้อ พ่วง";
            plateFromRaw = rawTruck.replace(
                /10\s*ล้อ\s*(\(\s*พ่วง\s*\)|พ่วง)/,
                "",
            ).trim();
        } else {
            const matchedType = KNOWN_TRUCK_TYPES.find((t) =>
                rawTruck.startsWith(t),
            );
            if (matchedType) {
                truck_type = normalizeTruckType(matchedType);
                plateFromRaw = rawTruck.slice(matchedType.length).trim();
            }
        }
    }

    if (!license_plate && plateFromRaw) {
        license_plate = plateFromRaw;
    }

    return {
        truck_type: normalizeTruckType(truck_type),
        license_plate,
    };
}

export default function BookingQueuePage({
    auth,
    onLogout,
    onBack,
    onNotificationsClick,
    notificationsCount = 0,
}) {
    const { user } = auth || {};

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState(SLOT_OPTIONS[0].value);

    const [queues, setQueues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Drawer state
    const [drawerOpened, setDrawerOpened] = useState(false);
    const [drawerDefaults, setDrawerDefaults] = useState(null);

    // ลบอยู่ตัวไหน
    const [deletingId, setDeletingId] = useState(null);

    // Ticket modal
    const [ticketQueue, setTicketQueue] = useState(null);

    // ===== ชื่อใน header ขวาบน =====
    const displayName = useMemo(() => {
        if (!user) return "";
        return (
            user.display_name ||
            [user.first_name, user.last_name].filter(Boolean).join(" ") ||
            user.username ||
            user.email
        );
    }, [user]);

    const displayDate = useMemo(
        () => dayjs(selectedDate).format("DD MMM YYYY (dddd)"),
        [selectedDate],
    );

    const displayRange = useMemo(
        () => formatSlotLabel(selectedSlot),
        [selectedSlot],
    );

    const effectiveNotificationsCount = notificationsCount;


    // ===== คำนวณคิวตาม slot & จำนวนคิวใน slot ปัจจุบัน =====
    const slotConfig = useMemo(
        () => getSlotConfig(selectedSlot),
        [selectedSlot],
    );

    const isSlotFull = useMemo(() => {
        if (!slotConfig.limit) return false;
        return queues.length >= slotConfig.limit;
    }, [slotConfig, queues]);

    // หาคิวถัดไป: ถ้ามีเลขหายไปให้ใช้เลขที่หาย
    const nextQueueNo = useMemo(() => {
        const used = queues
            .map((q) => Number(q.queue_no))
            .filter((n) => !Number.isNaN(n))
            .sort((a, b) => a - b);

        let candidate = slotConfig.start;
        while (true) {
            if (
                !slotConfig.limit ||
                candidate < slotConfig.start + slotConfig.limit
            ) {
                if (!used.includes(candidate)) {
                    return candidate;
                }
                candidate += 1;
            } else {
                return slotConfig.start + used.length;
            }
        }
    }, [slotConfig, queues]);

    const slotQueueRangeLabel = useMemo(() => {
        if (!slotConfig.limit) {
            return `Queue ${slotConfig.start} ขึ้นไป (ไม่จำกัดคิว)`;
        }
        const end = slotConfig.start + slotConfig.limit - 1;
        return `Queue ${slotConfig.start} - ${end}`;
    }, [slotConfig]);

    // ------- ดึงข้อมูลจาก /bookings/queues -------
    const fetchQueues = async () => {
        if (!selectedDate || !selectedSlot) return;

        try {
            setLoading(true);
            setError("");

            const dateParam = dayjs(selectedDate).format("YYYY-MM-DD");

            const resp = await http.get("/bookings/queues", {
                params: {
                    date: dateParam,
                    slot: selectedSlot,
                },
            });

            setQueues(resp.data || []);
        } catch (err) {
            console.error("[BookingQueuePage] fetch error:", err);
            setError("ไม่สามารถโหลดข้อมูลคิวได้");
            setQueues([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueues();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate, selectedSlot]);

    const handleSlotClick = (value) => {
        setSelectedSlot(value);
    };

    // ------- เปิด Drawer สำหรับสร้าง Booking ใหม่ -------
    const handleOpenCreateBooking = () => {
        if (isSlotFull) {
            alert("ช่วงเวลานี้เต็มแล้ว (สูงสุด 4 คิวต่อช่วงเวลา)");
            return;
        }

        const [startTime, endTime] = selectedSlot.split("-");

        setDrawerDefaults({
            mode: "create",
            date: selectedDate,
            start_time: startTime,
            end_time: endTime,
            queue_no: nextQueueNo,
            recorder: displayName || "",
        });
        setDrawerOpened(true);
    };

    // ------- เปิด Drawer สำหรับแก้ไข -------
    const handleEdit = (queue) => {
        if (!queue) return;

        const [startTime, endTime] =
            (queue.slot || selectedSlot || "").split("-").length === 2
                ? (queue.slot || selectedSlot).split("-")
                : [queue.start_time, queue.end_time];

        // ใช้ helper แยก Truck Type + License Plate ออกจากค่าเก่า
        const { truck_type, license_plate } = extractTruckFields(queue);

        setDrawerDefaults({
            mode: "edit",
            id: getQueueId(queue),
            date: parseQueueDate(queue.date),
            start_time: startTime || "",
            end_time: endTime || "",
            supplier_code: queue.supplier_code || queue.code || "",
            supplier_name: queue.supplier_name || queue.name || "",
            truck_type, // *** ถูก normalize แล้ว → "10 ล้อ พ่วง"
            truck_register: license_plate || "",
            rubber_type: queue.rubber_type || queue.type || "",
            booking_code: queue.booking_code || "",
            queue_no: queue.queue_no,
            recorder: queue.recorder || displayName || "",
            note: queue.note || "",
        });
        setDrawerOpened(true);
    };

    // ===== ฟังก์ชันลบจริง ๆ (ยิง API) =====
    const deleteQueue = async (queue) => {
        const id = getQueueId(queue);
        if (!id) {
            console.warn("[BookingQueuePage] delete: no id found", queue);

            notifications.show({
                title: "ไม่พบข้อมูลคิว",
                message: "ไม่พบ ID ของคิว ไม่สามารถลบได้",
                color: "red",
                icon: <IconTrashX size={18} />,
            });

            return;
        }

        try {
            setDeletingId(id);
            await http.delete(`/bookings/${id}`);
            await fetchQueues();

            notifications.show({
                title: "ลบคิวสำเร็จ",
                message: `ลบคิวหมายเลข ${queue.queue_no ?? "-"} เรียบร้อยแล้ว`,
                color: "teal",
                icon: <IconCheck size={18} />,
            });
        } catch (err) {
            console.error("[BookingQueuePage] delete error:", err);

            const backendMsg =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                err?.message ||
                "ลบคิวไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";

            notifications.show({
                title: "ลบคิวไม่สำเร็จ",
                message: String(backendMsg),
                color: "red",
                icon: <IconTrashX size={18} />,
            });
        } finally {
            setDeletingId(null);
        }
    };

    const handleDelete = (queue) => {
        const id = getQueueId(queue);
        if (!id) {
            alert("ไม่พบ ID ของคิว ไม่สามารถลบได้");
            return;
        }

        modals.openConfirmModal({
            title: "ยืนยันการลบคิว",
            children: (
                <Text size="sm">
                    คุณต้องการลบคิวหมายเลข{" "}
                    <b>{queue.queue_no ?? "-"}</b> ของ{" "}
                    <b>{queue.name ?? queue.supplier_name ?? "ไม่ทราบชื่อ"}</b>{" "}
                    ใช่หรือไม่?
                </Text>
            ),
            labels: { confirm: "ลบคิว", cancel: "ยกเลิก" },
            confirmProps: { color: "red" },
            centered: true,
            onConfirm: () => {
                deleteQueue(queue);
            },
        });
    };

    // ===== Ticket Modal =====
    const handleTicket = (queue) => {
        if (!queue) return;

        const [defaultStart, defaultEnd] =
            (queue.slot || selectedSlot || "").split("-").length === 2
                ? (queue.slot || selectedSlot).split("-")
                : [queue.start_time, queue.end_time];

        const dateStr = dayjs(queue.date || selectedDate).format("YYYY-MM-DD");

        const queueWithContext = {
            ...queue,
            date: dateStr,
            start_time: queue.start_time || defaultStart,
            end_time: queue.end_time || defaultEnd,
        };

        setTicketQueue(queueWithContext);
    };

    const closeTicketModal = () => setTicketQueue(null);

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f3f4f6",
                backgroundImage:
                    "radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.1) 0px, transparent 50%)",
                fontFamily: "'Outfit', system-ui, sans-serif",
            }}
        >
            <AppShell padding="md" styles={{ main: { backgroundColor: "transparent" } }}>
                <AppShell.Main>
                    <Container size="xl" py="md">
                        <Stack gap="xl">
                            {/* HEADER */}
                            <Group justify="space-between" align="center">
                                <Group gap="md">
                                    <ThemeIcon
                                        size={48}
                                        radius="md"
                                        variant="gradient"
                                        gradient={{ from: "indigo", to: "cyan", deg: 135 }}
                                    >
                                        <IconActivity size={28} />
                                    </ThemeIcon>
                                    <div>
                                        <Text
                                            size="xl"
                                            fw={800}
                                            style={{
                                                letterSpacing: "-0.5px",
                                                lineHeight: 1.1,
                                                color: "#1e293b",
                                            }}
                                        >
                                            BOOKING QUEUE
                                        </Text>
                                        <Text
                                            size="xs"
                                            fw={500}
                                            c="dimmed"
                                            tt="uppercase"
                                            style={{ letterSpacing: "1px" }}
                                        >
                                            Truck Slot Booking & Schedule
                                        </Text>
                                    </div>
                                </Group>

                                <UserHeaderPanel
                                    user={user}
                                    displayName={displayName}
                                    onBackClick={onBack} 
                                    onNotificationsClick={onNotificationsClick}
                                    onLogout={onLogout}
                                    notificationsCount={effectiveNotificationsCount}
                                />
                            </Group>

                            {/* MAIN TITLE + BUTTON */}
                            <Group justify="space-between" align="flex-end">
                                <div>
                                    <Title
                                        order={3}
                                        style={{ letterSpacing: "-0.4px", marginBottom: 4 }}
                                    >
                                        Queue Overview
                                    </Title>
                                    <Text size="sm">
                                        เลือกวันที่และช่วงเวลาเพื่อดูสถานะการจองคิวรถบรรทุก
                                    </Text>
                                    <Text size="xs" mt={4}>
                                        {displayRange} • {slotQueueRangeLabel}
                                    </Text>
                                </div>

                                <Button
                                    leftSection={<IconCalendar size={16} />}
                                    radius="md"
                                    variant="filled"
                                    color={isSlotFull ? "gray" : "indigo"}
                                    onClick={handleOpenCreateBooking}
                                    disabled={isSlotFull}
                                >
                                    {isSlotFull ? "ช่วงเวลานี้เต็มแล้ว" : "+ เพิ่มการจอง"}
                                </Button>
                            </Group>

                            {/* FILTER BAR */}
                            <Paper
                                shadow="xs"
                                radius="md"
                                p="md"
                                withBorder
                                style={{ backgroundColor: "#ffffff" }}
                            >
                                <Group
                                    justify="space-between"
                                    align="center"
                                    wrap="wrap"
                                    gap="md"
                                >
                                    {/* Date picker */}
                                    <Group gap="xs" align="center">
                                        <Text size="sm" fw={600} style={{ minWidth: 70 }}>
                                            เลือกวันที่
                                        </Text>
                                        <DateInput
                                            value={selectedDate}
                                            onChange={(value) => value && setSelectedDate(value)}
                                            valueFormat="DD-MMM-YYYY"
                                            leftSection={<IconCalendar size={16} />}
                                            styles={{
                                                input: {
                                                    fontSize: 14,
                                                    width: 220,
                                                },
                                            }}
                                        />
                                    </Group>

                                    {/* Slot buttons */}
                                    <Stack gap={4} style={{ flex: 1 }}>
                                        <Text size="sm" fw={600}>
                                            ช่วงเวลา
                                        </Text>
                                        <Group gap={4} wrap="wrap">
                                            {SLOT_OPTIONS.map((slot) => (
                                                <Button
                                                    key={slot.value}
                                                    size="xs"
                                                    variant={
                                                        selectedSlot === slot.value ? "filled" : "light"
                                                    }
                                                    color={
                                                        selectedSlot === slot.value ? "indigo" : "gray"
                                                    }
                                                    radius="md"
                                                    onClick={() => handleSlotClick(slot.value)}
                                                >
                                                    {slot.label}
                                                </Button>
                                            ))}
                                        </Group>
                                    </Stack>
                                </Group>
                            </Paper>

                            {/* RESULT HEADER */}
                            <Group gap="xs">
                                <Text size="sm" fw={600}>
                                    รายการจอง {displayRange}
                                </Text>
                                <Badge size="sm" variant="light" color="gray">
                                    {displayDate}
                                </Badge>
                                <Badge size="sm" variant="light" color="blue">
                                    คิวปัจจุบันในช่วงนี้: {queues.length}
                                </Badge>
                                {!slotConfig.limit ? (
                                    <Badge size="sm" variant="light" color="teal">
                                        ไม่จำกัดคิว
                                    </Badge>
                                ) : (
                                    <Badge size="sm" variant="light" color="violet">
                                        สูงสุด {slotConfig.limit} คิว
                                    </Badge>
                                )}
                                {loading && (
                                    <Group gap={4}>
                                        <Loader size="xs" />
                                        <Text size="xs" c="dimmed">
                                            กำลังโหลด...
                                        </Text>
                                    </Group>
                                )}
                            </Group>

                            {/* ERROR */}
                            {error && (
                                <Paper
                                    p="sm"
                                    radius="md"
                                    style={{
                                        border: "1px solid #fecaca",
                                        backgroundColor: "#fef2f2",
                                    }}
                                >
                                    <Text size="sm" c="red">
                                        {error}
                                    </Text>
                                </Paper>
                            )}

                            {/* QUEUE CARDS */}
                            {queues.length === 0 && !loading ? (
                                <Card
                                    shadow="xs"
                                    radius="md"
                                    withBorder
                                    style={{ backgroundColor: "#ffffff" }}
                                >
                                    <Text size="sm" c="dimmed">
                                        ยังไม่มีการจองในช่วงเวลานี้
                                    </Text>
                                </Card>
                            ) : (
                                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                                    {queues.map((q) => {
                                        const id = getQueueId(q);
                                        const isDeleting = deletingId === id;
                                        const { truck_type, license_plate } =
                                            extractTruckFields(q);

                                        return (
                                            <Card
                                                key={id || q.id || q.booking_code}
                                                radius="md"
                                                withBorder
                                                shadow="xs"
                                                padding="md"
                                                style={{ backgroundColor: "#ffffff" }}
                                            >
                                                <Stack gap={6}>
                                                    {/* Header: Queue + edit/delete */}
                                                    <Group
                                                        justify="space-between"
                                                        align="flex-start"
                                                    >
                                                        <Stack gap={0} style={{ flex: 1 }}>
                                                            <Text
                                                                size="sm"
                                                                fw={700}
                                                                style={{
                                                                    textTransform: "uppercase",
                                                                    letterSpacing: "0.04em",
                                                                }}
                                                            >
                                                                Queue : {q.queue_no}
                                                            </Text>
                                                        </Stack>

                                                        <Group gap={4}>
                                                            <ActionIcon
                                                                variant="subtle"
                                                                color="gray"
                                                                onClick={() => handleEdit(q)}
                                                                disabled={isDeleting}
                                                            >
                                                                <IconPencil size={16} />
                                                            </ActionIcon>
                                                            <ActionIcon
                                                                variant="subtle"
                                                                color="red"
                                                                onClick={() => handleDelete(q)}
                                                                disabled={isDeleting}
                                                            >
                                                                {isDeleting ? (
                                                                    <Loader size="xs" />
                                                                ) : (
                                                                    <IconTrash size={16} />
                                                                )}
                                                            </ActionIcon>
                                                        </Group>
                                                    </Group>

                                                    {/* Details */}
                                                    <Stack gap={2} mt="xs">
                                                        <Text size="xs">
                                                            <b>Code :</b>{" "}
                                                            {q.supplier_code || q.code}
                                                        </Text>
                                                        <Text size="xs">
                                                            <b>Name :</b>{" "}
                                                            {q.supplier_name || q.name}
                                                        </Text>
                                                        <Text size="xs">
                                                            <b>Truck :</b>{" "}
                                                            {[truck_type, license_plate]
                                                                .filter(Boolean)
                                                                .join(" ") || "-"}
                                                        </Text>
                                                        <Text size="xs">
                                                            <b>Type :</b>{" "}
                                                            {q.rubber_type || q.type}
                                                        </Text>
                                                        <Text size="xs">
                                                            <b>Recorder :</b> {q.recorder}
                                                        </Text>
                                                    </Stack>

                                                    {/* Booking Code + Ticket button */}
                                                    <Group
                                                        justify="space-between"
                                                        align="center"
                                                        mt="sm"
                                                    >
                                                        <Text size="xs" c="dimmed" fw={500}>
                                                            Booking Code : {q.booking_code}
                                                        </Text>

                                                        <Button
                                                            size="xs"
                                                            variant="light"
                                                            leftSection={<IconTicket size={14} />}
                                                            onClick={() => handleTicket(q)}
                                                            disabled={isDeleting}
                                                        >
                                                            Ticket
                                                        </Button>
                                                    </Group>
                                                </Stack>
                                            </Card>
                                        );
                                    })}
                                </SimpleGrid>
                            )}

                        </Stack>
                    </Container>
                </AppShell.Main>
            </AppShell>

            {/* Drawer สำหรับ Add / Edit Booking */}
            <AddBookingDrawer
                opened={drawerOpened}
                onClose={() => setDrawerOpened(false)}
                defaults={drawerDefaults}
                onSuccess={async () => {
                    setDrawerOpened(false);
                    await fetchQueues();
                }}
            />

            {/* Ticket Modal ตัวเดียว */}
            <BookingTicketModal
                opened={!!ticketQueue}
                booking={ticketQueue}
                onClose={closeTicketModal}
            />
        </div>
    );
}