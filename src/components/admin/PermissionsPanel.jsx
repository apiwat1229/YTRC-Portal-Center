// src/components/admin/PermissionsPanel.jsx
import {
    ActionIcon,
    AppShell,
    Badge,
    Box,
    Button,
    Card,
    Container,
    Group,
    Stack,
    Table,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconArrowLeft, IconKey, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE =
    import.meta.env.VITE_TAURI_API_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8110/api";

export default function PermissionsPanel() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState("");

    const navigate = useNavigate();

    const handleBack = () => {
        // กลับไปหน้าเดิม (เช่น System Applications)
        navigate(-1);
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/admin/permissions`);
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Load permissions error", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const openEditModal = (item) => {
        let code = item?.code || "";
        let name = item?.name || "";
        let group = item?.group || "";
        let description = item?.description || "";

        modals.openConfirmModal({
            title: item ? "แก้ไข Permission" : "สร้าง Permission ใหม่",
            labels: { confirm: "บันทึก", cancel: "ยกเลิก" },
            centered: true,
            children: (
                <Stack gap="xs">
                    <TextInput
                        label="Code"
                        placeholder="portal.app.qr.view"
                        defaultValue={code}
                        onChange={(e) => (code = e.currentTarget.value)}
                        required
                    />
                    <TextInput
                        label="Name (label)"
                        placeholder="ดูหน้าจอ QR Portal"
                        defaultValue={name}
                        onChange={(e) => (name = e.currentTarget.value)}
                    />
                    <TextInput
                        label="Group"
                        placeholder="Portal / Cuplump / System"
                        defaultValue={group}
                        onChange={(e) => (group = e.currentTarget.value)}
                    />
                    <TextInput
                        label="Description"
                        placeholder="คำอธิบายเพื่อ admin"
                        defaultValue={description}
                        onChange={(e) => (description = e.currentTarget.value)}
                    />
                </Stack>
            ),
            onConfirm: async () => {
                const payload = { code, name, group, description };
                try {
                    const url = item
                        ? `${API_BASE}/admin/permissions/${item.id}`
                        : `${API_BASE}/admin/permissions`;
                    const method = item ? "PUT" : "POST";

                    await fetch(url, {
                        method,
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    });
                    await loadData();
                } catch (e) {
                    console.error("Save permission error", e);
                }
            },
        });
    };

    const openDeleteConfirm = (item) => {
        modals.openConfirmModal({
            title: "ลบ Permission",
            centered: true,
            children: (
                <Text size="sm">
                    คุณต้องการลบ permission{" "}
                    <Text component="span" fw={600}>
                        {item.code}
                    </Text>{" "}
                    ใช่หรือไม่?
                </Text>
            ),
            labels: { confirm: "ลบ", cancel: "ยกเลิก" },
            confirmProps: { color: "red" },
            onConfirm: async () => {
                try {
                    await fetch(`${API_BASE}/admin/permissions/${item.id}`, {
                        method: "DELETE",
                    });
                    await loadData();
                } catch (e) {
                    console.error("Delete permission error", e);
                }
            },
        });
    };

    const filtered = (items || []).filter((p) =>
        [p.code, p.name, p.group]
            .filter(Boolean)
            .some((v) => v.toLowerCase().includes(keyword.toLowerCase()))
    );

    return (
        <div className="app-bg">
            <AppShell
                padding="md"
                header={{ height: 64 }}
                styles={{
                    main: { backgroundColor: "transparent" },
                }}
                headerSection={
                    <Group
                        h="100%"
                        px="md"
                        justify="space-between"
                        style={{
                            borderBottom: "1px solid rgba(226, 232, 240, 1)",
                            backgroundColor: "white",
                        }}
                    >
                        {/* ซ้าย: Title */}
                        <Group gap="xs">
                            <IconKey size={20} />
                            <Text fw={600}>Permission Manager</Text>
                            <Badge size="xs" radius="lg" variant="light" color="grape">
                                SYSTEM
                            </Badge>
                        </Group>

                        {/* ขวา: ปุ่ม Back */}
                        <Group gap="sm">
                            <Button
                                variant="subtle"
                                size="xs"
                                leftSection={<IconArrowLeft size={14} />}
                                onClick={handleBack}
                            >
                                Back
                            </Button>
                        </Group>
                    </Group>
                }
            >
                <Container size="lg" py="md">
                    <Stack gap="md">
                        <Card withBorder radius="md" style={{ backgroundColor: "white" }}>
                            <Stack gap="sm">
                                {/* Header ภายในการ์ด */}
                                <Group justify="space-between" align="flex-end">
                                    <Stack gap={2}>
                                        <Title order={5}>Permissions</Title>
                                        <Text size="xs" c="dimmed">
                                            จัดการสิทธิ์การใช้งาน (permissions) สำหรับผูกกับผู้ใช้หรือ role ต่างๆ
                                        </Text>
                                    </Stack>

                                    <Group gap="xs">
                                        <TextInput
                                            placeholder="ค้นหา code / name / group"
                                            size="xs"
                                            value={keyword}
                                            onChange={(e) =>
                                                setKeyword(e.currentTarget.value)
                                            }
                                            style={{ minWidth: 220 }}
                                        />
                                        <Button
                                            size="xs"
                                            leftSection={<IconPlus size={14} />}
                                            onClick={() => openEditModal(null)}
                                        >
                                            New permission
                                        </Button>
                                    </Group>
                                </Group>

                                {/* ตาราง Permissions */}
                                <Box
                                    style={{
                                        borderRadius: 8,
                                        border: "1px solid rgba(226, 232, 240, 1)",
                                        overflow: "hidden",
                                    }}
                                >
                                    <Table striped highlightOnHover withTableBorder>
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th width="25%">Code</Table.Th>
                                                <Table.Th width="20%">Name</Table.Th>
                                                <Table.Th width="15%">Group</Table.Th>
                                                <Table.Th>Description</Table.Th>
                                                <Table.Th width="90" ta="center">
                                                    Actions
                                                </Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {filtered.map((item) => (
                                                <Table.Tr key={item.id}>
                                                    <Table.Td>
                                                        <Code>{item.code}</Code>
                                                    </Table.Td>
                                                    <Table.Td>{item.name}</Table.Td>
                                                    <Table.Td>
                                                        {item.group ? (
                                                            <Badge size="xs" variant="light">
                                                                {item.group}
                                                            </Badge>
                                                        ) : (
                                                            <Text size="xs" c="dimmed">
                                                                –
                                                            </Text>
                                                        )}
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Text size="xs" c="dimmed">
                                                            {item.description || "–"}
                                                        </Text>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Group gap={4} justify="center">
                                                            <ActionIcon
                                                                size="sm"
                                                                variant="subtle"
                                                                onClick={() =>
                                                                    openEditModal(item)
                                                                }
                                                            >
                                                                <IconPencil size={14} />
                                                            </ActionIcon>
                                                            <ActionIcon
                                                                size="sm"
                                                                variant="subtle"
                                                                color="red"
                                                                onClick={() =>
                                                                    openDeleteConfirm(item)
                                                                }
                                                            >
                                                                <IconTrash size={14} />
                                                            </ActionIcon>
                                                        </Group>
                                                    </Table.Td>
                                                </Table.Tr>
                                            ))}

                                            {!loading && filtered.length === 0 && (
                                                <Table.Tr>
                                                    <Table.Td colSpan={5}>
                                                        <Text
                                                            size="sm"
                                                            c="dimmed"
                                                            ta="center"
                                                        >
                                                            ไม่พบ permission ตามเงื่อนไขค้นหา
                                                        </Text>
                                                    </Table.Td>
                                                </Table.Tr>
                                            )}
                                        </Table.Tbody>
                                    </Table>
                                </Box>
                            </Stack>
                        </Card>
                    </Stack>
                </Container>
            </AppShell>
        </div>
    );
}