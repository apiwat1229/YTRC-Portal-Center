// src/components/common/StatusFooterBar.jsx
import { Button, Card, Group, Text, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconCpu, IconRefresh, IconServer } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { http } from "@/helpers/http";
import tauriConf from "../../../src-tauri/tauri.conf.json";

// ✅ helper เช็ค / ติดตั้งอัปเดต + เช็คว่าอยู่ใน Tauri จริงไหม
import {
    fetchAvailableUpdate,
    installUpdate,
    isTauriEnv,
} from "@/tauri-updater";

// version จาก tauri.conf.json
const APP_VERSION_FROM_TAURI = tauriConf?.version
    ? `v${tauriConf.version}`
    : "v0.1.0-stable";

// guard กันไม่ให้เช็คซ้ำซ้อน (ช่วยลดโอกาสยิงซ้ำจาก click spam หรือมี footer หลายตัว)
let isCheckingUpdateGlobal = false;

export default function StatusFooterBar({
    statusLabel = "Service status",
    version = APP_VERSION_FROM_TAURI,
    latency: initialLatency = "—",
    healthEndpoint = "/healthz",
    pollIntervalMs = 30000,
}) {
    const [status, setStatus] = useState("checking"); // checking | online | degraded | offline
    const [currentVersion, setCurrentVersion] = useState(version);
    const [latency, setLatency] = useState(initialLatency);
    const [label, setLabel] = useState(statusLabel);

    const [checkingUpdate, setCheckingUpdate] = useState(false);

    // -----------------------------
    // Health check / latency
    // -----------------------------
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

        // ping ครั้งแรก
        ping();

        if (pollIntervalMs > 0) {
            timer = setInterval(ping, pollIntervalMs);
        }

        return () => {
            cancelled = true;
            if (timer) clearInterval(timer);
        };
    }, [healthEndpoint, pollIntervalMs]);

    // สีสถานะ
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

    // -----------------------------
    // ปุ่ม Check for updates (manual)
    // -----------------------------
    const handleCheckUpdateClick = async () => {
        // ✅ ใช้ helper กลางจาก tauri-updater
        if (!isTauriEnv()) {
            modals.open({
                title: "Desktop updater only",
                children: (
                    <Text size="sm">
                        Auto-update ใช้ได้เฉพาะใน desktop app (Tauri) เท่านั้น
                    </Text>
                ),
            });
            return;
        }

        // กันไม่ให้ยิงซ้ำ (ทั้งใน component และกรณีมี footer ซ้ำ)
        if (checkingUpdate || isCheckingUpdateGlobal) {
            return;
        }

        setCheckingUpdate(true);
        isCheckingUpdateGlobal = true;

        try {
            const update = await fetchAvailableUpdate();

            // เผื่อมี modal ค้างอยู่ → เคลียร์ก่อน
            modals.closeAll();

            if (!update) {
                // ไม่มีอัปเดต → แจ้งครั้งเดียวพอ
                modals.open({
                    title: "No updates available",
                    children: (
                        <Text size="sm">
                            ตอนนี้คุณใช้เวอร์ชันล่าสุดแล้ว ({currentVersion})
                        </Text>
                    ),
                });
                return;
            }

            // มีอัปเดต → เปิด Confirm ให้ยืนยัน
            modals.openConfirmModal({
                title: `Update available (${update.version})`,
                centered: true,
                closeOnClickOutside: false,
                closeOnEscape: false,
                withCloseButton: false,
                children: (
                    <Text size="sm">
                        พบเวอร์ชันใหม่: <b>{update.version}</b>
                        <br />
                        ต้องการดาวน์โหลดและติดตั้งตอนนี้เลยหรือไม่?
                    </Text>
                ),
                labels: {
                    confirm: "Download & Install",
                    cancel: "Later",
                },
                confirmProps: {
                    color: "blue",
                },
                onConfirm: async () => {
                    try {
                        await installUpdate(update);
                    } catch (err) {
                        console.error("[installUpdate] error", err);
                        modals.open({
                            title: "Update failed",
                            children: (
                                <Text size="sm">
                                    ไม่สามารถติดตั้งอัปเดตได้:
                                    {" " + (err?.message || "Unknown error")}
                                </Text>
                            ),
                        });
                    }
                },
            });
        } catch (err) {
            console.error("[checkUpdate] error", err);
            modals.open({
                title: "Update check failed",
                children: (
                    <Text size="sm">
                        เช็คอัปเดตไม่สำเร็จ:
                        {" " + (err?.message || "Unknown error")}
                    </Text>
                ),
            });
        } finally {
            setCheckingUpdate(false);
            isCheckingUpdateGlobal = false;
        }
    };

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

                <Group gap="sm">
                    {/* ปุ่ม Check for updates */}
                    <Tooltip label="ตรวจสอบเวอร์ชันใหม่ของ Portal Desktop">
                        <Button
                            size="xs"
                            variant="light"
                            radius="xl"
                            leftSection={<IconRefresh size={14} />}
                            loading={checkingUpdate}
                            onClick={handleCheckUpdateClick}
                        >
                            {checkingUpdate ? "Checking..." : "Check for updates"}
                        </Button>
                    </Tooltip>

                    <Text size="xs" c="dimmed">
                        © 2025 YTRC. All rights reserved.
                    </Text>
                </Group>
            </Group>
        </Card>
    );
}