// src/components/auth/LoginScreen.jsx
import {
    Badge,
    Box,
    Button,
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
import {
    IconActivity,
    IconLock,
    IconQrcode,
    IconShieldCheck,
    IconTruck,
    IconUser,
} from "@tabler/icons-react";
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

    // server status: checking | online | offline
    const [serverStatus, setServerStatus] = useState("checking");

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

    // เช็ค healthz จาก backend
    useEffect(() => {
        let ignore = false;

        async function checkHealth() {
            try {
                const url = `${API_BASE}/healthz`;
                console.log("[healthz] GET", url);
                const res = await fetch(url, { method: "GET", cache: "no-store" });

                if (!res.ok) {
                    throw new Error(`Healthz HTTP ${res.status}`);
                }

                const data = await res.json().catch(() => null);
                if (!ignore) {
                    if (data?.ok === true) {
                        setServerStatus("online");
                    } else {
                        setServerStatus("offline");
                    }
                }
            } catch (e) {
                console.warn("[healthz] error", e);
                if (!ignore) {
                    setServerStatus("offline");
                }
            }
        }

        setServerStatus("checking");
        checkHealth();

        return () => {
            ignore = true;
        };
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

    // mapping สี badge ตามสถานะ
    const serverBadgeColor =
        serverStatus === "online"
            ? "green"
            : serverStatus === "offline"
                ? "red"
                : "gray";

    const serverBadgeLabel =
        serverStatus === "online"
            ? "Online"
            : serverStatus === "offline"
                ? "Offline"
                : "Checking";

    const serverFooterLabel =
        serverStatus === "online"
            ? "Online"
            : serverStatus === "offline"
                ? "Offline"
                : "Checking...";

    return (
        <Box
            style={{
                width: "100vw",
                height: "100vh",
                backgroundColor: "#ffffff", // ✅ BG ขาวล้วน
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                boxSizing: "border-box",
                fontFamily:
                    "Outfit, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
        >
            {/* กล่องหลัก แบ่งซ้าย/ขวา */}
            <Paper
                withBorder
                shadow="xl"
                radius={12}
                p={0}
                style={{
                    width: "100%",
                    maxWidth: 960,
                    overflow: "hidden",
                    borderColor: "rgba(148,163,184,0.45)",
                    backgroundColor: "#ffffff", // ✅ การ์ดหลักพื้นขาว
                    display: "flex",
                    flexDirection: "row",
                }}
            >
                {/* ==== LEFT PANEL (Hero) ==== */}
                <Box
                    style={{
                        flex: 1.1,
                        padding: 24,
                        paddingRight: 18,
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                        borderRight: "1px solid rgba(226,232,240,1)",
                        background: "#ffffff", // ✅ พื้น panel ซ้ายขาว
                    }}
                >
                    <Group justify="space-between" align="center">
                        <Group gap={10}>
                            <Box
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 999,
                                    background:
                                        "radial-gradient(circle at 30% 30%, #eff6ff, #dbeafe)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow:
                                        "0 18px 40px -24px rgba(15,23,42,0.25)",
                                }}
                            >
                                <IconActivity
                                    size={22}
                                    color="#1d4ed8"
                                    stroke={1.8}
                                />
                            </Box>
                            <Stack gap={0} style={{ lineHeight: 1.1 }}>
                                <Text size="sm" fw={600} c="slate.800">
                                    YTRC Portal Center
                                </Text>
                                <Text size="xs" c="dimmed">
                                    Operations & Admin Suite
                                </Text>
                            </Stack>
                        </Group>

                        <Badge
                            size="xs"
                            radius={12}
                            variant="dot"
                            color={serverBadgeColor}
                        >
                            {serverBadgeLabel}
                        </Badge>
                    </Group>

                    <Box mt={10}>
                        <Title
                            order={2}
                            style={{
                                fontWeight: 700,
                                letterSpacing: "-0.04em",
                                color: "#0f172a",
                                marginBottom: 6,
                            }}
                        >
                            Welcome back,
                        </Title>
                        <Text size="sm" c="dimmed">
                            Single sign-on for{" "}
                            <b>Booking Queue, Truck Scale, QR System</b> and
                            more – designed for daily operations at YTRC.
                        </Text>
                    </Box>

                    <Stack gap={8} mt={8}>
                        <HeroBullet
                            icon={
                                <IconTruck
                                    size={15}
                                    stroke={1.7}
                                    color="#0f766e"
                                />
                            }
                            title="Gate & Logistics"
                            text="Manage supplier queues, truck check-ins and operations."
                            bg="rgba(13,148,136,0.06)"
                        />
                        <HeroBullet
                            icon={
                                <IconQrcode
                                    size={15}
                                    stroke={1.7}
                                    color="#1d4ed8"
                                />
                            }
                            title="QR Workflows"
                            text="Unified QR for gate, warehouse and production tracking."
                            bg="rgba(37,99,235,0.06)"
                        />
                        <HeroBullet
                            icon={
                                <IconShieldCheck
                                    size={15}
                                    stroke={1.7}
                                    color="#16a34a"
                                />
                            }
                            title="Secure Access"
                            text="Role-based permissions & audit logging for every critical action."
                            bg="rgba(22,163,74,0.06)"
                        />
                    </Stack>

                    <Divider
                        my="xs"
                        label={
                            <Text size="xs" c="dimmed">
                                Highlights
                            </Text>
                        }
                        labelPosition="left"
                        color="gray.3"
                    />

                    <Group gap={8} wrap="wrap">
                        <MiniPill label="Booking Queue" color="#38bdf8" />
                        <MiniPill label="Truck Scale" color="#a855f7" />
                        <MiniPill label="QR System" color="#22c55e" />
                        <MiniPill label="Suppliers DB" color="#f97316" />
                    </Group>

                    <Box mt="auto">
                        <Group justify="space-between" align="center">
                            <Text size="xs" c="dimmed">
                                Version: <Code fz={11}>{APP_VERSION}</Code>
                            </Text>
                            {/* <Text size="xs" c="dimmed">
                                Server:{" "}
                                <Code
                                    fz={11}
                                    c={
                                        serverStatus === "online"
                                            ? "green"
                                            : serverStatus === "offline"
                                                ? "red"
                                                : "gray"
                                    }
                                >
                                    {serverFooterLabel}
                                </Code>
                            </Text> */}
                        </Group>
                    </Box>
                </Box>

                {/* ==== RIGHT PANEL – Login Form ==== */}
                <Box
                    style={{
                        flex: 0.9,
                        padding: 24,
                        paddingLeft: 22,
                        backgroundColor: "#ffffff", // ✅ panel ขวาขาว
                    }}
                >
                    <Stack gap="md" h="100%">
                        {/* Avatar / Icon */}
                        <Box
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 999,
                                background:
                                    "radial-gradient(circle at 30% 30%, #e5e7eb, #cbd5f5)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 4,
                                boxShadow:
                                    "0 14px 30px -18px rgba(15,23,42,0.25)",
                            }}
                        >
                            <Box
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 999,
                                    border: "1px solid rgba(148,163,184,0.7)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#0f172a",
                                }}
                            >
                                <IconUser size={20} stroke={1.7} />
                            </Box>
                        </Box>

                        {/* Title + Subtitle */}
                        <Stack gap={2}>
                            <Title
                                order={3}
                                style={{
                                    fontWeight: 600,
                                    color: "#0f172a",
                                    letterSpacing: "-0.03em",
                                }}
                            >
                                Sign in to Portal
                            </Title>
                            <Text size="sm" c="dimmed">
                                Use your company account to access YTRC
                                applications.
                            </Text>
                        </Stack>

                        <Divider
                            my="xs"
                            color="gray.3"
                            label={
                                <Group gap={6}>
                                    <IconLock size={14} stroke={1.7} />
                                    <Text size="xs" c="dimmed">
                                        Secure login
                                    </Text>
                                </Group>
                            }
                            labelPosition="left"
                        />

                        {/* Error message */}
                        {error && (
                            <Paper
                                p="xs"
                                radius={12}
                                withBorder
                                mb="xs"
                                style={{
                                    borderColor: "#f97373",
                                    backgroundColor: "rgba(248,113,113,0.08)",
                                }}
                            >
                                <Text size="sm" c="red.7">
                                    {error}
                                </Text>
                            </Paper>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} style={{ marginTop: 4 }}>
                            <Stack gap="sm">
                                <TextInput
                                    label="Email or Username"
                                    placeholder="you@example.com หรือ username"
                                    required
                                    radius={12}
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
                                    radius={12}
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
                                            setRemember(
                                                event.currentTarget.checked,
                                            )
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
                                            color: "#2563eb",
                                            textDecoration: "none",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => {
                                            console.log(
                                                "[login] forgot password clicked",
                                            );
                                        }}
                                    >
                                        Forgot password?
                                    </Text>
                                </Group>

                                <Button
                                    type="submit"
                                    mt="md"
                                    radius={12}
                                    fullWidth
                                    color="blue"
                                    loading={submitting}
                                    style={{
                                        boxShadow:
                                            "0 16px 32px -18px rgba(37,99,235,0.65)",
                                    }}
                                >
                                    {submitting ? "Signing in..." : "Login"}
                                </Button>
                            </Stack>
                        </form>

                        <Box mt="auto">
                            <Text size="xs" c="dimmed">
                                By signing in, you agree to follow YTRC IT
                                policies and data security guidelines.
                            </Text>
                        </Box>
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
}

/* ===== Mini bullet ด้านซ้าย ===== */
function HeroBullet({ icon, title, text, bg }) {
    return (
        <Group gap={8} align="flex-start">
            <Box
                style={{
                    width: 26,
                    height: 26,
                    borderRadius: 999,
                    backgroundColor: bg || "rgba(148,163,184,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                {icon}
            </Box>
            <Stack gap={0}>
                <Text size="sm" fw={600} c="slate.800">
                    {title}
                </Text>
                <Text size="xs" c="dimmed">
                    {text}
                </Text>
            </Stack>
        </Group>
    );
}

/* ===== Mini pill component ด้านซ้ายล่าง ===== */
function MiniPill({ label, color }) {
    return (
        <Box
            style={{
                padding: "4px 10px",
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.6)",
                fontSize: 11,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                backgroundColor: "#ffffff", // ✅ pill พื้นขาว
            }}
        >
            <span
                style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    backgroundColor: color || "#38bdf8",
                }}
            />
            <span>{label}</span>
        </Box>
    );
}