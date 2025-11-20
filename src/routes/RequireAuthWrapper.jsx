// src/routes/RequireAuthWrapper.jsx
import { Navigate, useLocation } from "react-router-dom";

/**
 * หุ้ม route ที่ต้อง login ให้ใช้ได้เฉพาะตอนมี auth เท่านั้น
 */
export default function RequireAuth({ auth, children }) {
    const location = useLocation();

    if (!auth) {
        // ยังไม่ login → เด้งไป /login พร้อมจำ path เดิมเผื่อใช้ต่อ
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}