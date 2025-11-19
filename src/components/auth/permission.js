// src/auth/permission.js

/**
 * ดึง permissions ของ user ให้เป็น array<string>
 * รองรับเคส:
 * - backend ส่งเป็น array ของ string
 * - backend ส่งมาเป็น string เดียวคั่นด้วย comma (เผื่ออนาคต)
 */
export function getUserPermissions(user) {
    if (!user) return [];

    const perms = user.permissions;

    if (Array.isArray(perms)) {
        return perms.filter((p) => typeof p === "string");
    }

    if (typeof perms === "string") {
        return perms
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }

    return [];
}

/**
 * เช็คว่า user เป็น superuser หรือไม่
 * - ถ้า is_superuser = true → super
 * - หรือ role = "super_admin" (ไม่สนตัวพิมพ์เล็ก/ใหญ่) → super ด้วย
 */
export function isSuperuser(user) {
    if (!user) return false;

    if (user.is_superuser) return true;

    const role = user.role;
    if (typeof role === "string" && role.toLowerCase() === "super_admin") {
        return true;
    }

    return false;
}

/**
 * ตรวจสอบว่า user มี permission ตามที่ต้องการหรือไม่
 *
 * - ถ้า user เป็น superuser -> return true ทุกกรณี
 * - required:
 *    - string  -> ต้องมีสิทธิ์ตัวนั้น
 *    - array   -> ขอแค่มี "อย่างน้อยหนึ่ง" จากใน list (OR)
 *
 * ตัวอย่าง:
 *   can(user, "user:view")
 *   can(user, ["user:view", "user:create"]) // OR
 */
export function can(user, required) {
    if (!user || !required) return false;

    // super_admin / is_superuser → ผ่านทุกสิทธิ์
    if (isSuperuser(user)) return true;

    const perms = getUserPermissions(user);

    if (typeof required === "string") {
        return perms.includes(required);
    }

    if (Array.isArray(required) && required.length > 0) {
        return required.some((p) => perms.includes(p));
    }

    return false;
}

/**
 * canAny(user, ["a", "b", "c"])
 *  -> true ถ้า user มี "อย่างน้อยหนึ่ง" จาก list (OR)
 */
export function canAny(user, codes = []) {
    if (!user || !Array.isArray(codes) || codes.length === 0) return false;
    if (isSuperuser(user)) return true;

    const perms = getUserPermissions(user);
    return codes.some((code) => perms.includes(code));
}

/**
 * canAll(user, ["a", "b", "c"])
 *  -> true ถ้า user มี "ครบทุกอัน" (AND)
 */
export function canAll(user, codes = []) {
    if (!user || !Array.isArray(codes) || codes.length === 0) return false;
    if (isSuperuser(user)) return true;

    const perms = getUserPermissions(user);
    return codes.every((code) => perms.includes(code));
}

/**
 * เช็ค role ของ user
 * - role เป็น string ตัวเดียว เช่น "super_admin"
 * - หรือ array ของ role code ได้
 */
export function hasRole(user, requiredRoles) {
    if (!user) return false;

    const userRole = user.role;
    if (!userRole) return false;

    if (typeof requiredRoles === "string") {
        return userRole === requiredRoles;
    }

    if (Array.isArray(requiredRoles) && requiredRoles.length > 0) {
        return requiredRoles.includes(userRole);
    }

    return false;
}

/**
 * เช็คว่า user มี permission ที่ขึ้นต้นด้วย prefix ใด prefix หนึ่งไหม
 *
 * ตัวอย่าง:
 *   canStartsWith(user, "booking:")
 *   -> true ถ้ามี permission เช่น "booking:view" หรือ "booking:create"
 *
 *   canStartsWith(user, ["booking:", "weekly_plan:"])
 */
export function canStartsWith(user, prefix) {
    if (!user || !prefix) return false;
    if (isSuperuser(user)) return true;

    const perms = getUserPermissions(user);

    if (typeof prefix === "string") {
        return perms.some((p) => p.startsWith(prefix));
    }

    if (Array.isArray(prefix) && prefix.length > 0) {
        return perms.some((p) => prefix.some((pre) => p.startsWith(pre)));
    }

    return false;
}