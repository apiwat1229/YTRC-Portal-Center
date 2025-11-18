// src/App.jsx
import {
  AppShell,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Code,
  Container,
  Divider,
  Group,
  Kbd,
  Paper,
  PasswordInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useMemo, useState } from "react";

import {
  IconGridDots,
  IconPackages,
  IconQrcode,
  IconTools,
  IconUser,
} from "@tabler/icons-react";

// โหลดจาก .env (Vite)
const API_BASE =
  import.meta.env.VITE_TAURI_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8110/api";

console.log("[YTRC Portal Center] API_BASE =", API_BASE);

export default function App() {
  const [auth, setAuth] = useState(null); // { access_token, refresh_token, user, token_type }
  const [view, setView] = useState("login"); // 'login' | 'portal' | 'profile'

  const handleLoginSuccess = (payload) => {
    setAuth(payload);
    setView("portal");
  };

  const handleLogout = () => {
    setAuth(null);
    setView("login");
  };

  if (!auth || view === "login") {
    return <LoginScreen onSuccess={handleLoginSuccess} />;
  }

  if (view === "profile") {
    return <ProfilePage auth={auth} onLogout={handleLogout} onBack={() => setView("portal")} />;
  }

  // view === 'portal'
  return (
    <PortalCenterPage
      auth={auth}
      onLogout={handleLogout}
      onOpenProfile={() => setView("profile")}
    />
  );
}

/* =======================
 * Login Screen (light, แบบ AuthenticationTitle)
 * ======================= */
function LoginScreen({ onSuccess }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
      body.append("grant_type", "password"); // สำคัญสำหรับ OAuth2PasswordRequestForm

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
        } catch (_) {
          // ignore
        }
        throw new Error(detail);
      }

      const data = await res.json();
      console.log("[login] success:", data);
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
                  <Text size="xs" c="dimmed">
                    Internal use only
                  </Text>
                  <Button
                    type="submit"
                    loading={submitting}
                    radius="md"
                  >
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

/* =======================
 * Portal Center Page (Application cards)
 * ======================= */
function PortalCenterPage({ auth, onLogout, onOpenProfile }) {
  const { user } = auth || {};
  const [activeApp, setActiveApp] = useState(null); // 'qr' | 'maintenance' | 'stock' | null

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
            <IconGridDots size={20} />
            <Text fw={600}>YTRC Portal Center</Text>
          </Group>

          <Group gap="sm">
            <Text size="sm" c="dimmed">
              {displayName}
            </Text>
            <Button
              variant="subtle"
              size="xs"
              leftSection={<IconUser size={14} />}
              onClick={onOpenProfile}
            >
              Profile
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
          {/* Search + hint */}
          <Card withBorder radius="md" style={{ backgroundColor: "white" }}>
            <Group justify="space-between" align="flex-end">
              <Stack gap={4}>
                <Text fw={600} size="sm">
                  Search
                </Text>
                <Text size="xs" c="dimmed">
                  Search for applications, modules, or actions
                </Text>
              </Stack>
              <Group gap={4}>
                <Text size="xs" c="dimmed">
                  Shortcut
                </Text>
                <Kbd>Ctrl</Kbd>
                <Text size="xs">+</Text>
                <Kbd>K</Kbd>
              </Group>
            </Group>
          </Card>

          {/* Application cards เหมือน ActionsGrid แต่การ์ดใหญ่ขึ้น */}
          <Card
            withBorder
            radius="md"
            style={{ backgroundColor: "white" }}
          >
            <Group justify="space-between" mb="xs">
              <Text fw={600}>Applications</Text>
              <Text size="xs" c="dimmed">
                Back to all categories
              </Text>
            </Group>

            <Text size="xs" c="dimmed" mb="sm">
              เลือกระบบย่อยที่ต้องการใช้งานจาก YTRC Portal Center
            </Text>

            <SimpleGrid
              cols={{ base: 1, sm: 3 }}
              spacing="lg"
              mt="md"
            >
              <AppCardBig
                title="QR Code"
                description="Queue, booking tickets, truck receive QR and internal QR-based workflows."
                color="cyan"
                icon={IconQrcode}
                active={activeApp === "qr"}
                onClick={() => setActiveApp("qr")}
              />
              <AppCardBig
                title="แจ้งซ่อม"
                description="Maintenance requests, breakdown logging, CM/PM tracking for machines and equipment."
                color="orange"
                icon={IconTools}
                active={activeApp === "maintenance"}
                onClick={() => setActiveApp("maintenance")}
              />
              <AppCardBig
                title="ระบบ Stock"
                description="Inventory and warehouse management, stock levels, in-out transactions."
                color="green"
                icon={IconPackages}
                active={activeApp === "stock"}
                onClick={() => setActiveApp("stock")}
              />
            </SimpleGrid>

            <Divider my="md" />

            <Box>
              <Text size="xs" c="dimmed" mb={4}>
                Selected app:
              </Text>
              <Code fz={12}>
                {activeApp === "qr" && "QR Code — ระบบคิว / บัตรคิว / Ticket / Truck QR"}
                {activeApp === "maintenance" &&
                  "แจ้งซ่อม — ระบบ Maintenance Request / CM / PM"}
                {activeApp === "stock" &&
                  "ระบบ Stock — Inventory / Warehouse / การเบิก-รับสินค้า"}
                {!activeApp && "ยังไม่ได้เลือกแอปย่อย (คลิกที่การ์ดด้านบนเพื่อเริ่มใช้งาน)"}
              </Code>
            </Box>
          </Card>
        </Stack>
      </Container>
    </AppShell>
  );
}

/* =======================
 * Profile Page (แยกออกมาต่างหาก, โทนขาว)
 * ======================= */
function ProfilePage({ auth, onLogout, onBack }) {
  const { user, access_token, refresh_token } = auth || {};

  const displayName = useMemo(() => {
    if (!user) return "";
    return (
      user.display_name ||
      [user.first_name, user.last_name].filter(Boolean).join(" ") ||
      user.username ||
      user.email
    );
  }, [user]);

  const prettyDate = (dt) => {
    if (!dt) return "-";
    try {
      return new Date(dt).toLocaleString();
    } catch {
      return dt;
    }
  };

  if (!user) return null;

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
            <IconUser size={20} />
            <Text fw={600}>Profile</Text>
          </Group>

          <Group gap="sm">
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
        <Stack gap="md">
          {/* Profile main card */}
          <Card withBorder radius="lg" style={{ backgroundColor: "white" }}>
            <Group align="flex-start" gap="lg">
              <Box
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "999px",
                  background:
                    "linear-gradient(135deg, #3b82f6, #22c55e)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 28,
                  color: "white",
                }}
              >
                {displayName
                  .split(" ")
                  .map((x) => x[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </Box>

              <Stack gap={4} flex={1}>
                <Title order={3}>{displayName}</Title>
                <Text size="sm" c="dimmed">
                  {user.email}
                </Text>

                <Group gap={8} mt="xs">
                  {user.department && (
                    <Badge variant="light" color="teal">
                      Dept: {user.department}
                    </Badge>
                  )}
                  {user.position && (
                    <Badge variant="light" color="blue">
                      Position: {user.position}
                    </Badge>
                  )}
                  {user.role && (
                    <Badge variant="light" color="violet">
                      Role: {user.role}
                    </Badge>
                  )}
                  {user.status && (
                    <Badge variant="outline" color="yellow">
                      Status: {String(user.status).toUpperCase()}
                    </Badge>
                  )}
                </Group>
              </Stack>
            </Group>
          </Card>

          {/* Detail cards */}
          <Group align="flex-start" grow>
            <Card withBorder radius="lg" style={{ backgroundColor: "white" }}>
              <Title order={5} mb="xs">
                Account info
              </Title>
              <Divider mb="xs" />

              <InfoRow label="Username" value={user.username || "-"} />
              <InfoRow label="User ID" value={user._id || user.id || "-"} />
              <InfoRow label="HOD User" value={user.hod_user_id || "-"} />
            </Card>

            <Card withBorder radius="lg" style={{ backgroundColor: "white" }}>
              <Title order={5} mb="xs">
                Activity
              </Title>
              <Divider mb="xs" />

              <InfoRow label="Created at" value={prettyDate(user.created_at)} />
              <InfoRow label="Updated at" value={prettyDate(user.updated_at)} />
              <InfoRow label="Last login" value={prettyDate(user.last_login)} />
            </Card>
          </Group>

          {/* Tokens (dev only) */}
          <Card
            withBorder
            radius="lg"
            style={{
              backgroundColor: "white",
              borderStyle: "dashed",
              borderColor: "rgba(148, 163, 184, 0.8)",
            }}
          >
            <Title order={5} mb="xs">
              Tokens (dev only)
            </Title>
            <Text size="xs" c="dimmed" mb="xs">
              ใช้สำหรับ debug ระหว่างพัฒนาเท่านั้น — production อาจซ่อนส่วนนี้
            </Text>

            <Stack gap="xs">
              <TokenRow label="Access token" value={access_token} />
              <TokenRow label="Refresh token" value={refresh_token} />
            </Stack>
          </Card>
        </Stack>
      </Container>
    </AppShell>
  );
}

/* =======================
 * Small Components
 * ======================= */
function InfoRow({ label, value }) {
  return (
    <Group justify="space-between" gap="xs" mb={4}>
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="sm">{value || "-"}</Text>
    </Group>
  );
}

function TokenRow({ label, value }) {
  return (
    <Box>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Code
        block
        fz={11}
        mt={2}
        style={{
          maxWidth: "100%",
          overflowX: "auto",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </Code>
    </Box>
  );
}

/**
 * การ์ดแอปแบบใหญ่ (inspired by ActionsGrid แต่ใหญ่กว่า)
 */
function AppCardBig({ title, description, color, icon: Icon, active, onClick }) {
  return (
    <Card
      radius="md"
      withBorder
      onClick={onClick}
      style={{
        cursor: "pointer",
        padding: "18px 16px",
        backgroundColor: active ? "rgba(219, 234, 254, 0.7)" : "white",
        borderColor: active ? "rgba(59, 130, 246, 0.9)" : "rgba(226,232,240,1)",
        transition: "transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease",
      }}
      shadow={active ? "md" : "xs"}
    >
      <Group align="flex-start" gap="md" wrap="nowrap">
        <Box
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            backgroundColor: `var(--mantine-color-${color}-0, #eff6ff)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            size={24}
            color={`var(--mantine-color-${color}-6, #2563eb)`}
          />
        </Box>

        <Stack gap={4} style={{ flex: 1 }}>
          <Group justify="space-between" align="flex-start">
            <Text fw={600} size="sm">
              {title}
            </Text>
            <Badge
              variant={active ? "filled" : "light"}
              color={color}
              radius="lg"
              size="xs"
            >
              {active ? "Selected" : "Available"}
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