// src/components/admin/PermissionManagerPage.jsx
import {
    AppShell,
    Badge,
    Box,
    Button,
    Card,
    Checkbox,
    Container,
    Group,
    ScrollArea,
    Stack,
    Table,
    Text,
    Title,
} from "@mantine/core";
import { IconGridDots, IconLock, IconUserShield } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { can } from "../auth/permission";
import AccountInfoBlock from "../common/AccountInfoBlock";

export default function PermissionManagerPage({
    auth,
    onLogout,
    onBack,
    onOpenProfile, // ✅ ถ้ามีจะถูกส่งต่อไปที่ AccountInfoBlock
}) {
    const { user } = auth || {};

    const displayName = useMemo(() => {
        if (!user) return "";
        return (
            user.display_name ||
            [user.first_name, user.last_name].filter(Boolean).join(" ") ||
            user.username ||
            user.email
        );
    }, [user]);

    const canManagePermissions =
        can(user, "portal.admin.permissions.manage") || user?.is_superuser;

    // ถ้ายังไม่ได้ login
    if (!user) {
        return (
            <Box
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Text>Unauthorized</Text>
            </Box>
        );
    }

    return (
        <AppShell
            padding="md"
            header={{ height: 64 }}
            styles={{
                main: {
                    backgroundColor: "#f5f7fb",
                },
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
                    <Group gap="xs">
                        <IconLock size={20} />
                        <Text fw={600}>Permissions &amp; Access Control</Text>
                    </Group>

                    <Group gap="sm">
                        <Text size="sm" c="dimmed">
                            {displayName}
                        </Text>
                        <Button
                            variant="subtle"
                            size="xs"
                            leftSection={<IconGridDots size={14} />}
                            onClick={onBack}
                        >
                            Back to Portal
                        </Button>
                        <Button
                            variant="outline"
                            size="xs"
                            color="gray"
                            onClick={onLogout}
                        >
                            Logout
                        </Button>
                    </Group>
                </Group>
            }
        >
            <Container size="lg" py="md">
                {!canManagePermissions ? (
                    <NoAccessCard />
                ) : (
                    <Stack gap="md">
                        {/* ✅ reuse AccountInfoBlock เหมือนหน้าอื่น ๆ */}
                        <AccountInfoBlock
                            user={user}
                            onOpenProfile={onOpenProfile}
                            onLogout={onLogout}
                            description={
                                "คุณกำลังใช้งาน Permissions & Access Control เพื่อกำหนดว่าสามารถเข้าถึงระบบย่อยใดได้บ้าง และจัดการสิทธิ์ของผู้ใช้งานใน YTRC Portal Center"
                            }
                        />

                        <PermissionContent user={user} />
                    </Stack>
                )}
            </Container>
        </AppShell>
    );
}

/* =======================
 * ส่วนเนื้อหา เมื่อมีสิทธิ์ manage permissions
 * ======================= */
function PermissionContent({ user }) {
    // mock data ตอนนี้ (ไว้ค่อยต่อ API ภายหลัง)
    const [rowsState, setRowsState] = useState(() => {
        return MOCK_USERS.map((u) => ({
            ...u,
            permissions: new Set(u.permissions),
        }));
    });

    const handleToggle = (userId, permKey) => {
        setRowsState((prev) =>
            prev.map((row) => {
                if (row.id !== userId) return row;
                const nextPerms = new Set(row.permissions);
                if (nextPerms.has(permKey)) {
                    nextPerms.delete(permKey);
                } else {
                    nextPerms.add(permKey);
                }
                return { ...row, permissions: nextPerms };
            })
        );
    };

    const handleSave = () => {
        // ตอนนี้ยังไม่ยิง API แค่ log ไว้
        const payload = rowsState.map((row) => ({
            id: row.id,
            permissions: Array.from(row.permissions),
        }));
        console.log("[PermissionManager] save payload:", payload);
        alert("ยังเป็น mock UI อยู่ (log payload ใน console) — เดี๋ยวค่อยต่อ API จริง");
    };

    return (
        <Stack gap="md">
            <Card withBorder radius="md" style={{ backgroundColor: "white" }}>
                <Group justify="space-between" align="flex-start">
                    <Stack gap={2}>
                        <Title order={4}>Permission matrix</Title>
                        <Text size="xs" c="dimmed">
                            กำหนดว่าสามารถเข้าถึงระบบย่อยใดได้บ้าง — ระหว่างนี้เป็นข้อมูลจำลอง
                            เพื่อออกแบบหน้าจอและโครง permission ก่อน
                        </Text>
                    </Stack>
                    <Badge
                        leftSection={<IconUserShield size={12} />}
                        variant="light"
                        color="violet"
                    >
                        Admin only
                    </Badge>
                </Group>
            </Card>

            <Card withBorder radius="md" style={{ backgroundColor: "white" }}>
                <ScrollArea.Autosize mah={420}>
                    <Table stickyHeader striped highlightOnHover withRowBorders={false}>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ width: 32 }}>#</Table.Th>
                                <Table.Th>User</Table.Th>
                                <Table.Th>Dept</Table.Th>
                                <Table.Th>Position</Table.Th>
                                <Table.Th>QR Code</Table.Th>
                                <Table.Th>แจ้งซ่อม</Table.Th>
                                <Table.Th>ระบบ Stock</Table.Th>
                                <Table.Th>Manage permissions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {rowsState.map((row, index) => (
                                <Table.Tr key={row.id}>
                                    <Table.Td>
                                        <Text size="xs" c="dimmed">
                                            {index + 1}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Stack gap={0}>
                                            <Text size="sm" fw={500}>
                                                {row.display_name}
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                {row.username}
                                            </Text>
                                        </Stack>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="xs">{row.department || "-"}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="xs">{row.position || "-"}</Text>
                                    </Table.Td>

                                    {/* QR */}
                                    <Table.Td>
                                        <Checkbox
                                            size="xs"
                                            checked={row.permissions.has("portal.app.qr.view")}
                                            onChange={() =>
                                                handleToggle(row.id, "portal.app.qr.view")
                                            }
                                        />
                                    </Table.Td>

                                    {/* Maintenance */}
                                    <Table.Td>
                                        <Checkbox
                                            size="xs"
                                            checked={row.permissions.has(
                                                "portal.app.maintenance.view"
                                            )}
                                            onChange={() =>
                                                handleToggle(
                                                    row.id,
                                                    "portal.app.maintenance.view"
                                                )
                                            }
                                        />
                                    </Table.Td>

                                    {/* Stock */}
                                    <Table.Td>
                                        <Checkbox
                                            size="xs"
                                            checked={row.permissions.has(
                                                "portal.app.stock.view"
                                            )}
                                            onChange={() =>
                                                handleToggle(row.id, "portal.app.stock.view")
                                            }
                                        />
                                    </Table.Td>

                                    {/* Manage permissions */}
                                    <Table.Td>
                                        <Checkbox
                                            size="xs"
                                            checked={row.permissions.has(
                                                "portal.admin.permissions.manage"
                                            )}
                                            onChange={() =>
                                                handleToggle(
                                                    row.id,
                                                    "portal.admin.permissions.manage"
                                                )
                                            }
                                        />
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </ScrollArea.Autosize>

                <Group justify="flex-end" mt="md">
                    <Button variant="default" size="xs" onClick={() => window.location.reload()}>
                        Reset (reload)
                    </Button>
                    <Button size="xs" onClick={handleSave}>
                        Save changes
                    </Button>
                </Group>
            </Card>
        </Stack>
    );
}

/* =======================
 * No access card
 * ======================= */
function NoAccessCard() {
    return (
        <Box
            style={{
                minHeight: "60vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Card
                withBorder
                radius="md"
                style={{
                    backgroundColor: "white",
                    maxWidth: 420,
                    width: "100%",
                }}
            >
                <Stack gap="sm" align="center">
                    <IconLock size={32} />
                    <Title order={4}>ไม่มีสิทธิ์เข้าหน้านี้</Title>
                    <Text size="sm" c="dimmed" ta="center">
                        คุณไม่ได้รับสิทธิ์ให้จัดการ Permissions &amp; Access Control
                        <br />
                        โปรดติดต่อผู้ดูแลระบบ (System admin)
                    </Text>
                </Stack>
            </Card>
        </Box>
    );
}

/* =======================
 * MOCK DATA (ไว้ค่อยต่อ API จริงทีหลัง)
 * ======================= */
const MOCK_USERS = [
    {
        id: "u1",
        username: "apiwat",
        display_name: "Apiwat Sukjaroen",
        department: "Infrastructure",
        position: "System Admin",
        permissions: [
            "portal.app.qr.view",
            "portal.app.maintenance.view",
            "portal.app.stock.view",
            "portal.admin.permissions.manage",
        ],
    },
    {
        id: "u2",
        username: "qa_user",
        display_name: "QA Staff",
        department: "QA",
        position: "Inspector",
        permissions: ["portal.app.qr.view"],
    },
    {
        id: "u3",
        username: "stock_user",
        display_name: "Stock Controller",
        department: "Warehouse",
        position: "Controller",
        permissions: ["portal.app.stock.view"],
    },
];