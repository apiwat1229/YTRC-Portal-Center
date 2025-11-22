// src/components/booking/AddBookingDrawer.jsx
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

import {
    Button,
    Drawer,
    Grid,
    Group,
    NumberInput,
    Select,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";


import { IconCalendar, IconCheck, IconX } from "@tabler/icons-react";

import { http } from "@/helpers/http";

const SUPPLIER_ENDPOINT = "/suppliers/";
const RUBBERTYPE_ENDPOINT = "/rubber-types";

function genBookingCode(dateObj, queueNo) {
    if (!dateObj || !queueNo) return "";
    const d = dayjs(dateObj);
    const datePart = d.format("YYMMDD");
    const q = String(queueNo).padStart(2, "0");
    return `${datePart}${q}`;
}

/**
 * Drawer สำหรับ Add / Edit Booking
 *
 * props:
 *  - opened: boolean
 *  - onClose: () => void
 *  - defaults: ข้อมูลเริ่มต้น / ข้อมูล booking ที่จะ edit
 *  - onSuccess: () => void
 */
export default function AddBookingDrawer({
    opened,
    onClose,
    defaults,
    onSuccess,
}) {
    const [form, setForm] = useState({
        start_time: "08:00",
        end_time: "09:00",
        date: new Date(),
        booking_code: "",
        queue_no: "",
        supplier_code: "",
        supplier_name: "",
        truck_type: "",
        license_plate: "",
        rubber_type: "",
        rubber_type_name: "",
        recorder: "",
    });

    const [supplierOptions, setSupplierOptions] = useState([]);
    const [rubberTypeOptions, setRubberTypeOptions] = useState([]);

    // ==== เช็คว่าเป็นโหมดแก้ไขไหม (มี id ใน defaults) ====
    const bookingId = useMemo(
        () => defaults?.id || defaults?._id || defaults?.booking_id || null,
        [defaults],
    );
    const isEditMode = !!bookingId;

    // ==== ตั้งค่า default เมื่อเปิด Drawer ====
    useEffect(() => {
        if (!opened) return;

        const base = defaults || {};

        // date จาก defaults อาจเป็น string → แปลงเป็น Date ให้
        const date =
            base.date instanceof Date
                ? base.date
                : base.date
                    ? new Date(base.date)
                    : new Date();

        const queueNo = base.queue_no ?? 1;

        setForm((prev) => ({
            ...prev,
            start_time: base.start_time || "08:00",
            end_time: base.end_time || "09:00",
            date,
            // edit mode → ใช้ booking_code เดิม
            // create mode → gen ใหม่จาก date + queue_no
            booking_code:
                base.booking_code ||
                (queueNo ? genBookingCode(date, queueNo) : ""),
            queue_no: String(queueNo),

            supplier_code: base.supplier_code || "",
            supplier_name: base.supplier_name || "",

            truck_type: base.truck_type || "",
            // ตอน edit เราส่งมาในชื่อ truck_register
            license_plate: base.truck_register || base.license_plate || "",

            rubber_type: base.rubber_type || "",
            rubber_type_name: base.rubber_type_name || "",

            recorder: base.recorder || "",
        }));
    }, [opened, defaults, isEditMode]);

    // ==== โหลด Suppliers + RubberTypes เมื่อเปิด Drawer ====
    useEffect(() => {
        if (!opened) return;

        const fetchSuppliers = async () => {
            try {
                console.log("[AddBookingDrawer] GET suppliers:", SUPPLIER_ENDPOINT);
                const resp = await http.get(SUPPLIER_ENDPOINT, {
                    params: { limit: 200 },
                });

                const data = Array.isArray(resp.data)
                    ? resp.data
                    : resp.data?.items || [];

                const options = data.map((s, idx) => {
                    const code =
                        s.sup_code ||
                        s.code ||
                        s.supplier_code ||
                        String(s.id ?? s._id ?? idx);

                    const firstLast = [s.first_name, s.last_name]
                        .filter(Boolean)
                        .join(" ");

                    const name =
                        s.display_name ||
                        firstLast ||
                        s.full_name ||
                        s.name_th ||
                        s.name_en ||
                        s.name ||
                        "";

                    const label = [code, name].filter(Boolean).join("-");

                    return {
                        value: code,
                        label: label || "(unknown supplier)",
                        rawName: name,
                    };
                });

                const seen = new Set();
                const uniqueOptions = [];
                for (const opt of options) {
                    if (!seen.has(opt.value)) {
                        seen.add(opt.value);
                        uniqueOptions.push(opt);
                    }
                }

                setSupplierOptions(uniqueOptions);
            } catch (err) {
                console.error("[AddBookingDrawer] fetch suppliers error:", err);
                setSupplierOptions([]);
            }
        };

        const fetchRubberTypes = async () => {
            try {
                console.log("[AddBookingDrawer] GET rubber types:", RUBBERTYPE_ENDPOINT);
                const resp = await http.get(RUBBERTYPE_ENDPOINT, {
                    params: { limit: 200 },
                });

                const data = Array.isArray(resp.data)
                    ? resp.data
                    : resp.data?.items || [];

                const options = data.map((r, idx) => {
                    const code =
                        r.code ||
                        r.rubbertype_code ||
                        r.rubber_code ||
                        String(r.id ?? r._id ?? idx);

                    const name =
                        r.name ||
                        r.rubbertype_name ||
                        r.description_th ||
                        r.description ||
                        "";

                    return {
                        value: code,                // ส่ง code ไปให้ BE
                        label: name || code || "-", // UI เห็นแค่ชื่อ
                        rawName: name,
                    };
                });

                const seen = new Set();
                const uniqueOptions = [];
                for (const opt of options) {
                    if (!seen.has(opt.value)) {
                        seen.add(opt.value);
                        uniqueOptions.push(opt);
                    }
                }

                setRubberTypeOptions(uniqueOptions);
            } catch (err) {
                console.error("[AddBookingDrawer] fetch rubber types error:", err);
                setRubberTypeOptions([]);
            }
        };

        fetchSuppliers();
        fetchRubberTypes();
    }, [opened]);

    // ==== helpers ====
    const updateForm = (field, value) => {
        setForm((prev) => {
            const next = { ...prev, [field]: value };

            // booking code เปลี่ยนเฉพาะตอนเปลี่ยน date และเป็นโหมด create เท่านั้น
            if (field === "date" && !isEditMode) {
                if (next.date && next.queue_no) {
                    next.booking_code = genBookingCode(next.date, next.queue_no);
                }
            }

            return next;
        });
    };

    const handleSupplierChange = (val) => {
        const selected = supplierOptions.find((opt) => opt.value === val);
        updateForm("supplier_code", val || "");
        updateForm("supplier_name", selected?.rawName || "");
    };

    const handleRubberTypeChange = (val) => {
        const selected = rubberTypeOptions.find((opt) => opt.value === val);
        updateForm("rubber_type", val || "");
        updateForm("rubber_type_name", selected?.rawName || "");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                date: dayjs(form.date).format("YYYY-MM-DD"),
                start_time: form.start_time,
                end_time: form.end_time,
                queue_no: form.queue_no ? Number(form.queue_no) : undefined,
                booking_code: form.booking_code || undefined,
                supplier_code: form.supplier_code || undefined,
                supplier_name: form.supplier_name || undefined,
                truck_type: form.truck_type || undefined,
                truck_register: form.license_plate || undefined,
                rubber_type: form.rubber_type || undefined,
                rubber_type_name: form.rubber_type_name || undefined,
                recorder: form.recorder || undefined,
            };

            console.log(
                "[AddBookingDrawer] payload:",
                isEditMode ? "update" : "create",
                payload,
            );

            if (isEditMode && bookingId) {
                // ✅ ใช้ PUT ให้ตรงกับ backend (เดิมใช้ PATCH แล้ว 405)
                await http.put(`/bookings/${bookingId}`, payload);
            } else {
                await http.post("/bookings", payload);
            }

            notifications.show({
                title: isEditMode ? "Update Booking สำเร็จ" : "Create Booking สำเร็จ",
                message: isEditMode
                    ? "บันทึกการแก้ไขคิวเรียบร้อยแล้ว"
                    : "บันทึกการจองคิวเรียบร้อยแล้ว",
                color: "teal",
                icon: <IconCheck size={20} />,
            });

            onSuccess?.();
        } catch (err) {
            console.error("[AddBookingDrawer] save error:", err);

            const backendMsg =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                err?.message ||
                "บันทึกการจองไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";

            notifications.show({
                title: "บันทึกไม่สำเร็จ",
                message: String(backendMsg || "เกิดข้อผิดพลาดจากระบบ"),
                color: "red",
                icon: <IconX size={20} />,
            });
        }
    };

    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            position="right"
            size="lg"
            padding="lg"
            overlayProps={{ backgroundOpacity: 0.15, blur: 2 }}
            styles={{
                content: {
                    backgroundColor: "#f9fafb",
                },
            }}
            title={
                <Text fw={600} size="md">
                    {isEditMode ? "Edit Booking" : "Add Booking"}
                </Text>
            }
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    <Grid gutter="md">
                        {/* Start / End time */}
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <TextInput
                                label="Start Time *"
                                value={form.start_time}
                                readOnly
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <TextInput
                                label="End Time *"
                                value={form.end_time}
                                readOnly
                            />
                        </Grid.Col>

                        {/* Date / Booking Code */}
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <DateInput
                                label="Date *"
                                value={form.date}
                                onChange={(value) =>
                                    value && updateForm("date", value)
                                }
                                leftSection={<IconCalendar size={16} />}
                                valueFormat="DD-MMM-YYYY"
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <TextInput
                                label="Booking Code *"
                                value={form.booking_code}
                                readOnly
                            />
                        </Grid.Col>

                        {/* Queue / Supplier */}
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <NumberInput
                                label="Queue *"
                                value={form.queue_no}
                                readOnly
                                disabled
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select
                                label="Supplier *"
                                placeholder="Select Supplier"
                                data={supplierOptions}
                                searchable
                                nothingFoundMessage="ไม่พบ Supplier"
                                value={form.supplier_code}
                                onChange={handleSupplierChange}
                            />
                        </Grid.Col>

                        {/* Truck type / License plate */}
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select
                                label="Truck Type *"
                                placeholder="Select Truck Type"
                                data={[
                                    { value: "กระบะ", label: "กระบะ" },
                                    { value: "6 ล้อ", label: "6 ล้อ" },
                                    { value: "10 ล้อ", label: "10 ล้อ" },
                                    { value: "10 ล้อ พ่วง", label: "10 ล้อ (พ่วง)" },
                                    { value: "เทรลเลอร์", label: "เทรลเลอร์" },
                                ]}
                                value={form.truck_type}
                                onChange={(val) =>
                                    updateForm("truck_type", val || "")
                                }
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <TextInput
                                label="License Plate"
                                placeholder="เช่น 10 ยธ 59343"
                                value={form.license_plate}
                                onChange={(e) =>
                                    updateForm("license_plate", e.currentTarget.value)
                                }
                            />
                        </Grid.Col>

                        {/* Type / Recorder */}
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select
                                label="Type *"
                                placeholder="Select Rubber Type"
                                data={rubberTypeOptions}
                                searchable
                                nothingFoundMessage="ไม่พบ Rubber Type"
                                value={form.rubber_type}
                                onChange={handleRubberTypeChange}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <TextInput
                                label="Recorder"
                                value={form.recorder}
                                readOnly
                            />
                        </Grid.Col>
                    </Grid>

                    <Group justify="flex-end" mt="md">
                        <Button
                            variant="subtle"
                            color="gray"
                            onClick={onClose}
                            type="button"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" color="indigo">
                            {isEditMode ? "Update Booking" : "Save Booking"}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Drawer>
    );
}