// src/components/booking/BookingTicketModal.jsx
import {
    ActionIcon,
    Button,
    CopyButton,
    Group,
    Modal,
    Stack,
    Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconCopy, IconDownload, IconX } from "@tabler/icons-react";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";
import { useMemo, useRef } from "react";

// เปลี่ยน Path ตามที่ใช้งานจริง
import logoDark from "../../assets/logo-dark.png";

/* ===== Utils ===== */

function resolveDateInput(dateField) {
    if (!dateField) return null;
    if (dateField instanceof Date) {
        return dateField.toISOString().slice(0, 10);
    }
    if (typeof dateField === "string") {
        if (dateField.includes("T")) {
            return dateField.split("T")[0];
        }
        return dateField;
    }
    if (typeof dateField === "object" && "$date" in dateField) {
        const v = dateField.$date;
        if (typeof v === "string" && v.includes("T")) {
            return v.split("T")[0];
        }
        return v;
    }
    return null;
}

function thaiDateWithWeekday(dateField) {
    const iso = resolveDateInput(dateField);
    if (!iso) return "-";

    const d = new Date(iso + "T00:00:00");
    if (Number.isNaN(d.getTime())) return String(iso);

    const weekday = d.toLocaleDateString("th-TH", { weekday: "long" });
    const ddmmy = d.toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
    return `( ${weekday} ) ${ddmmy}`;
}

// ชุดสี (Pastel Card Style)
const DAY_COLORS = [
    { cardBg: "#fde2e2", border: "#d46b6b", queueBg: "#e11d48" }, // Sun
    { cardBg: "#fff7cc", border: "#d1b208", queueBg: "#eab308" }, // Mon
    { cardBg: "#ffd8e8", border: "#e26c9a", queueBg: "#ec4899" }, // Tue
    { cardBg: "#dff5df", border: "#63a463", queueBg: "#22c55e" }, // Wed
    { cardBg: "#ffe4cc", border: "#d58a4a", queueBg: "#f97316" }, // Thu
    { cardBg: "#dbeeff", border: "#5e97c2", queueBg: "#38bdf8" }, // Fri
    { cardBg: "#eadbff", border: "#8b6abf", queueBg: "#a855f7" }, // Sat
];

// Rubber Type Code → Display Name
const RUBBER_TYPE_MAP = {
    EUDR_CL: "EUDR CL",
    EUDR_NCL: "EUDR North-East CL",
    EUDR_USS: "EUDR USS",
    FSC_CL: "FSC CL",
    FSC_USS: "FSC USS",
    North_East_CL: "North East CL",
    Regular_CL: "Regular CL",
    Regular_USS: "Regular USS",
};

export default function BookingTicketModal({ opened, onClose, booking }) {
    const ticketRef = useRef(null);

    // ขนาดต่าง ๆ
    const sizeCfg = useMemo(
        () => ({ width: 360, label: 13, value: 13, title: 18, queue: 56 }),
        [],
    );
    const labelStyle = {
        fontSize: sizeCfg.label,
        fontWeight: 600,
        color: "#1e293b",
    };
    const valueStyle = {
        fontSize: sizeCfg.value,
        fontWeight: 500,
        color: "#0f172a",
        textAlign: "right",
        flex: 1,
    };

    // theme ตามวัน
    const theme = useMemo(() => {
        const iso =
            resolveDateInput(booking?.date) ||
            new Date().toISOString().slice(0, 10);
        const d = new Date(iso + "T00:00:00");
        return DAY_COLORS[d.getDay()] || DAY_COLORS[0];
    }, [booking?.date]);

    const truckPreview =
        [booking?.truck_type, booking?.truck_register]
            .filter(Boolean)
            .join(" ")
            .trim() || booking?.truck || "-";

    const hasBookingCode = !!booking?.booking_code;

    // ใช้ map แปลง rubber_type code → display name
    const rubberTypeName = useMemo(() => {
        const code =
            booking?.rubber_type ||
            booking?.rubber_type_code ||
            booking?.type;
        const byMap = code ? RUBBER_TYPE_MAP[code] : null;

        return byMap || booking?.rubber_type_name || code || "-";
    }, [
        booking?.rubber_type,
        booking?.rubber_type_name,
        booking?.rubber_type_code,
        booking?.type,
    ]);

    /* ===== Actions (ใช้ Mantine notifications) ===== */

    const handleSaveTicketImage = async () => {
        if (!ticketRef.current) return;
        try {
            const canvas = await html2canvas(ticketRef.current, {
                backgroundColor: null,
                scale: 3,
                useCORS: true,
            });
            const link = document.createElement("a");
            link.download = `ticket_${booking?.booking_code || "booking"}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();

            notifications.show({
                title: "บันทึกรูปภาพสำเร็จ",
                message: "บันทึก Ticket เป็นรูปภาพเรียบร้อยแล้ว",
                color: "teal",
                icon: <IconCheck size={18} />,
            });
        } catch (err) {
            console.error("Save error:", err);
            notifications.show({
                title: "บันทึกไม่สำเร็จ",
                message: "ไม่สามารถบันทึก Ticket เป็นรูปภาพได้",
                color: "red",
            });
        }
    };

    const handleCopyTicketImage = async () => {
        if (!ticketRef.current) return;
        try {
            const canvas = await html2canvas(ticketRef.current, {
                backgroundColor: null,
                scale: 3,
                useCORS: true,
            });
            canvas.toBlob(async (blob) => {
                if (!blob) return;
                const item = new ClipboardItem({ [blob.type]: blob });
                await navigator.clipboard.write([item]);

                notifications.show({
                    title: "คัดลอก Ticket แล้ว",
                    message: "คัดลอกรูปภาพ Ticket ไปยัง Clipboard สำเร็จ",
                    color: "teal",
                    icon: <IconCheck size={18} />,
                });
            }, "image/png");
        } catch (err) {
            console.error("Copy error:", err);
            notifications.show({
                title: "คัดลอกไม่สำเร็จ",
                message: "ไม่สามารถคัดลอกรูปภาพ Ticket ได้",
                color: "red",
            });
        }
    };

    if (!booking) return null;

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            centered
            withCloseButton={false}
            padding={0}
            radius="lg"
            size="auto"
            overlayProps={{ backgroundOpacity: 0.4, blur: 3 }}
            styles={{
                body: {
                    backgroundColor: "transparent",
                    boxShadow: "none",
                    overflow: "visible", // กัน scroll
                },
                content: {
                    backgroundColor: "transparent",
                    boxShadow: "none",
                    overflow: "visible",
                },
            }}
        >
            <Stack
                align="center"
                gap="sm"
                style={{
                    overflow: "visible",
                }}
            >
                {/* === AREA TO CAPTURE === */}
                <div
                    style={{
                        position: "relative",
                        filter:
                            "drop-shadow(0 10px 15px rgb(0 0 0 / 0.15))",
                        overflow: "visible",
                    }}
                >
                    {/* Ticket Card */}
                    <div
                        ref={ticketRef}
                        style={{
                            background: theme.cardBg,
                            border: `2px solid ${theme.border}`,
                            width: sizeCfg.width,
                            padding: "16px",
                            borderRadius: "12px",
                            margin: "0 auto",
                            fontFamily:
                                "'Sarabun', 'Kanit', sans-serif",
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "16px",
                            }}
                        >
                            <img
                                src={logoDark}
                                alt="logo"
                                style={{ height: "22px" }}
                            />
                            <Text
                                style={{
                                    fontSize: sizeCfg.title,
                                    fontWeight: "bold",
                                    color: "#1e293b",
                                }}
                            >
                                บัตรคิว CL
                            </Text>
                        </div>

                        {/* Details List */}
                        <Stack gap={8}>
                            {[
                                [
                                    "Code:",
                                    booking?.supplier_code ||
                                    booking?.code ||
                                    "-",
                                ],
                                [
                                    "Name:",
                                    booking?.supplier_name ||
                                    booking?.name ||
                                    "-",
                                ],
                                ["Date:", thaiDateWithWeekday(booking?.date)],
                                [
                                    "Time:",
                                    booking?.start_time ||
                                    booking?.time ||
                                    "-",
                                ],
                                ["Truck:", truckPreview],
                                ["Type:", rubberTypeName],
                                [
                                    "Booking:",
                                    booking?.booking_code || "-",
                                ],
                                [
                                    "Recorder:",
                                    booking?.recorder || "-",
                                ],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                    }}
                                >
                                    <div style={labelStyle}>{label}</div>
                                    <div style={valueStyle}>{value}</div>
                                </div>
                            ))}
                        </Stack>

                        {/* Queue Row */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                margin: "16px 0",
                            }}
                        >
                            <div style={labelStyle}>Queue:</div>
                            <div
                                style={{
                                    width: sizeCfg.queue,
                                    height: sizeCfg.queue,
                                    borderRadius: "10px",
                                    background: theme.queueBg,
                                    color: "#fff",
                                    fontSize: Math.round(
                                        sizeCfg.queue * 0.45,
                                    ),
                                    fontWeight: 700,
                                    border: `2px solid ${theme.border}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {booking?.queue_no ?? "-"}
                            </div>
                        </div>

                        {/* Warning Text */}
                        <div
                            style={{
                                textAlign: "center",
                                margin: "16px 0",
                                lineHeight: 1.25,
                            }}
                        >
                            <div
                                style={{
                                    fontWeight: 600,
                                    fontSize: "12px",
                                    color: "#1e293b",
                                }}
                            >
                                สามารถนำรถมาจอดค้างคืนเพื่อรอ
                            </div>
                            <div
                                style={{
                                    fontWeight: 600,
                                    fontSize: "12px",
                                    color: "#1e293b",
                                }}
                            >
                                ที่หน้าโรงงานได้
                            </div>
                            <div
                                style={{
                                    color: "#dc2626",
                                    fontSize: "12px",
                                    marginTop: "8px",
                                    fontWeight: 600,
                                }}
                            >
                                * ห้ามจอดรถบนทางเข้าหน้าโรงงานเด็ดขาด *
                            </div>
                        </div>

                        {/* QR Code */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                marginTop: "16px",
                            }}
                        >
                            {hasBookingCode ? (
                                <QRCodeSVG
                                    value={String(booking.booking_code)}
                                    size={128}
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                    level="M"
                                    style={{
                                        padding: "4px",
                                        background: "#fff",
                                        borderRadius: "4px",
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: 128,
                                        height: 128,
                                        background:
                                            "rgba(255,255,255,0.5)",
                                        borderRadius: 6,
                                        border: "1px dashed #94a3b8",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Text size="xs" c="dimmed">
                                        No Code
                                    </Text>
                                </div>
                            )}
                        </div>

                        {!hasBookingCode && (
                            <Text
                                size="xs"
                                c="dimmed"
                                ta="center"
                                mt={8}
                            >
                                (QR จะปรากฏเมื่อมี Booking Code)
                            </Text>
                        )}
                    </div>
                </div>

                {/* === CONTROLS === */}
                <Group mt="md">
                    {/* ปุ่มบันทึกรูปภาพ */}
                    <Button
                        leftSection={<IconDownload size={18} />}
                        color="dark"
                        variant="filled"
                        radius="md"
                        onClick={handleSaveTicketImage}
                    >
                        Save Ticket
                    </Button>

                    {/* ปุ่ม Copy + ใช้ Mantine notifications */}
                    <CopyButton value="dummy" timeout={2000}>
                        {({ copied, copy }) => (
                            <Button
                                leftSection={<IconCopy size={18} />}
                                color={copied ? "teal" : "gray"}
                                variant="outline"
                                radius="md"
                                style={{ backgroundColor: "white" }}
                                onClick={async () => {
                                    await handleCopyTicketImage();
                                    copy(); // ให้ปุ่มเปลี่ยนเป็น Copied
                                }}
                            >
                                {copied ? "Copied" : "Copy Ticket"}
                            </Button>
                        )}
                    </CopyButton>

                    <ActionIcon
                        variant="transparent"
                        color="gray"
                        radius="md"
                        size="lg"
                        onClick={onClose}
                        style={{ marginLeft: "auto" }}
                    >
                        <IconX size={24} color="white" />
                    </ActionIcon>
                </Group>
            </Stack>
        </Modal>
    );
}