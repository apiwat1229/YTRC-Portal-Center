// src/components/auth/LoginScreen.jsx
import {
    Box,
    Button,
    Center,
    Checkbox,
    Code,
    Container,
    Group,
    Paper,
    PasswordInput,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { useEffect, useState } from "react";

// โหลดจาก .env (Vite)
const API_BASE =
    import.meta.env.VITE_TAURI_API_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8110/api";

console.log("[YTRC Portal Center] API_BASE =", API_BASE);

export default function LoginScreen({ onSuccess }) {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // โหลดค่าที่เคย remember ไว้ (เฉพาะ identifier)
    useEffect(() => {
        try {
            const saved = localStorage.getItem("ytrc_portal_login");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed?.identifier) {
                    setIdentifier(parsed.identifier);
                    setRemember(!!parsed.remember);
                }
            }
        } catch (e) {
            console.warn("Failed to read remember-me info", e);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!identifier || !password) {
            setError("กรุณากรอก Email/Username และ Password ให้ครบ");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const body = new URLSearchParams();
            body.append("username", identifier.trim());
            body.append("password", password);
            body.append("grant_type", "password"); // สำหรับ OAuth2PasswordRequestForm

            const url = `${API_BASE}/auth/login`;
            console.log("[login] POST", url);

            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: body.toString(),
            });

            if (!res.ok) {
                let detail = `Login failed (${res.status})`;
                try {
                    const errJson = await res.json();
                    if (errJson?.detail) detail = errJson.detail;
                } catch (_) { }
                throw new Error(detail);
            }

            const data = await res.json();
            console.log("[login] success:", data);

            // remember-me (จำเฉพาะ identifier)
            try {
                if (remember) {
                    localStorage.setItem(
                        "ytrc_portal_login",
                        JSON.stringify({ identifier: identifier.trim(), remember: true }),
                    );
                } else {
                    localStorage.removeItem("ytrc_portal_login");
                }
            } catch (e) {
                console.warn("Failed to store remember-me info", e);
            }

            onSuccess(data);
        } catch (err) {
            console.error("[login error]", err);
            setError(err.message || "ไม่สามารถเข้าสู่ระบบได้");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #eef2ff, #f5f5f5)",
            }}
        >
            <Center style={{ minHeight: "100vh" }}>
                <Container size={420} my={40}>
                    <Title
                        ta="center"
                        style={{
                            fontWeight: 600,
                            fontFamily: "Outfit, system-ui, -apple-system, sans-serif",
                        }}
                    >
                        Welcome back!
                    </Title>

                    <Text
                        size="sm"
                        c="dimmed"
                        ta="center"
                        mt={5}
                        style={{ fontFamily: "Outfit, var(--mantine-font-family)" }}
                    >
                        Sign in to{" "}
                        <Text component="span" fw={600}>
                            YTRC Portal Center
                        </Text>{" "}
                        to access internal applications
                    </Text>

                    <Paper
                        withBorder
                        shadow="sm"
                        p={22}
                        mt={30}
                        radius="md"
                        style={{ backgroundColor: "white" }}
                    >
                        {error && (
                            <Paper
                                p="xs"
                                radius="md"
                                withBorder
                                mb="sm"
                                style={{
                                    borderColor: "#f97373",
                                    backgroundColor: "rgba(248, 113, 113, 0.07)",
                                }}
                            >
                                <Text size="sm" c="red.7">
                                    {error}
                                </Text>
                            </Paper>
                        )}

                        <form onSubmit={handleSubmit}>
                            <Stack gap="sm">
                                <TextInput
                                    label="Email / Username"
                                    placeholder="apiwat.s หรือ apiwat@ytrc.co.th"
                                    required
                                    radius="md"
                                    value={identifier}
                                    onChange={(e) => {
                                        setIdentifier(e.target.value);
                                        setError("");
                                    }}
                                    autoComplete="username"
                                />
                                <PasswordInput
                                    label="Password"
                                    placeholder="Your password"
                                    required
                                    mt="xs"
                                    radius="md"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError("");
                                    }}
                                    autoComplete="current-password"
                                />

                                <Group justify="space-between" mt="lg">
                                    <Checkbox
                                        label="Remember me"
                                        size="xs"
                                        checked={remember}
                                        onChange={(event) =>
                                            setRemember(event.currentTarget.checked)
                                        }
                                    />
                                    <Button type="submit" loading={submitting} radius="md">
                                        {submitting ? "Signing in..." : "Sign in"}
                                    </Button>
                                </Group>
                            </Stack>
                        </form>

                        <Text size="xs" c="dimmed" mt="md" ta="right">
                            API: <Code fz={11}>{API_BASE}/auth/login</Code>
                        </Text>
                    </Paper>
                </Container>
            </Center>
        </Box>
    );
}