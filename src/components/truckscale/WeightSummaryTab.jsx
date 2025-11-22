// src/components/truckscale/WeightSummaryTab.jsx
import {
    Button,
    Card,
    Group,
    Paper,
    Stack,
    Table,
    Text,
    TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";

export default function WeightSummaryTab() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [searchText, setSearchText] = useState("");

    // mock summary & rows
    const summary = {
        totalIn: "135,434 กก.",
        totalOut: "4,687 กก.",
        net: "130,747 กก.",
        trucks: 3,
        avgNet: "43,582 กก.",
    };

    const rows = [
        {
            id: 1,
            date: "17-Nov-2025",
            supplier: "0042 : นางสาว ศรีจันทร์ จริงจิตร",
            plate: "ชธจ9343",
            truckType: "10 ล้อ",
            rubberType: "EUDR CL\nจังหวัด ตรัง",
            weightIn: "22,100 กก.",
            weightOut: "1,440 กก.",
            net: "20,660 กก.",
        },
    ];

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
            <Stack gap="lg">
                {/* Header */}
                <Group justify="space-between" align="center">
                    <Text fw={700} size="sm">
                        WEIGHT SUMMARY — DASHBOARD
                    </Text>
                    <Text size="xs" c="dimmed">
                        Operations / Weight Summary — Dashboard
                    </Text>
                </Group>

                {/* Filters */}
                <Group align="center" gap="md" wrap="wrap">
                    <DateInput
                        label="วันที่"
                        value={selectedDate}
                        onChange={setSelectedDate}
                        valueFormat="DD-MMM-YYYY"
                        w={180}
                    />
                    <TextInput
                        label="ค้นหา (Supplier / Truck / Type / Code)"
                        placeholder="พิมพ์ข้อความค้นหา..."
                        leftSection={<IconSearch size={14} />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.currentTarget.value)}
                        flex={1}
                    />
                    <Button mt="xs">รีเฟรชข้อมูล</Button>
                </Group>

                {/* Summary cards */}
                <Group grow align="stretch">
                    <Card radius="md" withBorder padding="md">
                        <Text size="xs" c="dimmed" fw={600}>
                            TOTAL WEIGHT IN
                        </Text>
                        <Text size="xl" fw={800}>
                            {summary.totalIn}
                        </Text>
                        <Text size="xs" c="dimmed">
                            จาก 3 รายการ
                        </Text>
                    </Card>

                    <Card radius="md" withBorder padding="md">
                        <Text size="xs" c="dimmed" fw={600}>
                            TOTAL WEIGHT OUT
                        </Text>
                        <Text size="xl" fw={800}>
                            {summary.totalOut}
                        </Text>
                        <Text size="xs" c="dimmed">
                            รวมจากการ Check-OUT ในวันนี้
                        </Text>
                    </Card>

                    <Card radius="md" withBorder padding="md">
                        <Text size="xs" c="dimmed" fw={600}>
                            NET WEIGHT รวม
                        </Text>
                        <Text size="xl" fw={800}>
                            {summary.net}
                        </Text>
                        <Text size="xs" c="dimmed">
                            เฉลี่ยต่อคัน: {summary.avgNet}
                        </Text>
                    </Card>

                    <Card radius="md" withBorder padding="md">
                        <Text size="xs" c="dimmed" fw={600}>
                            QUICK GLANCE (TODAY)
                        </Text>
                        <Stack gap={2} mt="xs">
                            <Group justify="space-between">
                                <Text size="xs" c="dimmed">
                                    จำนวนคันที่ Drain ครบ
                                </Text>
                                <Text size="xs" fw={600}>
                                    {summary.trucks} คัน
                                </Text>
                            </Group>
                            <Group justify="space-between">
                                <Text size="xs" c="dimmed">
                                    รวม Net Weight
                                </Text>
                                <Text size="xs" fw={600}>
                                    {summary.net}
                                </Text>
                            </Group>
                            <Group justify="space-between">
                                <Text size="xs" c="dimmed">
                                    เฉลี่ย Net ต่อคัน
                                </Text>
                                <Text size="xs" fw={600}>
                                    {summary.avgNet}
                                </Text>
                            </Group>
                        </Stack>
                    </Card>
                </Group>

                {/* Drain list table */}
                <Text fw={700} size="sm" mt="md">
                    รายการ Drain ที่สมบูรณ์
                </Text>

                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>วันที่</Table.Th>
                            <Table.Th>Supplier</Table.Th>
                            <Table.Th>ทะเบียนรถ</Table.Th>
                            <Table.Th>ประเภท</Table.Th>
                            <Table.Th>Rubber Type / จังหวัด</Table.Th>
                            <Table.Th>Weight In</Table.Th>
                            <Table.Th>Weight Out</Table.Th>
                            <Table.Th>Net</Table.Th>
                            <Table.Th>Actions</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {rows.map((row) => (
                            <Table.Tr key={row.id}>
                                <Table.Td>{row.date}</Table.Td>
                                <Table.Td>{row.supplier}</Table.Td>
                                <Table.Td>{row.plate}</Table.Td>
                                <Table.Td>{row.truckType}</Table.Td>
                                <Table.Td>
                                    {row.rubberType.split("\n").map((line) => (
                                        <Text key={line} size="xs">
                                            {line}
                                        </Text>
                                    ))}
                                </Table.Td>
                                <Table.Td>{row.weightIn}</Table.Td>
                                <Table.Td>{row.weightOut}</Table.Td>
                                <Table.Td>{row.net}</Table.Td>
                                <Table.Td>
                                    <Button size="xs" variant="light" color="gray">
                                        แก้ไข
                                    </Button>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Stack>
        </Paper>
    );
}