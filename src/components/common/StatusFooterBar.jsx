// src/components/common/StatusFooterBar.jsx
import { http } from "@/helpers/http";
import { Card, Group, Text } from "@mantine/core";
import { IconCpu, IconServer } from "@tabler/icons-react";
import { useEffect, useState } from "react";

// ✅ ดึงเวอร์ชันจาก tauri.conf.json
// ระวัง path ให้ตรงกับโครงสร้างโปรเจกต์จริง ๆ
import tauriConf from "../../../src-tauri/tauri.conf.json";

// ใน tauri.conf.json ใช้ field "version" ด้านบนสุด
// ถ้าอยากให้มีตัว v นำหน้า → ค่อยเติมเอง
const APP_VERSION_FROM_TAURI = tauriConf?.version
    ? `v${tauriConf.version}` // จะได้ v0.1.0
    : "v.0.1.0-stable";

export default function StatusFooterBar({
    statusLabel = "Service status",
    version = APP_VERSION_FROM_TAURI, // ใช้ค่าจาก Tauri เป็นค่าเริ่มต้น
    latency: initialLatency = "—",
    healthEndpoint = "/healthz", // ตรงกับ https://database-system.ytrc.co.th/api/healthz
    pollIntervalMs = 30000,
}) {
    const [status, setStatus] = useState("checking"); // checking | online | degraded | offline
    const [currentVersion, setCurrentVersion] = useState(version);
    const [latency, setLatency] = useState(initialLatency);
    const [label, setLabel] = useState(statusLabel);

    useEffect(() => {
        let cancelled = false;
        let timer;

        const ping = async () => {
            const start = performance.now ? performance.now() : Date.now();
            try {
                const resp = await http.get(healthEndpoint);
                const end = performance.now ? performance.now() : Date.now();
                const ms = Math.round(end - start);

                if (cancelled) return;

                setLatency(`${ms}ms`);

                const data = resp?.data || {};

                // /healthz ตอนนี้ส่ง { ok: true, api: "api" }
                if (
                    data.ok === true ||
                    data.status === "ok" ||
                    data.status === "healthy"
                ) {
                    setStatus("online");
                    setLabel("Service online");
                } else {
                    setStatus("degraded");
                    setLabel("Service responding");
                }

                // ถ้าวันหนึ่ง BE ส่ง version กลับมา → ให้มีสิทธิ์ override
                if (data.app_version || data.version) {
                    setCurrentVersion(data.app_version || data.version);
                } else {
                    setCurrentVersion(APP_VERSION_FROM_TAURI);
                }
            } catch (err) {
                if (cancelled) return;
                console.error("[StatusFooterBar] health check error:", err);
                setStatus("offline");
                setLabel("Service offline");
                setLatency("—");
            }
        };

        // ping ครั้งแรกตอน mount
        ping();

        // ตั้ง interval ถ้ากำหนด
        if (pollIntervalMs > 0) {
            timer = setInterval(ping, pollIntervalMs);
        }

        return () => {
            cancelled = true;
            if (timer) clearInterval(timer);
        };
    }, [healthEndpoint, pollIntervalMs]);

    // เลือกสีตามสถานะ
    let statusColor = "#a1a1aa";
    let statusShadow = "0 0 6px rgba(148,163,184,0.6)";

    if (status === "online") {
        statusColor = "#22c55e";
        statusShadow = "0 0 8px #22c55e";
    } else if (status === "degraded") {
        statusColor = "#f59e0b";
        statusShadow = "0 0 8px #f59e0b";
    } else if (status === "offline") {
        statusColor = "#ef4444";
        statusShadow = "0 0 8px #ef4444";
    }

    return (
        <Card
            withBorder
            padding="xs"
            radius="md"
            bg="rgba(255,255,255,0.7)"
            style={{ backdropFilter: "blur(8px)" }}
        >
            <Group justify="space-between">
                <Group gap="xl">
                    <Group gap={6}>
                        <div
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: statusColor,
                                boxShadow: statusShadow,
                            }}
                        />
                        <Text size="xs" fw={600} c="dimmed">
                            {label}
                        </Text>
                    </Group>

                    <Group gap={6}>
                        <IconServer size={14} color="#94a3b8" />
                        <Text size="xs" fw={600} c="dimmed">
                            {currentVersion}
                        </Text>
                    </Group>

                    <Group gap={6}>
                        <IconCpu size={14} color="#94a3b8" />
                        <Text size="xs" fw={600} c="dimmed">
                            Latency: {latency}
                        </Text>
                    </Group>
                </Group>

                <Text size="xs" c="dimmed">
                    © 2025 YTRC. All rights reserved.
                </Text>
            </Group>
        </Card>
    );
}