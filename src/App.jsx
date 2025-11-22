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

// Mantine UI (ใช้แค่ components ไม่ต้องห่อ Provider ในไฟล์นี้แล้ว)
import { Badge, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";

// Tauri updater helpers
import {
  fetchAvailableUpdate,
  installUpdate,
} from "./tauri-updater";

// --- กัน useEffect เช็คอัปเดตยิงซ้ำใน process เดียวกัน (เช่น StrictMode / HMR) ---
let hasRunInitialUpdateCheck = false;

export default function App() {
  // ===== Auth state / error state =====
  const [auth, setAuth] = useState(() => loadAuth());
  const [appError, setAppError] = useState(null);

  // ===== เช็คอัปเดตตอนแอปเปิด (เฉพาะใน Tauri) =====
  useEffect(() => {
    // ป้องกันไม่ให้เช็คซ้ำใน process เดียว
    if (hasRunInitialUpdateCheck) {
      return;
    }
    hasRunInitialUpdateCheck = true;

    async function runUpdateCheck() {
      // ถ้าไม่ใช่ Tauri (เช่น เปิดผ่าน browser) ให้ข้ามไปเลย
      if (
        typeof window === "undefined" ||
        !("__TAURI_INTERNALS__" in window)
      ) {
        console.log("[updater] Not running inside Tauri, skip initial check.");
        return;
      }

      const update = await fetchAvailableUpdate();
      if (!update) return;

      const version = update.version || "New version";
      const body =
        update.body ||
        "This version includes improvements and bug fixes.";

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

  // ===== login สำเร็จ =====
  const handleLoginSuccess = (data) => {
    setAuth(data);
    saveAuth(data); // เก็บ session ลง localStorage
  };

  // ===== logout =====
  const handleLogout = () => {
    clearAuth();
    setAuth(null);
  };

  return (
    <BrowserRouter>
      {/* BG เดียวทั้งแอป (ใช้ร่วมกับ .app-bg ใน CSS) */}
      <div className="app-bg">
        <Routes>
          {/* ===== หน้า Login ===== */}
          <Route
            path="/login"
            element={
              auth ? (
                // ถ้า login แล้วแต่ดันเข้าหน้า /login → เด้งกลับไป /
                <Navigate to="/" replace />
              ) : (
                // ใช้ flex center ให้ Login อยู่กลางจอ แต่ BG ใช้จาก .app-bg
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

          {/* ===== Error 500 (แสดง error กลาง ๆ) ===== */}
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

          {/* ===== 404: path ที่ไม่ตรงอะไรเลย ===== */}
          <Route path="*" element={<Error404Page />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}