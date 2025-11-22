// src/App.jsx
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import LoginScreen from "./components/auth/LoginScreen";
import Error404Page from "./components/error/Error404Page";
import Error500Page from "./components/error/Error500Page";
import PortalCenterPage from "./components/portal/PortalCenterPage";

import {
  clearAuth,
  loadAuth,
  saveAuth,
} from "./components/auth/authStorage";

import { renderSystemRoutes } from "./routes/SystemRoutes";

// 👇 Mantine
import { Badge, MantineProvider, Stack, Text } from "@mantine/core";
import { ModalsProvider, modals } from "@mantine/modals";

// 👇 Tauri updater helpers
import {
  fetchAvailableUpdate,
  installUpdate,
} from "./tauri-updater";

export default function App() {
  // === เช็คอัปเดตตอนแอปเปิด + แสดง Mantine Modal ===
  useEffect(() => {
    async function runUpdateCheck() {
      const update = await fetchAvailableUpdate();
      if (!update) return;

      const version = update.version || "New version";
      const body = update.body || "This version includes improvements and bug fixes.";

      modals.openConfirmModal({
        title: (
          <Stack gap={4}>
            <Text fw={600} size="sm">
              พบอัปเดตใหม่สำหรับ YTRC Portal Center
            </Text>
            <Badge
              size="xs"
              radius="sm"
              variant="light"
              color="blue"
              style={{ width: "fit-content" }}
            >
              เวอร์ชัน {version}
            </Badge>
          </Stack>
        ),
        centered: true,
        radius: "md",
        children: (
          <Stack gap="xs">
            <Text size="sm">
              มีเวอร์ชันใหม่พร้อมให้อัปเดตแล้ว รายละเอียดเวอร์ชันนี้:
            </Text>
            <Text size="sm" style={{ whiteSpace: "pre-line" }}>
              {body}
            </Text>
            <Text size="xs" c="dimmed">
              คุณสามารถกดอัปเดตตอนนี้ ระบบจะดาวน์โหลดและรีสตาร์ตแอปอัตโนมัติ
            </Text>
          </Stack>
        ),
        labels: {
          confirm: "อัปเดตตอนนี้",
          cancel: "ไว้ทีหลัง",
        },
        confirmProps: {
          color: "blue",
          radius: "md",
        },
        cancelProps: {
          variant: "subtle",
          radius: "md",
        },
        onConfirm: async () => {
          try {
            // สามารถแทรก loading state แบบง่าย ๆ ด้วย alert หรือ toast ก็ได้
            await installUpdate(update);
          } catch (err) {
            console.error("[updater] install error:", err);
            modals.open({
              title: "อัปเดตไม่สำเร็จ",
              centered: true,
              children: (
                <Text size="sm">
                  ไม่สามารถติดตั้งอัปเดตได้ กรุณาลองใหม่อีกครั้ง หรือแจ้ง IT.
                </Text>
              ),
            });
          }
        },
        onCancel: () => {
          console.log("[updater] User chose to update later.");
        },
      });
    }

    runUpdateCheck();
  }, []);

  // ==== Auth state / error state ====
  const [auth, setAuth] = useState(() => loadAuth());
  const [appError, setAppError] = useState(null);

  const handleLoginSuccess = (data) => {
    setAuth(data);
    saveAuth(data);
  };

  const handleLogout = () => {
    clearAuth();
    setAuth(null);
  };

  return (
    <MantineProvider defaultColorScheme="light">
      <ModalsProvider>
        <BrowserRouter>
          {/* BG เดียวทั้งแอป (ใช้ร่วมกับ .app-bg ใน CSS) */}
          <div className="app-bg">
            <Routes>
              {/* ===== หน้า Login ===== */}
              <Route
                path="/login"
                element={
                  auth ? (
                    <Navigate to="/" replace />
                  ) : (
                    <div
                      style={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <LoginScreen onSuccess={handleLoginSuccess} />
                    </div>
                  )
                }
              />

              {/* ===== หน้า Portal Center หลัก (หลัง login) ===== */}
              <Route
                path="/"
                element={
                  auth ? (
                    <PortalCenterPage
                      auth={auth}
                      onLogout={handleLogout}
                      onError={setAppError}
                    />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              {/* ===== กลุ่ม /system (import จาก SystemRoutes.jsx) ===== */}
              {renderSystemRoutes({ auth, onLogout: handleLogout })}

              {/* ===== Error 500 ===== */}
              <Route
                path="/error"
                element={
                  <Error500Page
                    message={appError}
                    onRetry={() => {
                      window.location.href = "/";
                    }}
                  />
                }
              />

              {/* ===== 404 ===== */}
              <Route path="*" element={<Error404Page />} />
            </Routes>
          </div>
        </BrowserRouter>
      </ModalsProvider>
    </MantineProvider>
  );
}