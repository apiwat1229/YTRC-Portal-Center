// src/components/truckscale/WeightScaleInTab.jsx
import {
    Button,
    Group,
    Select,
    Stack,
    Table,
    Text,
    TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";

export default function WeightScaleInTab({ user }) {
    const [rowsPerPage, setRowsPerPage] = useState("10");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [searchText, setSearchText] = useState("");

    // mock data 1 row
    const items = [
        {
            id: 1,
            supplier: "0042 : นางสาว ศรีจันทร์ จริงจิตร",
            queue: "10:00 - 11:00 (9)",
            plate: "1112",
            truckType: "10 ล้อ (พ่วง)",
            startDrain: "12:52",
            stopDrain: "12:53",
            totalDrain: "01 นาที",
            weightIn: {
                raw: "ตัวระ: 4,324 กก.",
                cup: "พ่วง: 4,320 กก.",
                total: "รวม: 8,644 กก.",
            },
        },
    ];

    return (
        <Stack gap="lg">
            {/* Header row */}
            <Group justify="space-between" align="center">
                <Text fw={700} size="sm">
                    WEIGHT SCALE IN
                </Text>
                <Text size="xs" c="dimmed">
                    Operations / Weight Scale IN
                </Text>
            </Group>

            {/* Filters */}
            <Group justify="space-between" align="center" wrap="wrap" gap="sm">
                <Group gap="xs">
                    <Text size="sm" fw={600}>
                        แสดง
                    </Text>
                    <Select
                        data={["10", "25", "50"]}
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
                        onChange={(e) => setSearchText(e.currentTarget.value)}
                        w={220}
                    />
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
                        <Table.Th>Start Drain</Table.Th>
                        <Table.Th>Stop Drain</Table.Th>
                        <Table.Th>Total Drain</Table.Th>
                        <Table.Th>Weight In</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {items.map((item) => (
                        <Table.Tr key={item.id}>
                            <Table.Td>{item.supplier}</Table.Td>
                            <Table.Td>{item.queue}</Table.Td>
                            <Table.Td>{item.plate}</Table.Td>
                            <Table.Td>{item.truckType}</Table.Td>
                            <Table.Td style={{ color: "#16a34a" }}>
                                {item.startDrain}
                            </Table.Td>
                            <Table.Td style={{ color: "#ef4444" }}>
                                {item.stopDrain}
                            </Table.Td>
                            <Table.Td>{item.totalDrain}</Table.Td>
                            <Table.Td>
                                <Text size="xs">{item.weightIn.raw}</Text>
                                <Text size="xs">{item.weightIn.cup}</Text>
                                <Text size="xs" fw={700}>
                                    {item.weightIn.total}
                                </Text>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            {/* Pagination buttons mock */}
            <Group justify="flex-end" mt="sm">
                <Button variant="default" size="xs">
                    ก่อนหน้า
                </Button>
                <Button variant="light" size="xs">
                    1
                </Button>
                <Button color="indigo" size="xs">
                    ถัดไป
                </Button>
            </Group>
        </Stack>
    );
}