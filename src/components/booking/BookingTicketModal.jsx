import { ActionIcon, Button, Group, Modal, Stack, Text } from "@mantine/core";
import { IconCopy, IconDownload, IconX } from "@tabler/icons-react";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";
import { useMemo, useRef, useState } from "react";

// เปลี่ยน Path ตามที่ใช้งานจริง
import logoDark from "../../assets/logo-dark.png";


/* ===== Utils from Example ===== */

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

    const weekday = d.toLocaleDateString("th-TH", { weekday: "short" });
    const ddmmy = d.toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
    return `( ${weekday} ) ${ddmmy}`;
}

// ชุดสีเดียวกับตัวอย่าง (Pastel Card Style)
const DAY_COLORS = [
    { cardBg: "#fde2e2", border: "#d46b6b", queueBg: "#e11d48" }, // Sun
    { cardBg: "#fff7cc", border: "#d1b208", queueBg: "#eab308" }, // Mon
    { cardBg: "#ffd8e8", border: "#e26c9a", queueBg: "#ec4899" }, // Tue
    { cardBg: "#dff5df", border: "#63a463", queueBg: "#22c55e" }, // Wed
    { cardBg: "#ffe4cc", border: "#d58a4a", queueBg: "#f97316" }, // Thu
    { cardBg: "#dbeeff", border: "#5e97c2", queueBg: "#38bdf8" }, // Fri
    { cardBg: "#eadbff", border: "#8b6abf", queueBg: "#a855f7" }, // Sat
];

export default function BookingTicketModal({ opened, onClose, booking }) {
    const [toast, setToast] = useState({ show: false, type: "success", msg: "" });
    const ticketRef = useRef(null);

    // Configuration ขนาดตัวอักษรให้เหมือนตัวอย่าง
    const sizeCfg = useMemo(
        () => ({ width: 360, label: 13, value: 13, title: 18, queue: 56 }),
        []
    );
    const labelStyle = { fontSize: sizeCfg.label, fontWeight: 600, color: "#1e293b" };
    const valueStyle = { fontSize: sizeCfg.value, fontWeight: 500, color: "#0f172a", textAlign: "right", flex: 1 };

    // คำนวณ Theme สีตามวัน
    const theme = useMemo(() => {
        const iso = resolveDateInput(booking?.date) || new Date().toISOString().slice(0, 10);
        const d = new Date(iso + "T00:00:00");
        return DAY_COLORS[d.getDay()] || DAY_COLORS[0];
    }, [booking?.date]);

    const truckPreview =
        [booking?.truck_type, booking?.truck_register]
            .filter(Boolean)
            .join(" ")
            .trim() || booking?.truck || "-";

    const hasBookingCode = !!booking?.booking_code;

    /* ===== Actions ===== */
    const showToast = (type, msg) => {
        setToast({ show: true, type, msg });
        setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
    };

    const handleSaveTicketImage = async () => {
        if (!ticketRef.current) return;
        try {
            const canvas = await html2canvas(ticketRef.current, {
                backgroundColor: null,
                scale: 3, // เพิ่มความคมชัด
                useCORS: true,
            });
            const link = document.createElement("a");
            link.download = `ticket_${booking?.booking_code || "booking"}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
            showToast("success", "บันทึกรูปภาพสำเร็จ");
        } catch (err) {
            console.error("Save error:", err);
            showToast("danger", "บันทึกไม่สำเร็จ");
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
                showToast("success", "คัดลอก Ticket แล้ว");
            }, "image/png");
        } catch (err) {
            console.error("Copy error:", err);
            showToast("danger", "คัดลอกไม่สำเร็จ");
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
                body: { backgroundColor: "transparent", boxShadow: "none" },
                content: { backgroundColor: "transparent", boxShadow: "none" }
            }}
        >
            <Stack align="center" gap="sm">

                {/* === AREA TO CAPTURE === */}
                <div style={{ position: "relative", filter: "drop-shadow(0 10px 15px rgb(0 0 0 / 0.15))" }}>

                    {/* Toast Notification */}
                    {toast.show && (
                        <div
                            style={{
                                position: "absolute",
                                top: -40,
                                left: "50%",
                                transform: "translateX(-50%)",
                                backgroundColor: toast.type === "success" ? "#10b981" : "#ef4444",
                                color: "white",
                                padding: "4px 12px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                zIndex: 100,
                            }}
                        >
                            {toast.msg}
                        </div>
                    )}

                    {/* Ticket Card (ดีไซน์เหมือนตัวอย่าง) */}
                    <div
                        ref={ticketRef}
                        style={{
                            background: theme.cardBg,
                            border: `2px solid ${theme.border}`,
                            width: sizeCfg.width,
                            padding: "16px",
                            borderRadius: "12px",
                            margin: "0 auto",
                            fontFamily: "'Sarabun', 'Kanit', sans-serif",
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                            <img src={logoDark} alt="logo" style={{ height: "22px" }} />
                            <Text style={{ fontSize: sizeCfg.title, fontWeight: "bold", color: "#1e293b" }}>
                                บัตรคิว CL
                            </Text>
                        </div>

                        {/* Details List */}
                        <Stack gap={8}>
                            {[
                                ["Code:", booking?.supplier_code || booking?.code || "-"],
                                ["Name:", booking?.supplier_name || booking?.name || "-"],
                                ["Date:", thaiDateWithWeekday(booking?.date)],
                                ["Time:", booking?.start_time || booking?.time || "-"],
                                ["Truck:", truckPreview],
                                ["Type:", booking?.rubber_type || booking?.rubber_type_name || booking?.type || "-"],
                                ["Booking:", booking?.booking_code || "-"],
                                ["Recorder:", booking?.recorder || "-"],
                            ].map(([label, value]) => (
                                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div style={labelStyle}>{label}</div>
                                    <div style={valueStyle}>{value}</div>
                                </div>
                            ))}
                        </Stack>

                        {/* Queue Row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "16px 0" }}>
                            <div style={labelStyle}>Queue:</div>
                            <div
                                style={{
                                    width: sizeCfg.queue,
                                    height: sizeCfg.queue,
                                    borderRadius: "10px",
                                    background: theme.queueBg,
                                    color: "#fff",
                                    fontSize: Math.round(sizeCfg.queue * 0.45),
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
                        <div style={{ textAlign: "center", margin: "16px 0", lineHeight: 1.25 }}>
                            <div style={{ fontWeight: 600, fontSize: "12px", color: "#1e293b" }}>
                                สามารถนำรถมาจอดค้างคืนเพื่อรอ
                            </div>
                            <div style={{ fontWeight: 600, fontSize: "12px", color: "#1e293b" }}>
                                ที่หน้าโรงงานได้
                            </div>
                            <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "8px", fontWeight: 600 }}>
                                * ห้ามจอดรถบนทางเข้าหน้าโรงงานเด็ดขาด *
                            </div>
                        </div>

                        {/* QR Code */}
                        <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
                            {hasBookingCode ? (
                                <QRCodeSVG
                                    value={String(booking.booking_code)}
                                    size={128}
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                    level="M"
                                    style={{ padding: "4px", background: "#fff", borderRadius: "4px" }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: 128,
                                        height: 128,
                                        background: "rgba(255,255,255,0.5)",
                                        borderRadius: 6,
                                        border: "1px dashed #94a3b8",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}
                                >
                                    <Text size="xs" c="dimmed">No Code</Text>
                                </div>
                            )}
                        </div>

                        {!hasBookingCode && (
                            <Text size="xs" c="dimmed" ta="center" mt={8}>
                                (QR จะปรากฏเมื่อมี Booking Code)
                            </Text>
                        )}
                    </div>
                </div>

                {/* === CONTROLS === */}
                <Group mt="md">
                    <Button
                        leftSection={<IconDownload size={18} />}
                        color="dark"
                        variant="filled"
                        radius="xl"
                        onClick={handleSaveTicketImage}
                    >
                        Save Ticket
                    </Button>
                    <Button
                        leftSection={<IconCopy size={18} />}
                        color="gray"
                        variant="outline"
                        radius="xl"
                        onClick={handleCopyTicketImage}
                        style={{ backgroundColor: "white" }}
                    >
                        Copy Ticket
                    </Button>
                    <ActionIcon
                        variant="transparent"
                        color="gray"
                        radius="xl"
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