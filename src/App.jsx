// src/App.jsx
import { useState } from "react";
import LoginScreen from "./components/auth/LoginScreen";
import PortalCenterPage from "./components/portal/PortalCenterPage";

export default function App() {
  const [auth, setAuth] = useState(null);

  const handleLoginSuccess = (data) => {
    setAuth(data); // data.user, token ฯลฯ
  };

  const handleLogout = () => {
    setAuth(null);
  };

  if (!auth) {
    // ยังไม่ได้ล็อกอิน → แสดงหน้า Login อย่างเดียว
    return (
      <LoginScreen onSuccess={handleLoginSuccess} />
    );
  }

  // ล็อกอินแล้ว → แสดง PortalCenterPage
  return (
    <PortalCenterPage auth={auth} onLogout={handleLogout} />
  );
}