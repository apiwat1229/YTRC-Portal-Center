// src/components/auth/LoginScreen.jsx
import {
    Anchor,
    Box,
    Button,
    Checkbox,
    Container,
    Divider,
    Group,
    Image,
    Paper,
    PasswordInput,
    Stack,
    Text,
    TextInput,
    Title,
    Transition
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
    IconLock,
    IconMail,
    IconX
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import logoLight from "../../assets/logo-light.png";

// โหลดจาก .env (Vite)
const API_BASE =
    import.meta.env.VITE_TAURI_API_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8110/api";

// เวอร์ชันของแอป (กำหนดใน .env: VITE_APP_VERSION=1.0.0)
const APP_VERSION = import.meta.env.VITE_APP_VERSION || "v0.1.0";

export default function LoginScreen({ onSuccess }) {
    const [serverStatus, setServerStatus] = useState("checking");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    const form = useForm({
        initialValues: {
            identifier: "",
            password: "",
            remember: false,
        },

        validate: {
            identifier: (value) => (value ? null : "Please enter your email or username"),
            password: (value) => (value ? null : "Password is required"),
        },
    });

    // โหลดค่าที่เคย remember ไว้
    useEffect(() => {
        setMounted(true);
        try {
            const saved = localStorage.getItem("ytrc_portal_login");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed?.identifier) {
                    form.setValues({
                        identifier: parsed.identifier,
                        remember: true,
                    });
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
                const res = await fetch(url, { method: "GET", cache: "no-store" });
                if (!res.ok) throw new Error(`Healthz HTTP ${res.status}`);
                const data = await res.json().catch(() => null);
                if (!ignore) {
                    setServerStatus(data?.ok === true ? "online" : "offline");
                }
            } catch (e) {
                if (!ignore) setServerStatus("offline");
            }
        }
        setServerStatus("checking");
        checkHealth();
        return () => { ignore = true; };
    }, []);

    const handleSubmit = async (values) => {
        setLoading(true);
        setError("");

        try {
            const body = new URLSearchParams();
            body.append("username", values.identifier.trim());
            body.append("password", values.password);
            body.append("grant_type", "password");

            const url = `${API_BASE}/auth/login`;
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
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

            // Remember me logic
            try {
                if (values.remember) {
                    localStorage.setItem("ytrc_portal_login", JSON.stringify({
                        identifier: values.identifier.trim(),
                        remember: true,
                    }));
                } else {
                    localStorage.removeItem("ytrc_portal_login");
                }
            } catch (e) {
                console.warn("Failed to store remember-me info", e);
            }

            onSuccess(data);
        } catch (err) {
            console.error("[login error]", err);
            setError(err.message || "Unable to sign in");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box style={{ width: "100vw", height: "100vh", display: "flex", overflow: "hidden", backgroundColor: "#f8fafc", margin: 0, padding: 0 }}>
            <style>
                {`
                    @keyframes float {
                        0% { transform: translate(0, 0) rotate(0deg); }
                        33% { transform: translate(30px, -50px) rotate(10deg); }
                        66% { transform: translate(-20px, 20px) rotate(-5deg); }
                        100% { transform: translate(0, 0) rotate(0deg); }
                    }
                    @keyframes pulse-glow {
                        0% { opacity: 0.4; transform: scale(1); }
                        50% { opacity: 0.6; transform: scale(1.1); }
                        100% { opacity: 0.4; transform: scale(1); }
                    }
                    .animate-float-slow { animation: float 20s ease-in-out infinite; }
                    .animate-float-medium { animation: float 15s ease-in-out infinite reverse; }
                    .animate-pulse-glow { animation: pulse-glow 8s ease-in-out infinite; }
                `}
            </style>

            {/* Left Side - Hero Section */}
            <Box
                visibleFrom="md"
                style={{
                    flex: 1,
                    position: "relative",
                    backgroundColor: "#0f172a",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "4rem",
                    overflow: "hidden"
                }}
            >
                {/* Decorative Background Elements */}
                <div className="animate-float-slow" style={{
                    position: "absolute",
                    top: "-20%",
                    left: "-20%",
                    width: "80%",
                    height: "80%",
                    background: "radial-gradient(circle, rgba(56,189,248,0.25) 0%, rgba(15,23,42,0) 70%)",
                    filter: "blur(80px)",
                    zIndex: 0,
                    borderRadius: "50%"
                }} />
                <div className="animate-float-medium" style={{
                    position: "absolute",
                    bottom: "-10%",
                    right: "-10%",
                    width: "70%",
                    height: "70%",
                    background: "radial-gradient(circle, rgba(168,85,247,0.25) 0%, rgba(15,23,42,0) 70%)",
                    filter: "blur(90px)",
                    zIndex: 0,
                    borderRadius: "50%"
                }} />
                <div className="animate-pulse-glow" style={{
                    position: "absolute",
                    top: "40%",
                    left: "40%",
                    width: "40%",
                    height: "40%",
                    background: "radial-gradient(circle, rgba(34,197,94,0.1) 0%, rgba(15,23,42,0) 70%)",
                    filter: "blur(100px)",
                    zIndex: 0,
                    borderRadius: "50%"
                }} />

                {/* Content with Staggered Entrance */}
                <Box style={{ position: "relative", zIndex: 1, color: "white" }}>
                    <Transition mounted={mounted} transition="slide-right" duration={600} timingFunction="ease">
                        {(styles) => (
                            <Box style={styles} mb="xl">
                                <Image
                                    src={logoLight}
                                    w={180}
                                    fit="contain"
                                    alt="YTRC Portal Logo"
                                    style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))" }}
                                />
                            </Box>
                        )}
                    </Transition>

                    <Transition mounted={mounted} transition="slide-right" duration={600} timingFunction="ease" delay={100}>
                        {(styles) => (
                            <Title order={1} style={{ ...styles, fontSize: "3.5rem", lineHeight: 1.1, marginBottom: "1.5rem", fontWeight: 800, letterSpacing: "-1.5px" }}>
                                Streamline your <br />
                                <span style={{
                                    background: "linear-gradient(to right, #60a5fa, #a855f7, #34d399)",
                                    backgroundSize: "200% auto",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    animation: "pulse-glow 5s infinite"
                                }}>Operations</span>
                            </Title>
                        )}
                    </Transition>

                    <Transition mounted={mounted} transition="slide-right" duration={600} timingFunction="ease" delay={200}>
                        {(styles) => (
                            <Text size="lg" c="dimmed" style={{ ...styles, maxWidth: 500, lineHeight: 1.6 }}>
                                The central hub for Booking Queue, Truck Scale, and QR Systems.
                                Secure, fast, and reliable access for all your daily tasks.
                            </Text>
                        )}
                    </Transition>

                    <Transition mounted={mounted} transition="fade" duration={800} timingFunction="ease" delay={400}>
                        {(styles) => (
                            <Group mt={60} gap="xl" style={styles}>
                                <Stat label="Uptime" value="99.9%" />
                                <Divider orientation="vertical" color="rgba(255,255,255,0.1)" />
                                <Stat label="Active Users" value="2k+" />
                                <Divider orientation="vertical" color="rgba(255,255,255,0.1)" />
                                <Stat label="Version" value={APP_VERSION} />
                            </Group>
                        )}
                    </Transition>
                </Box>
            </Box>

            {/* Right Side - Login Form */}
            <Box
                style={{
                    flex: "0 0 550px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "3rem",
                    backgroundColor: "white",
                    position: "relative"
                }}
            >
                <Container size="xs" w="100%">
                    <Stack gap={30}>
                        <Box>
                            <Title order={2} style={{ fontSize: "2rem", fontWeight: 700, color: "#1e293b", letterSpacing: "-0.5px" }}>
                                Welcome back
                            </Title>
                            <Text c="dimmed" mt={5}>
                                Please enter your details to sign in.
                            </Text>
                        </Box>

                        {error && (
                            <Paper
                                withBorder
                                p="sm"
                                radius="md"
                                style={{
                                    backgroundColor: "#fef2f2",
                                    borderColor: "#fecaca",
                                    color: "#b91c1c",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.75rem"
                                }}
                            >
                                <IconX size={18} />
                                <Text size="sm" fw={500}>{error}</Text>
                            </Paper>
                        )}

                        <form onSubmit={form.onSubmit(handleSubmit)}>
                            <Stack gap="md">
                                <TextInput
                                    size="md"
                                    radius="md"
                                    label="Email or Username"
                                    placeholder="Enter your email"
                                    leftSection={<IconMail size={18} stroke={1.5} />}
                                    {...form.getInputProps("identifier")}
                                    styles={{
                                        input: {
                                            backgroundColor: "#f8fafc",
                                            border: "1px solid #e2e8f0",
                                            "&:focus": { borderColor: "#3b82f6" }
                                        }
                                    }}
                                />

                                <PasswordInput
                                    size="md"
                                    radius="md"
                                    label="Password"
                                    placeholder="••••••••"
                                    leftSection={<IconLock size={18} stroke={1.5} />}
                                    {...form.getInputProps("password")}
                                    styles={{
                                        input: {
                                            backgroundColor: "#f8fafc",
                                            border: "1px solid #e2e8f0",
                                            "&:focus": { borderColor: "#3b82f6" }
                                        }
                                    }}
                                />

                                <Group justify="space-between" mt={5}>
                                    <Checkbox
                                        label="Remember me"
                                        size="sm"
                                        {...form.getInputProps("remember", { type: "checkbox" })}
                                    />
                                    <Anchor component="button" type="button" size="sm" c="blue" fw={500}>
                                        Forgot password?
                                    </Anchor>
                                </Group>

                                <Button
                                    type="submit"
                                    fullWidth
                                    size="md"
                                    radius="md"
                                    loading={loading}
                                    color="blue"
                                    style={{
                                        marginTop: "1rem",
                                        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                                        transition: "transform 0.2s",
                                        "&:hover": { transform: "translateY(-1px)" }
                                    }}
                                >
                                    Sign in
                                </Button>
                            </Stack>
                        </form>
                    </Stack>

                    <Group justify="center" mt={50}>
                        <Text size="xs" c="dimmed">
                            Server Status:
                            <Text
                                span
                                fw={600}
                                ml={6}
                                c={serverStatus === "online" ? "green" : serverStatus === "offline" ? "red" : "orange"}
                            >
                                {serverStatus.toUpperCase()}
                            </Text>
                        </Text>
                    </Group>
                </Container>
            </Box>
        </Box>
    );
}

function Stat({ label, value }) {
    return (
        <Box>
            <Text size="xl" fw={700} style={{ lineHeight: 1 }}>{value}</Text>
            <Text size="xs" c="dimmed" style={{ textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 4 }}>{label}</Text>
        </Box>
    );
}