// src/routes/SystemRoutes.jsx
import { Navigate, Route } from "react-router-dom";

import SystemMenuPortalPage from "../components/system/SystemMenuPortalPage";

import UserEditorPage from "../components/admin/users/UserEditorPage";
import UsersPage from "../components/admin/users/UsersPage";

import BookingQueuePage from "@/components/booking/BookingQueuePage";
import RubberTypeEditorPage from "../components/admin/rubbertypes/RubberTypeEditorPage";
import RubberTypesPage from "../components/admin/rubbertypes/RubberTypesPage";
import SupplierEditorPage from "../components/admin/suppliers/SupplierEditorPage";
import SuppliersPage from "../components/admin/suppliers/SuppliersPage";

// ✅ Truck Scale main page (มี Tabs ด้านใน)
import TruckScalePage from "@/components/truckscale/TruckScalePage";

// ✅ QR System main portal
import QrPortalPage from "@/components/qr/QrPortalPage";

// ✅ ใช้ตัวเดียวกับ PortalCenterPage
import { can } from "../components/auth/permission";

/**
 * helper เล็ก ๆ สำหรับห่อ element ให้ต้องล็อกอินก่อน
 */
const requireAuthElement = (auth, element) => {
    if (!auth) {
        return <Navigate to="/login" replace />;
    }
    return element;
};

/**
 * ฟังก์ชันนี้จะถูกเรียกจาก App.jsx แล้วไปใส่ผลลัพธ์ไว้ใน <Routes>
 *
 * ใน App.jsx:
 *   {renderSystemRoutes({ auth, onLogout: handleLogout })}
 */
export function renderSystemRoutes({ auth, onLogout }) {
    const user = auth?.user;

    return (
        <>
            {/* ====== System Menu (หน้าแรกของ /system) ====== */}
            <Route
                path="/system"
                element={requireAuthElement(
                    auth,
                    <SystemMenuPortalPage
                        auth={auth}
                        onLogout={onLogout}
                        // กด Back จาก header panel → กลับไป Portal Center (/)
                        onBack={() => {
                            if (window.history.length > 1) {
                                window.history.back();
                            } else {
                                window.location.href = "/";
                            }
                        }}
                        // ถ้ายังไม่มี notification page ก็ส่ง function เปล่า ๆ ไปก่อน
                        onNotificationsClick={() => { }}
                        notificationsCount={0}
                    />,
                )}
            />

            {/* ====== Users Management ====== */}
            <Route
                path="/system/users"
                element={requireAuthElement(
                    auth,
                    <UsersPage
                        auth={auth}
                        onLogout={onLogout}
                        onBack={() => {
                            if (window.history.length > 1) {
                                window.history.back();
                            } else {
                                window.location.href = "/system";
                            }
                        }}
                    />,
                )}
            />

            <Route
                path="/system/users/new"
                element={requireAuthElement(
                    auth,
                    <UserEditorPage
                        auth={auth}
                        onLogout={onLogout}
                        onBack={() => {
                            if (window.history.length > 1) {
                                window.history.back();
                            } else {
                                window.location.href = "/system/users";
                            }
                        }}
                    />,
                )}
            />

            <Route
                path="/system/users/:userId/edit"
                element={requireAuthElement(
                    auth,
                    <UserEditorPage
                        auth={auth}
                        onLogout={onLogout}
                        onBack={() => {
                            if (window.history.length > 1) {
                                window.history.back();
                            } else {
                                window.location.href = "/system/users";
                            }
                        }}
                    />,
                )}
            />

            {/* ====== Rubber Types (Master Data) ====== */}
            <Route
                path="/system/rubber-types"
                element={requireAuthElement(
                    auth,
                    <RubberTypesPage
                        auth={auth}
                        onLogout={onLogout}
                    // ถ้าอยากให้ back ได้ในอนาคต สามารถเพิ่ม onBack prop ได้
                    />,
                )}
            />

            <Route
                path="/system/rubber-types/new"
                element={requireAuthElement(
                    auth,
                    <RubberTypeEditorPage
                        auth={auth}
                        onLogout={onLogout}
                    />,
                )}
            />

            <Route
                path="/system/rubber-types/:rubbertypeId/edit"
                element={requireAuthElement(
                    auth,
                    <RubberTypeEditorPage
                        auth={auth}
                        onLogout={onLogout}
                    />,
                )}
            />

            {/* ===== Suppliers (Master) ===== */}
            <Route
                path="/system/suppliers"
                element={requireAuthElement(
                    auth,
                    <SuppliersPage
                        auth={auth}
                        onLogout={onLogout}
                    />,
                )}
            />

            <Route
                path="/system/suppliers/new"
                element={requireAuthElement(
                    auth,
                    <SupplierEditorPage
                        auth={auth}
                        onLogout={onLogout}
                    />,
                )}
            />

            <Route
                path="/system/suppliers/:supplierId/edit"
                element={requireAuthElement(
                    auth,
                    <SupplierEditorPage
                        auth={auth}
                        onLogout={onLogout}
                    />,
                )}
            />

            {/* ===== Booking Queue (หน้าใหม่ /booking) ===== */}
            <Route
                path="/booking"
                element={requireAuthElement(
                    auth,
                    can(user, "portal.app.booking.view") ? (
                        <BookingQueuePage
                            auth={auth}
                            onLogout={onLogout}
                            // ✅ ใส่ onBack ให้เหมือนหน้าอื่น
                            onBack={() => {
                                if (window.history.length > 1) {
                                    window.history.back();
                                } else {
                                    // ถ้าไม่มี history ให้กลับหน้า Portal Center
                                    window.location.href = "/";
                                }
                            }}
                            // ✅ ส่ง prop สำหรับ Notification (ตอนนี้ยังเป็น function เปล่า ๆ ไปก่อน)
                            onNotificationsClick={() => { }}
                            notificationsCount={0}
                        />
                    ) : (
                        // ถ้าไม่มีสิทธิ์ → ส่งกลับหน้าแรก
                        <Navigate to="/" replace />
                    ),
                )}
            />

            {/* ===== QR SYSTEM (หน้าใหม่ /qr – Main Portal) ===== */}
            <Route
                path="/qr"
                element={requireAuthElement(
                    auth,
                    can(user, "portal.app.qr.view") ? (
                        <QrPortalPage
                            auth={auth}
                            onLogout={onLogout}
                            onBack={() => {
                                if (window.history.length > 1) {
                                    window.history.back();
                                } else {
                                    window.location.href = "/";
                                }
                            }}
                            onNotificationsClick={() => { }}
                            notificationsCount={0}
                        />
                    ) : (
                        <Navigate to="/" replace />
                    ),
                )}
            />

            {/* ===== Truck Scale (หน้าใหม่ /truckscale มี Tabs ด้านใน) ===== */}
            <Route
                path="/truckscale"
                element={requireAuthElement(
                    auth,
                    can(user, "portal.app.truckscale.view") ? (
                        <TruckScalePage
                            auth={auth}
                            onLogout={onLogout}
                            onBack={() => {
                                if (window.history.length > 1) {
                                    window.history.back();
                                } else {
                                    window.location.href = "/";
                                }
                            }}
                            onNotificationsClick={() => { }}
                            notificationsCount={0}
                        />
                    ) : (
                        <Navigate to="/" replace />
                    ),
                )}
            />

            {/*
            // ถ้ามีหน้า Permission Manager แล้ว อยากใส่เพิ่มก็ใส่แบบนี้ได้:
            <Route
                path="/system/permissions"
                element={requireAuthElement(
                    auth,
                    <PermissionPage
                        auth={auth}
                        onLogout={onLogout}
                    />
                )}
            />
            */}
        </>
    );
}