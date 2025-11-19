// src/components/error/Error500Page.jsx
import {
    Button,
    Center,
    Container,
    Group,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { IconAlertTriangle, IconArrowLeft, IconRefresh } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

/**
 * Error 500 page
 * - optional props: message / onRetry
 */
export default function Error500Page({ message, onRetry }) {
    const navigate = useNavigate();

    const handleRetry = () => {
        if (typeof onRetry === "function") {
            onRetry();
        } else {
            // default: reload หน้า
            window.location.reload();
        }
    };

    return (
        <Container size="sm" py="xl">
            <Center style={{ minHeight: "60vh" }}>
                <Stack gap="md" align="center">
                    {/* Icon */}
                    <Center
                        style={{
                            width: 96,
                            height: 96,
                            borderRadius: 32,
                            background:
                                "linear-gradient(135deg, rgba(248,113,113,0.10), rgba(251,191,36,0.12))",
                        }}
                    >
                        <IconAlertTriangle size={48} stroke={1.5} />
                    </Center>

                    {/* Title / Description */}
                    <Stack gap={4} align="center">
                        <Title order={2}>500 – Internal server error</Title>
                        <Text size="sm" c="dimmed" ta="center">
                            ระบบเกิดข้อผิดพลาดขณะประมวลผลคำขอของคุณ
                            <br />
                            กรุณาลองใหม่อีกครั้ง หรือแจ้งทีม IT หากปัญหายังคงเกิดขึ้น
                        </Text>

                        {message && (
                            <Text size="xs" c="dimmed" ta="center">
                                <Text component="span" fw={500}>
                                    Details:
                                </Text>{" "}
                                {message}
                            </Text>
                        )}
                    </Stack>

                    {/* Actions */}
                    <Group gap="sm" mt="md">
                        <Button
                            variant="default"
                            leftSection={<IconArrowLeft size={16} />}
                            onClick={() => navigate(-1)}
                        >
                            กลับหน้าก่อนหน้า
                        </Button>

                        <Button
                            leftSection={<IconRefresh size={16} />}
                            onClick={handleRetry}
                        >
                            ลองใหม่อีกครั้ง
                        </Button>
                    </Group>

                    <Text size="xs" c="dimmed" mt="md">
                        Error code: 500 – Internal server error
                    </Text>
                </Stack>
            </Center>
        </Container>
    );
}