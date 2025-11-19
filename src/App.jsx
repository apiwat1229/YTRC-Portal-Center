// src/App.jsx
import { useState } from "react";
import LoginScreen from "./components/auth/LoginScreen";
import PortalCenterPage from "./components/portal/PortalCenterPage";
import TitleBar from "./components/window/TitleBar";

export default function App() {
  const [auth, setAuth] = useState(null);

  const handleLoginSuccess = (data) => {
    setAuth(data);
  };

  const handleLogout = () => {
    setAuth(null);
  };

  const content = !auth ? (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <LoginScreen onSuccess={handleLoginSuccess} />
    </div>
  ) : (
    <div style={{ flex: 1, minHeight: 0 }}>
      <PortalCenterPage auth={auth} onLogout={handleLogout} />
    </div>
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f3f4f6",
        overflow: "hidden",
      }}
    >
      <TitleBar />
      {content}
    </div>
  );
}