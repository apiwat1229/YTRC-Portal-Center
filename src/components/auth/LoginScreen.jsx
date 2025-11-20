// src/components/auth/LoginScreen.jsx
import {
    Box,
    Button,
    Center,
    Checkbox,
    Code,
    Divider,
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

// เวอร์ชันของแอป (กำหนดใน .env: VITE_APP_VERSION=1.0.0)
const APP_VERSION = import.meta.env.VITE_APP_VERSION || "v0.1.0";

console.log("[YTRC Portal Center] API_BASE =", API_BASE);
console.log("[YTRC Portal Center] APP_VERSION =", APP_VERSION);

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
                        JSON.stringify({
                            identifier: identifier.trim(),
                            remember: true,
                        }),
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
        // กล่องใหญ่สุด: พื้นหลังทั้งหน้า + จัดฟอร์มให้อยู่กลางจอ
        <Box
            style={{
                width: "100vw",
                height: "100vh",
                backgroundColor: "#f3f4f6", // เทาอ่อนแบบในภาพ
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
            }}
        >
            {/* การ์ด Login */}
            <Paper
                withBorder
                shadow="xl"
                radius={24}
                p={28}
                style={{
                    width: 420,
                    maxWidth: "100vw",
                    backgroundColor: "#ffffff",
                }}
            >
                <Stack gap="md">
                    {/* Avatar กลมด้านบน */}
                    <Center>
                        <Box
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: "999px",
                                background:
                                    "radial-gradient(circle at 30% 30%, #f4f4f5, #e5e7eb)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Box
                                style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: "999px",
                                    border: "1px solid rgba(148, 163, 184, 0.6)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 22,
                                    color: "#4b5563",
                                }}
                            >
                                <span>👤</span>
                            </Box>
                        </Box>
                    </Center>

                    {/* Title + Subtitle */}
                    <Box style={{ textAlign: "center" }}>
                        <Title
                            order={3}
                            style={{
                                fontWeight: 600,
                                fontFamily:
                                    "Outfit, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                            }}
                        >
                            Login to your account
                        </Title>
                        <Text size="sm" c="dimmed" mt={4}>
                            Enter your details to login.
                        </Text>
                    </Box>

                    <Divider my="xs" />

                    {/* Error message */}
                    {error && (
                        <Paper
                            p="xs"
                            radius="md"
                            withBorder
                            mb="xs"
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

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <Stack gap="sm">
                            <TextInput
                                label="Email Address"
                                placeholder="you@example.com หรือ apiwat.s"
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
                                radius="md"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError("");
                                }}
                                autoComplete="current-password"
                            />

                            <Group justify="space-between" mt="xs">
                                <Checkbox
                                    label="Keep me logged in"
                                    size="xs"
                                    checked={remember}
                                    onChange={(event) =>
                                        setRemember(event.currentTarget.checked)
                                    }
                                />
                                <Text
                                    component="button"
                                    type="button"
                                    size="xs"
                                    style={{
                                        border: "none",
                                        padding: 0,
                                        background: "none",
                                        color: "#4b5563",
                                        textDecoration: "underline",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        console.log("[login] forgot password clicked");
                                    }}
                                >
                                    Forgot password?
                                </Text>
                            </Group>

                            {/* ปุ่มใช้สีเดิม (blue) */}
                            <Button
                                type="submit"
                                mt="md"
                                radius={999}
                                fullWidth
                                color="blue"
                                loading={submitting}
                            >
                                {submitting ? "Signing in..." : "Login"}
                            </Button>
                        </Stack>
                    </form>

                    {/* Footer: แสดง Version ของแอป */}
                    <Text
                        size="xs"
                        c="dimmed"
                        mt="sm"
                        ta="center"
                        style={{ marginTop: 16 }}
                    >
                        Version: <Code fz={11}>{APP_VERSION}</Code>
                    </Text>
                </Stack>
            </Paper>
        </Box>
    );
}