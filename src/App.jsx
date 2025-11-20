// src/App.jsx
import { useState } from "react";
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

import { renderSystemRoutes } from "./routes/SystemRoutes"; // 👈 ใช้ฟังก์ชันนี้

export default function App() {
  // อ่านค่าเริ่มต้นจาก localStorage (กันหลุด session ตอน Reload)
  const [auth, setAuth] = useState(() => loadAuth());
  const [appError, setAppError] = useState(null);

  // login สำเร็จ
  const handleLoginSuccess = (data) => {
    setAuth(data);
    saveAuth(data); // ✅ เก็บ session ลง localStorage
  };

  // logout
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