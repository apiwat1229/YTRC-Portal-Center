// src/routes/SystemRoutes.jsx
import { Navigate, Route } from "react-router-dom";

import SystemMenuPortalPage from "../components/system/SystemMenuPortalPage";

import UserEditorPage from "../components/admin/users/UserEditorPage";
import UsersPage from "../components/admin/users/UsersPage";

import RubberTypeEditorPage from "../components/admin/rubbertypes/RubberTypeEditorPage";
import RubberTypesPage from "../components/admin/rubbertypes/RubberTypesPage";
import SupplierEditorPage from "../components/admin/suppliers/SupplierEditorPage";
import SuppliersPage from "../components/admin/suppliers/SuppliersPage";
// ถ้ามีหน้า Permission Manager อยู่แล้ว ค่อยมา import เพิ่มทีหลังได้ เช่น:
// import PermissionPage from "../components/admin/permissions/PermissionPage";

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
                    />
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
                    />
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
                    />
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
                    />
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
                    // ถ้าอยากให้กด Back กลับ System Menu ก็ส่ง navigate ผ่าน prop ภายหลังได้
                    />
                )}
            />

            <Route
                path="/system/rubber-types/new"
                element={requireAuthElement(
                    auth,
                    <RubberTypeEditorPage
                        auth={auth}
                        onLogout={onLogout}
                    />
                )}
            />

            <Route
                path="/system/rubber-types/:rubbertypeId/edit"
                element={requireAuthElement(
                    auth,
                    <RubberTypeEditorPage
                        auth={auth}
                        onLogout={onLogout}
                    />
                )}
            />

            {/* Suppliers list */}
            <Route
                path="/cuplump/suppliers"
                element={<SuppliersPage auth={auth} onLogout={onLogout} />}
            />
            {/* Create Supplier */}
            <Route
                path="/cuplump/suppliers/new"
                element={<SupplierEditorPage auth={auth} onLogout={onLogout} />}
            />
            {/* Edit Supplier */}
            <Route
                path="/cuplump/suppliers/:supplierId/edit"
                element={<SupplierEditorPage auth={auth} onLogout={onLogout} />}
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