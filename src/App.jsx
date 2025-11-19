// src/App.jsx
import { useState } from "react";
import LoginScreen from "./components/auth/LoginScreen";
import PortalCenterPage from "./components/portal/PortalCenterPage"; // ถ้ามี
import TitleBar from "./components/window/TitleBar";

export default function App() {
  const [auth, setAuth] = useState(null);

  const handleLoginSuccess = (data) => {
    setAuth(data); // data.user, data.access_token ฯลฯ
  };

  const handleLogout = () => {
    setAuth(null);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* TitleBar ด้านบน */}
      <TitleBar />

      {/* เนื้อหาใต้ TitleBar */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!auth ? (
          // หน้า Login (อยู่กลางจอ)
          <LoginScreen onSuccess={handleLoginSuccess} />
        ) : (
          // หน้า Portal หลัก
          <PortalCenterPage auth={auth} onLogout={handleLogout} />
        )}
      </div>
    </div>
  );
}