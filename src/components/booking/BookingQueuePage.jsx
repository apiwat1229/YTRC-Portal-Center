// src/components/booking/BookingQueuePage.jsx
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
import { DatePickerInput } from "@mantine/dates";
import {
    IconActivity,
    IconCalendar,
    IconPencil,
    IconTicket,
    IconTrash,
} from "@tabler/icons-react";

import { http } from "@/helpers/http";
import StatusFooterBar from "../common/StatusFooterBar";
import UserHeaderPanel from "../common/UserHeaderPanel";

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

    // ------- ดึงข้อมูลจาก /bookings/queues -------
    const fetchQueues = async () => {
        if (!selectedDate || !selectedSlot) return;

        try {
            setLoading(true);
            setError("");

            const dateParam = dayjs(selectedDate).format("YYYY-MM-DD");

            // BE parse_slot รองรับทั้ง "08:00-09:00" และ "08:00 - 09:00"
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

    // ------- handler เวลาเลือก slot -------
    const handleSlotClick = (value) => {
        setSelectedSlot(value);
    };

    // ------- placeholder action ปุ่มต่าง ๆ -------
    const handleEdit = (queue) => {
        // TODO: เปิด modal แก้ไขคิว
        console.log("edit queue", queue);
    };

    const handleDelete = (queue) => {
        // TODO: เปิด confirm แล้ว call DELETE /bookings/{id}
        console.log("delete queue", queue);
    };

    const handleTicket = (queue) => {
        // TODO: ไปหน้า ticket / เปิดหน้าปริ๊นบัตรคิว
        console.log("ticket for", queue);
    };

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
            <AppShell
                padding="md"
                styles={{ main: { backgroundColor: "transparent" } }}
            >
                <AppShell.Main>
                    <Container size="xl" py="md">
                        <Stack gap="xl">
                            {/* ============= HEADER (เหมือน StarterPage แต่เปลี่ยนชื่อ) ============= */}
                            <Group justify="space-between" align="center">
                                {/* Hero Title */}
                                <Group gap="md">
                                    <ThemeIcon
                                        size={48}
                                        radius="md"
                                        variant="gradient"
                                        gradient={{
                                            from: "indigo",
                                            to: "cyan",
                                            deg: 135,
                                        }}
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

                                {/* Header ขวา: เวลา + ชื่อ + ปุ่ม Back / แจ้งเตือน / Logout */}
                                <UserHeaderPanel
                                    user={user}
                                    displayName={displayName}
                                    onBackClick={onBack}
                                    onNotificationsClick={onNotificationsClick}
                                    onLogout={onLogout}
                                    notificationsCount={effectiveNotificationsCount}
                                />
                            </Group>

                            {/* ============= MAIN CONTENT (ของ Booking เดิม) ============= */}

                            {/* Top bar: Title + ปุ่ม เพิ่มการจอง */}
                            <Group justify="space-between" align="flex-end">
                                <div>
                                    <Title
                                        order={3}
                                        style={{
                                            letterSpacing: "-0.4px",
                                            marginBottom: 4,
                                        }}
                                    >
                                        Queue Overview
                                    </Title>
                                    <Text size="sm" c="dimmed">
                                        เลือกวันที่และช่วงเวลาเพื่อดูสถานะการจองคิวรถบรรทุก
                                    </Text>
                                </div>

                                <Button
                                    leftSection={<IconCalendar size={16} />}
                                    radius="xl"
                                    variant="filled"
                                    color="indigo"
                                    onClick={() => {
                                        // TODO: เปิด modal สร้าง booking ใหม่
                                        console.log("open create booking");
                                    }}
                                >
                                    + เพิ่มการจอง
                                </Button>
                            </Group>

                            {/* ================= FILTER BAR ================= */}
                            <Paper
                                shadow="xs"
                                radius="lg"
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
                                    {/* Date picker (ใช้ Mantine DatePickerInput) */}
                                    <Group gap="xs" align="center">
                                        <Text
                                            size="sm"
                                            fw={600}
                                            style={{ minWidth: 70 }}
                                        >
                                            เลือกวันที่
                                        </Text>
                                        <DatePickerInput
                                            value={selectedDate}
                                            onChange={(value) => {
                                                // value = Date | null
                                                if (value) {
                                                    setSelectedDate(value);
                                                }
                                            }}
                                            valueFormat="DD-MMM-YYYY"
                                            leftSection={
                                                <IconCalendar size={16} />
                                            }
                                            styles={{
                                                input: {
                                                    fontSize: 14,
                                                    width: 220,
                                                },
                                            }}
                                            popoverProps={{
                                                withinPortal: true,
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
                                                        selectedSlot ===
                                                            slot.value
                                                            ? "filled"
                                                            : "light"
                                                    }
                                                    color={
                                                        selectedSlot ===
                                                            slot.value
                                                            ? "indigo"
                                                            : "gray"
                                                    }
                                                    radius="xl"
                                                    onClick={() =>
                                                        handleSlotClick(
                                                            slot.value,
                                                        )
                                                    }
                                                >
                                                    {slot.label}
                                                </Button>
                                            ))}
                                        </Group>
                                    </Stack>
                                </Group>
                            </Paper>

                            {/* ================= RESULT HEADER ================= */}
                            <Group gap="xs">
                                <Text size="sm" fw={600}>
                                    รายการจอง {displayRange}
                                </Text>
                                <Badge size="sm" variant="light" color="gray">
                                    {displayDate}
                                </Badge>
                                {loading && (
                                    <Group gap={4}>
                                        <Loader size="xs" />
                                        <Text size="xs" c="dimmed">
                                            กำลังโหลด...
                                        </Text>
                                    </Group>
                                )}
                            </Group>

                            {/* ================= ERROR ================= */}
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

                            {/* ================= QUEUE CARDS ================= */}
                            {queues.length === 0 && !loading ? (
                                <Card
                                    shadow="xs"
                                    radius="lg"
                                    withBorder
                                    style={{ backgroundColor: "#ffffff" }}
                                >
                                    <Text size="sm" c="dimmed">
                                        ยังไม่มีการจองในช่วงเวลานี้
                                    </Text>
                                </Card>
                            ) : (
                                <SimpleGrid
                                    cols={{ base: 1, sm: 2, lg: 3 }}
                                    spacing="md"
                                >
                                    {queues.map((q) => (
                                        <Card
                                            key={q.id}
                                            radius="lg"
                                            withBorder
                                            shadow="xs"
                                            padding="md"
                                            style={{
                                                backgroundColor: "#ffffff",
                                            }}
                                        >
                                            <Stack gap={6}>
                                                {/* Header card */}
                                                <Group
                                                    justify="space-between"
                                                    align="flex-start"
                                                >
                                                    <Stack
                                                        gap={0}
                                                        style={{ flex: 1 }}
                                                    >
                                                        <Text
                                                            size="sm"
                                                            fw={700}
                                                            style={{
                                                                textTransform:
                                                                    "uppercase",
                                                                letterSpacing:
                                                                    "0.04em",
                                                            }}
                                                        >
                                                            Queue : {q.queue_no}
                                                        </Text>
                                                        <Text
                                                            size="xs"
                                                            c="dimmed"
                                                            fw={500}
                                                        >
                                                            Booking Code :{" "}
                                                            {
                                                                q.booking_code
                                                            }
                                                        </Text>
                                                    </Stack>

                                                    <Group gap={4}>
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="gray"
                                                            onClick={() =>
                                                                handleEdit(q)
                                                            }
                                                        >
                                                            <IconPencil
                                                                size={16}
                                                            />
                                                        </ActionIcon>
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="red"
                                                            onClick={() =>
                                                                handleDelete(q)
                                                            }
                                                        >
                                                            <IconTrash
                                                                size={16}
                                                            />
                                                        </ActionIcon>
                                                    </Group>
                                                </Group>

                                                <Stack gap={2} mt="xs">
                                                    <Text size="xs">
                                                        <b>Code :</b> {q.code}
                                                    </Text>
                                                    <Text size="xs">
                                                        <b>Name :</b> {q.name}
                                                    </Text>
                                                    <Text size="xs">
                                                        <b>Truck :</b>{" "}
                                                        {q.truck}
                                                    </Text>
                                                    <Text size="xs">
                                                        <b>Type :</b> {q.type}
                                                    </Text>
                                                    <Text size="xs">
                                                        <b>Recorder :</b>{" "}
                                                        {q.recorder}
                                                    </Text>
                                                </Stack>

                                                <Group
                                                    justify="flex-end"
                                                    mt="sm"
                                                >
                                                    <Button
                                                        size="xs"
                                                        variant="light"
                                                        leftSection={
                                                            <IconTicket
                                                                size={14}
                                                            />
                                                        }
                                                        onClick={() =>
                                                            handleTicket(q)
                                                        }
                                                    >
                                                        Ticket
                                                    </Button>
                                                </Group>
                                            </Stack>
                                        </Card>
                                    ))}
                                </SimpleGrid>
                            )}

                            {/* ================= FOOTER ================= */}
                            <StatusFooterBar
                                statusLabel="Service Online"
                                version="v0.1.0"
                                latency="21ms"
                            />
                        </Stack>
                    </Container>
                </AppShell.Main>
            </AppShell>
        </div>
    );
}