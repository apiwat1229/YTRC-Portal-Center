// src/components/error/Error404Page.jsx
import {
    Anchor,
    Button,
    Center,
    Container,
    Group,
    Paper,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import {
    IconArrowLeft,
    IconFaceIdError,
    IconHome2,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

export default function Error404Page() {
    const navigate = useNavigate();

    return (
        <div className="app-bg error-layout">
            <Container size="sm">
                <Center style={{ minHeight: "100vh" }}>
                    <Paper
                        radius="lg"
                        p="xl"
                        shadow="md"
                        withBorder
                        style={{
                            width: "100%",
                            maxWidth: 520,
                            backdropFilter: "blur(10px)",
                            backgroundColor: "rgba(255, 255, 255, 0.92)",
                        }}
                    >
                        <Stack gap="md" align="center">
                            {/* Title */}
                            <Stack gap={4} align="center">
                                <Text
                                    fz={14}
                                    fw={600}
                                    tt="uppercase"
                                    c="blue.6"
                                    style={{ letterSpacing: 2 }}
                                >
                                    Oops! Something went wrong
                                </Text>

                                <Title
                                    order={1}
                                    style={{
                                        fontSize: "64px",
                                        lineHeight: 1,
                                        letterSpacing: "0.06em",
                                    }}
                                >
                                    404
                                </Title>
                            </Stack>

                            {/* Icon */}
                            <Center
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 26,
                                    background:
                                        "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(56,189,248,0.18))",
                                }}
                            >
                                <IconFaceIdError size={40} stroke={1.6} />
                            </Center>

                            {/* Description */}
                            <Stack gap={4} align="center" mt="xs">
                                <Title order={3} ta="center">
                                    Page not found
                                </Title>
                                <Text size="sm" c="dimmed" ta="center">
                                    หน้านี้ไม่มีอยู่ในระบบ อาจถูกลบ ย้าย หรือ URL ไม่ถูกต้อง
                                    <br />
                                    กรุณากลับไปยัง Portal Center
                                </Text>
                            </Stack>

                            {/* Buttons */}
                            <Group gap="sm" mt="md">
                                <Button
                                    variant="default"
                                    leftSection={<IconArrowLeft size={16} />}
                                    onClick={() => navigate(-1)}
                                >
                                    กลับหน้าก่อนหน้า
                                </Button>

                                <Button
                                    leftSection={<IconHome2 size={16} />}
                                    onClick={() => navigate("/", { replace: true })}
                                >
                                    ไปหน้า Portal Center
                                </Button>
                            </Group>

                            {/* Footer hint */}
                            <Text size="xs" c="dimmed" mt="md">
                                Error code: 404 – Resource not found
                            </Text>
                            <Text size="xs" c="dimmed">
                                หากพบปัญหานี้บ่อย กรุณาติดต่อ{" "}
                                <Anchor
                                    size="xs"
                                    c="blue.6"
                                    component="button"
                                    onClick={() => navigate("/contact")}
                                >
                                    System Administrator
                                </Anchor>
                            </Text>
                        </Stack>
                    </Paper>
                </Center>
            </Container>
        </div>
    );
}