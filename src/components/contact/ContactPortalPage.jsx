// src/components/contact/ContactPortalPage.jsx
import {
    AppShell,
    Box,
    Button,
    Card,
    Container,
    Group,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import {
    IconAddressBook,
    IconArrowLeft,
    IconBuildingSkyscraper,
    IconUpload,
    IconUsersGroup
} from "@tabler/icons-react";
import { useMemo } from "react";

export default function ContactPortalPage({ auth, onLogout, onBack }) {
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
                        <IconAddressBook size={20} />
                        <Text fw={600}>Contact Management</Text>
                    </Group>

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
                    <Card withBorder radius="md" style={{ backgroundColor: "white" }}>
                        <Stack gap={4}>
                            <Title order={4}>Contact center</Title>
                            <Text size="xs" c="dimmed">
                                ศูนย์กลางจัดการข้อมูลบุคคล, Supplier, ลูกค้า, แผนก และช่องทางติดต่อ
                                เพื่อใช้ร่วมกับระบบอื่นของ YTRC (เช่น QR, แจ้งซ่อม, Stock)
                            </Text>
                        </Stack>
                    </Card>

                    <Card withBorder radius="md" style={{ backgroundColor: "white" }}>
                        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                            <SubCard
                                icon={IconUsersGroup}
                                title="People & Contacts"
                                description="จัดการรายชื่อบุคคล, หมายเลขโทรศัพท์, อีเมล, Line, และข้อมูลติดต่ออื่นๆ."
                            />
                            <SubCard
                                icon={IconBuildingSkyscraper}
                                title="Companies / Units"
                                description="จัดการข้อมูลบริษัท, หน่วยงาน, แผนก และ mapping กับบุคคลที่เกี่ยวข้อง."
                            />
                            <SubCard
                                icon={IconUpload}
                                title="Import / Sync"
                                description="เชื่อมต่อหรือ import ข้อมูลจากระบบอื่น (เช่น Excel, ERP) เพื่อไม่ต้องกรอกซ้ำ."
                            />
                        </SimpleGrid>
                    </Card>
                </Stack>
            </Container>
        </AppShell>
    );
}

function SubCard({ icon: Icon, title, description }) {
    return (
        <Card
            radius="md"
            withBorder
            style={{
                backgroundColor: "white",
                padding: "18px 16px",
            }}
        >
            <Group align="flex-start" gap="md" wrap="nowrap">
                <Box
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: "rgba(59,130,246,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Icon size={22} />
                </Box>
                <Stack gap={4} style={{ flex: 1 }}>
                    <Text fw={600} size="sm">
                        {title}
                    </Text>
                    <Text size="xs" c="dimmed">
                        {description}
                    </Text>
                </Stack>
            </Group>
        </Card>
    );
}