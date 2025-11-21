// src/components/booking/AddBookingDrawer.jsx
import dayjs from "dayjs";
import { useEffect, useState } from "react";

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
import { IconCalendar } from "@tabler/icons-react";

import { http } from "@/helpers/http";

// ===== ปรับให้ตรงกับ BE จริง =====
// ตอนนี้อิง pattern เดิมของ API: /suppliers/ และ /rubber-types/
const SUPPLIER_ENDPOINT = "/suppliers/";        // => https://.../api/suppliers/
const RUBBERTYPE_ENDPOINT = "/rubber-types/";   // => https://.../api/rubber-types/

function genBookingCode(dateObj, queueNo) {
    if (!dateObj || !queueNo) return "";
    const d = dayjs(dateObj);
    const datePart = d.format("YYMMDD");
    const q = String(queueNo).padStart(2, "0");
    return `${datePart}${q}`;
}

/**
 * Drawer สำหรับ Add Booking แยกเป็น component ต่างหาก
 *
 * props:
 *  - opened: boolean
 *  - onClose: () => void
 *  - defaults: {
 *      start_time, end_time, date, queue_no, recorder
 *    }
 *  - onSuccess: () => void   // เรียกเมื่อบันทึกสำเร็จ
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
        supplier: "",
        truck_type: "",
        license_plate: "",
        rubber_type: "",
        recorder: "",
    });

    // options จาก BE
    const [supplierOptions, setSupplierOptions] = useState([]);
    const [rubberTypeOptions, setRubberTypeOptions] = useState([]);

    // เวลาเปิด drawer หรือ defaults เปลี่ยน → ตั้งค่าเริ่มต้นในฟอร์ม
    useEffect(() => {
        if (!opened) return;

        const base = defaults || {};
        const date = base.date || new Date();
        const queueNo = base.queue_no ?? 1;

        setForm({
            start_time: base.start_time || "08:00",
            end_time: base.end_time || "09:00",
            date,
            booking_code: genBookingCode(date, queueNo),
            queue_no: String(queueNo),
            supplier: "",
            truck_type: "",
            license_plate: "",
            rubber_type: "",
            recorder: base.recorder || "",
        });
    }, [opened, defaults]);

    // โหลด suppliers & rubber types จาก BE ทุกครั้งที่เปิด drawer
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

                const options = data.map((s) => {
                    const code =
                        s.code ||
                        s.supplier_code ||
                        s.sup_code ||
                        s.id ||
                        s._id ||
                        "";
                    const name =
                        s.name ||
                        s.name_th ||
                        s.supplier_name ||
                        s.full_name ||
                        "";
                    const label = [code, name].filter(Boolean).join(" : ");

                    return {
                        value: name || code || "",
                        label: label || "(unknown supplier)",
                    };
                });

                setSupplierOptions(options);
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

                const options = data.map((r) => {
                    const code =
                        r.code ||
                        r.rubbertype_code ||
                        r.rt_code ||
                        r.id ||
                        r._id ||
                        "";
                    const name =
                        r.name ||
                        r.rubbertype_name ||
                        r.description ||
                        "";
                    const label = [code, name].filter(Boolean).join(" : ");

                    return {
                        value: name || code || "",
                        label: label || "(unknown type)",
                    };
                });

                setRubberTypeOptions(options);
            } catch (err) {
                console.error("[AddBookingDrawer] fetch rubber types error:", err);
                setRubberTypeOptions([]);
            }
        };

        fetchSuppliers();
        fetchRubberTypes();
    }, [opened]);

    const updateForm = (field, value) => {
        setForm((prev) => {
            const next = { ...prev, [field]: value };

            // auto-gen booking code ถ้าเปลี่ยน date หรือ queue
            if (field === "date" || field === "queue_no") {
                const q = field === "queue_no" ? value : next.queue_no;
                if (next.date && q) {
                    next.booking_code = genBookingCode(next.date, q);
                }
            }

            return next;
        });
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
                supplier_name: form.supplier || undefined,
                truck_type: form.truck_type || undefined,
                truck_register: form.license_plate || undefined,
                rubber_type: form.rubber_type || undefined,
                recorder: form.recorder || undefined,
            };

            console.log("[AddBookingDrawer] create payload:", payload);
            await http.post("/bookings", payload);

            onSuccess?.();
        } catch (err) {
            console.error("[AddBookingDrawer] create error:", err);
            alert("บันทึกการจองไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
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
                    Add Booking
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
                                min={1}
                                onChange={(val) =>
                                    updateForm("queue_no", val === "" ? "" : Number(val))
                                }
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select
                                label="Supplier *"
                                placeholder="Select Supplier"
                                data={supplierOptions}
                                searchable
                                nothingFoundMessage="ไม่พบ Supplier"
                                value={form.supplier}
                                onChange={(val) => updateForm("supplier", val || "")}
                            />
                        </Grid.Col>

                        {/* Truck type / License plate */}
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select
                                label="Truck Type *"
                                placeholder="Select Truck Type"
                                data={[
                                    { value: "6 ล้อ", label: "6 ล้อ" },
                                    { value: "10 ล้อ", label: "10 ล้อ" },
                                    { value: "10 ล้อ พ่วง", label: "10 ล้อ (พ่วง)" },
                                    { value: "เทรลเลอร์", label: "เทรลเลอร์" },
                                ]}
                                value={form.truck_type}
                                onChange={(val) => updateForm("truck_type", val || "")}
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
                                onChange={(val) => updateForm("rubber_type", val || "")}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <TextInput
                                label="Recorder"
                                value={form.recorder}
                                onChange={(e) =>
                                    updateForm("recorder", e.currentTarget.value)
                                }
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
                            Save Booking
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Drawer>
    );
}