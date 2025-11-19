// src/components/contact/ContactPortalPage.jsx
import {
    AppShell,
    Badge,
    Box,
    Button,
    Card,
    Code,
    Container,
    Divider,
    Group,
    SimpleGrid,
    Stack,
    Text,
} from "@mantine/core";
import {
    IconAddressBook,
    IconArrowLeft,
    IconBuildingSkyscraper,
    IconUpload,
    IconUsersGroup,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import AccountInfoBlock from "../common/AccountInfoBlock";

export default function ContactPortalPage({
    auth,
    onLogout,
    onBack,
    onOpenProfile, // ✅ รับ handler สำหรับดูโปรไฟล์
}) {
    const { user } = auth || {};
    const [activeModule, setActiveModule] = useState(null); // 'people' | 'companies' | 'import' | null

    const displayName = useMemo(() => {
        if (!user) return "";
        return (
            user.display_name ||
            [user.first_name, user.last_name].filter(Boolean).join(" ") ||
            user.username ||
            user.email
        );
    }, [user]);

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
                    {/* ซ้ายบน: ชื่อหน้า */}
                    <Group gap="xs">
                        <IconAddressBook size={20} />
                        <Text fw={600}>Contact Management</Text>
                    </Group>

                    {/* ขวาบน: ชื่อ user + ปุ่ม Back / Logout */}
                    <Group gap="sm">
                        <Text size="sm" c="dimmed">
                            {displayName}
                        </Text>
                        <Button
                            variant="subtle"
                            size="xs"
                            leftSection={<IconArrowLeft size={14} />}
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
                <Stack gap="md">
                    {/* การ์ดต้อนรับ / ข้อมูลบัญชี (reuse AccountInfoBlock) */}
                    <AccountInfoBlock
                        user={user}
                        onOpenProfile={onOpenProfile} // ✅ ส่ง handler ให้ปุ่ม ดูโปรไฟล์
                        onLogout={onLogout}
                        description={
                            "ศูนย์กลางจัดการข้อมูลบุคคล, Supplier, ลูกค้า, แผนก และช่องทางติดต่อ " +
                            "เพื่อใช้ร่วมกับระบบอื่นของ YTRC Portal Center เช่น QR, แจ้งซ่อม และ Stock"
                        }
                    />

                    {/* Contact applications */}
                    <Card withBorder radius="md" style={{ backgroundColor: "white" }}>
                        <Group justify="space-between" mb="xs">
                            <Text fw={600}>Contact applications</Text>
                            <Button
                                variant="subtle"
                                size="xs"
                                leftSection={<IconArrowLeft size={14} />}
                                onClick={onBack}
                            >
                                Back to Portal
                            </Button>
                        </Group>

                        <Text size="xs" c="dimmed" mb="sm">
                            เลือก module ที่ต้องการจัดการข้อมูล contact สำหรับใช้งานร่วมกับระบบอื่น
                        </Text>

                        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mt="md">
                            <SubCard
                                icon={IconUsersGroup}
                                title="People & Contacts"
                                description="จัดการรายชื่อบุคคล, เบอร์โทร, อีเมล, Line และข้อมูลติดต่ออื่นๆ."
                                color="blue"
                                active={activeModule === "people"}
                                onClick={() => setActiveModule("people")}
                            />

                            <SubCard
                                icon={IconBuildingSkyscraper}
                                title="Companies / Units"
                                description="จัดการข้อมูลบริษัท, หน่วยงาน, แผนก และ mapping กับบุคคลที่เกี่ยวข้อง."
                                color="indigo"
                                active={activeModule === "companies"}
                                onClick={() => setActiveModule("companies")}
                            />

                            <SubCard
                                icon={IconUpload}
                                title="Import / Sync"
                                description="เชื่อมต่อหรือ import ข้อมูลจากระบบอื่น (เช่น Excel, ERP) เพื่อไม่ต้องกรอกซ้ำ."
                                color="teal"
                                active={activeModule === "import"}
                                onClick={() => setActiveModule("import")}
                            />
                        </SimpleGrid>

                        <Divider my="md" />

                        <Box>
                            <Text size="xs" c="dimmed" mb={4}>
                                Selected contact module:
                            </Text>
                            <Code fz={12}>
                                {activeModule === "people" &&
                                    "People & Contacts — จัดการรายชื่อและช่องทางติดต่อบุคคลทั้งหมด"}
                                {activeModule === "companies" &&
                                    "Companies / Units — จัดการบริษัท, หน่วยงาน และแผนกต่างๆ"}
                                {activeModule === "import" &&
                                    "Import / Sync — นำเข้าข้อมูลและเชื่อมต่อกับระบบภายนอก"}
                                {!activeModule &&
                                    "ยังไม่ได้เลือก module (คลิกที่การ์ดด้านบนเพื่อเริ่มจัดการ Contact)"}
                            </Code>
                        </Box>
                    </Card>
                </Stack>
            </Container>
        </AppShell>
    );
}

function SubCard({ icon: Icon, title, description, color, active, onClick }) {
    const isActive = !!active;

    return (
        <Card
            radius="md"
            withBorder
            onClick={onClick}
            style={{
                backgroundColor: isActive ? "rgba(219, 234, 254, 0.7)" : "white",
                padding: "18px 16px",
                cursor: "pointer",
                borderColor: isActive
                    ? "rgba(59, 130, 246, 0.9)"
                    : "rgba(226, 232, 240, 1)",
                transition:
                    "transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease",
            }}
            shadow={isActive ? "md" : "xs"}
        >
            <Group align="flex-start" gap="md" wrap="nowrap">
                <Box
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: `var(--mantine-color-${color}-0, rgba(59,130,246,0.06))`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Icon
                        size={22}
                        color={`var(--mantine-color-${color}-6, rgba(37,99,235,1))`}
                    />
                </Box>
                <Stack gap={4} style={{ flex: 1 }}>
                    <Group justify="space-between" align="flex-start">
                        <Text fw={600} size="sm">
                            {title}
                        </Text>
                        <Badge
                            size="xs"
                            radius="lg"
                            variant={isActive ? "filled" : "light"}
                            color={color}
                        >
                            {isActive ? "Selected" : "Available"}
                        </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">
                        {description}
                    </Text>
                </Stack>
            </Group>
        </Card>
    );
}