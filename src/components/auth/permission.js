// src/auth/permission.js

/**
 * เช็คว่า user มี permission ตามที่ต้องการไหม
 * - ถ้า is_superuser = true ให้ผ่านทั้งหมด
 * - required: string เดียว หรือ array ของ string ก็ได้
 */
export function can(user, required) {
    if (!user) return false;

    if (user.is_superuser) return true;

    const perms = Array.isArray(user.permissions) ? user.permissions : [];

    if (Array.isArray(required)) {
        // ขอแค่มีอันใดอันหนึ่ง
        return required.some((p) => perms.includes(p));
    }

    return perms.includes(required);
}