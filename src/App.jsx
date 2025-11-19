// src/App.jsx
import { useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import SystemMenuPortalPage from "./components/admin/SystemMenuPortalPage";
import UsersPage from "./components/admin/users/UsersPage";
import LoginScreen from "./components/auth/LoginScreen";
import Error404Page from "./components/error/Error404Page";
import Error500Page from "./components/error/Error500Page";
import PortalCenterPage from "./components/portal/PortalCenterPage";

import {
  clearAuth,
  loadAuth,
  saveAuth,
} from "./components/auth/authStorage";

/**
 * หุ้ม route ที่ต้อง login ให้ใช้ได้เฉพาะตอนมี auth เท่านั้น
 */
function RequireAuth({ auth, children }) {
  const location = useLocation();

  if (!auth) {
    // ยังไม่ login → เด้งไป /login พร้อมจำ path เดิมเผื่อใช้ต่อ
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * App หลัก
 */
export default function App() {
  // อ่านค่าเริ่มต้นจาก localStorage (กันหลุด session ตอนกด Reload)
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
      {/* ✅ BG เดียวทั้งแอป (ใช้ร่วมกับ .app-bg ใน CSS) */}
      <div className="app-bg">
        <Routes>
          {/* หน้า Login */}
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

          {/* หน้า Portal (ต้อง login) */}
          <Route
            path="/"
            element={
              <RequireAuth auth={auth}>
                <PortalCenterPage
                  auth={auth}
                  onLogout={handleLogout}
                // ถ้าอยากให้หน้าใน portal ส่ง error กลาง → setAppError ได้
                // onError={setAppError}
                />
              </RequireAuth>
            }
          />

          {/* หน้า System Menu (ต้อง login) */}
          <Route
            path="/system"
            element={
              <RequireAuth auth={auth}>
                <SystemMenuPortalPage
                  auth={auth}
                  onBack={() => {
                    // กลับไปหน้า Portal
                    if (window.history.length > 1) {
                      window.history.back();
                    } else {
                      window.location.href = "/";
                    }
                  }}
                />
              </RequireAuth>
            }
          />

          <Route
            path="/system/users"
            element={
              <RequireAuth auth={auth}>
                <UsersPage
                  auth={auth}
                  onLogout={handleLogout}
                  onBack={() => {
                    // กลับไปหน้า System Menu
                    window.history.length > 1
                      ? window.history.back()
                      : (window.location.href = "/system");
                  }}
                />
              </RequireAuth>
            }
          />

          {/* Error 500 (เอาไว้โยน error กลาง ๆ มาแสดง) */}
          <Route
            path="/error"
            element={
              <Error500Page
                message={appError}
                onRetry={() => {
                  // ดีฟอลต์: reload กลับหน้าแรก
                  window.location.href = "/";
                }}
              />
            }
          />

          {/* 404: path ที่ไม่แมตช์อะไรเลย */}
          <Route path="*" element={<Error404Page />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}