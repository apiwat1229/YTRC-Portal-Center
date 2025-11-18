// src/App.jsx
import { useState } from "react";

// Admin / System
import PermissionManagerPage from "./components/admin/PermissionManagerPage";
import SystemMenuPortalPage from "./components/admin/SystemMenuPortalPage";

// Auth / Profile
import LoginScreen from "./components/auth/LoginScreen";
import ProfilePage from "./components/profile/ProfilePage";

// Contact center
import ContactPortalPage from "./components/contact/ContactPortalPage";

// Main portal
import PortalCenterPage from "./components/portal/PortalCenterPage";

/**
 * View states:
 * - "login"          : หน้าเข้าสู่ระบบ
 * - "portal"         : YTRC Portal Center (หน้าเลือกแอปใหญ่)
 * - "profile"        : หน้าโปรไฟล์
 * - "permissions"    : หน้า Permission Manager
 * - "contact-portal" : Portal ของ Contact Management
 * - "system-portal"  : System Menu & Administration Center
 */
export default function App() {
  const [auth, setAuth] = useState(null); // { access_token, refresh_token, user, token_type }
  const [view, setView] = useState("login");

  const handleLoginSuccess = (payload) => {
    setAuth(payload);
    setView("portal");
  };

  const handleLogout = () => {
    setAuth(null);
    setView("login");
  };

  // ---------- Routing แบบ manual ตามค่า view ----------

  // ยังไม่ได้ login หรืออยู่หน้า login
  if (!auth || view === "login") {
    return <LoginScreen onSuccess={handleLoginSuccess} />;
  }

  // หน้าโปรไฟล์
  if (view === "profile") {
    return (
      <ProfilePage
        auth={auth}
        onLogout={handleLogout}
        onBack={() => setView("portal")}
      />
    );
  }

  // หน้า Permission manager
  if (view === "permissions") {
    return (
      <PermissionManagerPage
        auth={auth}
        onLogout={handleLogout}
        onBack={() => setView("portal")}
      />
    );
  }

  // หน้า Contact Center portal
  if (view === "contact-portal") {
    return (
      <ContactPortalPage
        auth={auth}
        onLogout={handleLogout}
        onBack={() => setView("portal")}
      />
    );
  }

  // หน้า System Menu portal
  if (view === "system-portal") {
    return (
      <SystemMenuPortalPage
        auth={auth}
        onLogout={handleLogout}
        onBack={() => setView("portal")}
      />
    );
  }

  // ค่า default -> Main Portal Center
  return (
    <PortalCenterPage
      auth={auth}
      onLogout={handleLogout}
      onOpenProfile={() => setView("profile")}
      onOpenPermissions={() => setView("permissions")}
      onOpenContactPortal={() => setView("contact-portal")}
      onOpenSystemPortal={() => setView("system-portal")}
    />
  );
}