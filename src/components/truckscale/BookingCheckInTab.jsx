// src/components/truckscale/BookingCheckInTab.jsx
import {
    Box,
    Button,
    Grid,
    Group,
    Paper,
    Select,
    Stack,
    Text,
    Textarea,
    TextInput,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";

export default function BookingCheckInTab({ user }) {
    const [bookingCode, setBookingCode] = useState("");
    const [checkInTime, setCheckInTime] = useState(new Date());
    const [truckType, setTruckType] = useState(null);
    const [truckPlate, setTruckPlate] = useState("");
    const [note, setNote] = useState("");

    const handleSearch = () => {
        // TODO: call API /bookings/{code}
        console.log("search booking", bookingCode);
    };

    const handleClear = () => {
        setBookingCode("");
        // + clear booking detail state
    };

    const handleSubmit = () => {
        // TODO: call API for check-in
        console.log("check-in submit", {
            bookingCode,
            checkInTime,
            truckType,
            truckPlate,
            note,
        });
    };

    return (
        <Paper
            radius="lg"
            withBorder
            shadow="md"
            p="lg"
            style={{
                backgroundColor: "#ffffff",
                boxShadow: "0 18px 40px rgba(15,23,42,0.06)",
            }}
        >
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
                                flex={1}
                            />
                            <Button
                                leftSection={<IconSearch size={16} />}
                                radius="md"
                                onClick={handleSearch}
                            >
                                ค้นหา
                            </Button>
                            <Button variant="subtle" radius="md" color="gray" onClick={handleClear}>
                                ล้าง
                            </Button>
                        </Group>
                        <Text size="xs" c="dimmed">
                            * สแกนจาก QR/Barcode หรือกด Enter
                        </Text>

                        <Box mt="lg">
                            <Text fw={700} size="sm">
                                รายละเอียด Booking
                            </Text>
                            <Text size="xs" c="dimmed">
                                — ยังไม่มีข้อมูล —
                            </Text>
                            {/* TODO: แสดงข้อมูล booking จริง ๆ ที่ดึงมาจาก API */}
                        </Box>
                    </Stack>
                </Grid.Col>

                {/* RIGHT SIDE – Check-in Form */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Stack gap="md">
                        <Text fw={700} size="sm">
                            บันทึก Check-in
                        </Text>

                        <Grid gutter="md">
                            <Grid.Col span={12}>
                                <DateTimePicker
                                    label="เวลา Check-in"
                                    value={checkInTime}
                                    onChange={setCheckInTime}
                                    valueFormat="DD/MM/YYYY, HH:mm"
                                />
                            </Grid.Col>

                            <Grid.Col span={12}>
                                <TextInput
                                    label="ผู้บันทึก"
                                    value={
                                        user?.display_name ||
                                        [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
                                        user?.username ||
                                        ""
                                    }
                                    readOnly
                                />
                            </Grid.Col>

                            <Grid.Col span={6}>
                                <Select
                                    label="ประเภทตัวรถ *"
                                    placeholder="เลือกประเภท"
                                    data={[
                                        { value: "6", label: "6 ล้อ" },
                                        { value: "10", label: "10 ล้อ" },
                                        { value: "10-trailer", label: "10 ล้อ (พ่วง)" },
                                        { value: "trailer", label: "เทรลเลอร์" },
                                    ]}
                                    value={truckType}
                                    onChange={setTruckType}
                                    allowDeselect
                                />
                            </Grid.Col>

                            <Grid.Col span={6}>
                                <TextInput
                                    label="เลขทะเบียน"
                                    placeholder="เช่น กทม-1234"
                                    value={truckPlate}
                                    onChange={(e) => setTruckPlate(e.currentTarget.value)}
                                />
                            </Grid.Col>

                            <Grid.Col span={12}>
                                <Textarea
                                    label="หมายเหตุ"
                                    placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                                    minRows={3}
                                    value={note}
                                    onChange={(e) => setNote(e.currentTarget.value)}
                                />
                            </Grid.Col>
                        </Grid>

                        <Group justify="flex-end" mt="md">
                            <Button variant="subtle" color="gray">
                                ล้างฟอร์ม
                            </Button>
                            <Button radius="md" color="indigo" onClick={handleSubmit}>
                                Check-in
                            </Button>
                        </Group>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Paper>
    );
}