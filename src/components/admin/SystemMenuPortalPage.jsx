import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ============================================================================
// 🔧 ส่วน MOCK สำหรับการแสดงผลใน PREVIEW (เมื่อนำไปใช้จริง ให้ลบส่วนนี้ทิ้งและใช้ import ปกติ)
// ============================================================================

// 1. Mock Permissions
const can = (user, permission) => true; // อนุญาตหมดในพรีวิว

// 2. Mock Icons (SVG)
const IconSettings = ({ size = 24, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756-.426-1.756-2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543.826 -3.31 2.37 -2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" /></svg>;
const IconArrowLeft = ({ size = 24, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l14 0" /><path d="M5 12l6 6" /><path d="M5 12l6 -6" /></svg>;
const IconUsers = ({ size = 24, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="M21 21v-2a4 4 0 0 0 -3 -3.85" /></svg>;
const IconKey = ({ size = 24, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="15" r="4" /><line x1="10.85" y1="12.15" x2="19" y2="4" /><line x1="18" y1="5" x2="20" y2="7" /><line x1="15" y1="8" x2="17" y2="10" /></svg>;
const IconTruck = ({ size = 24, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /><path d="M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5" /></svg>;
const IconBox = ({ size = 24, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5" /><path d="M12 12l8 -4.5" /><path d="M12 12l0 9" /><path d="M12 12l-8 -4.5" /></svg>;
const IconShieldLock = ({ size = 24, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3" /><circle cx="12" cy="11" r="1" /><line x1="12" y1="12" x2="12" y2="14" /></svg>;

// 3. Mock Mantine Components
// ✅ แก้ไข: ลบ {header} ออกจาก JSX เพื่อป้องกัน Error "Objects are not valid as a React child"
const AppShell = ({ children, header, styles }) => <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', ...styles?.main }}>{children}</div>;
AppShell.Header = ({ children }) => <div style={{ height: 64, position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>{children}</div>;
AppShell.Main = ({ children }) => <div style={{ flex: 1 }}>{children}</div>;
const Container = ({ children, size, py }) => <div style={{ maxWidth: size === 'lg' ? 1024 : '100%', margin: '0 auto', padding: py === 'md' ? '32px 16px' : 0 }}>{children}</div>;
const Stack = ({ children, gap }) => <div style={{ display: 'flex', flexDirection: 'column', gap: gap === 'md' ? 24 : 12 }}>{children}</div>;
const Group = ({ children, justify, gap, style, px, h }) => <div style={{ display: 'flex', justifyContent: justify === 'space-between' ? 'space-between' : 'flex-start', alignItems: 'center', gap: gap === 'xs' ? 8 : gap === 'sm' ? 16 : 12, paddingLeft: px === 'md' ? 16 : 0, paddingRight: px === 'md' ? 16 : 0, height: h, ...style }}>{children}</div>;
const Text = ({ children, size, fw, c, mb, mt, style }) => <div style={{ fontSize: size === 'sm' ? 14 : size === 'xs' ? 12 : size === 'lg' ? 18 : 16, fontWeight: fw || 400, color: c === 'dimmed' ? '#64748b' : '#1e293b', marginBottom: mb, marginTop: mt, ...style }}>{children}</div>;
const Button = ({ children, variant, size, leftSection, onClick }) => <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', fontWeight: 500, fontSize: 14 }}>{leftSection} {children}</button>;
const SimpleGrid = ({ children, cols, spacing, mt }) => <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: spacing === 'lg' ? 24 : 16, marginTop: mt === 'md' ? 24 : 0 }}>{children}</div>;
const Divider = ({ label, labelPosition }) => <div style={{ display: 'flex', alignItems: 'center', margin: '32px 0 16px' }}><div style={{ flex: 1, height: 1, background: '#e2e8f0' }}></div>{label && <span style={{ padding: '0 12px', color: '#94a3b8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>}<div style={{ flex: 1, height: 1, background: '#e2e8f0' }}></div></div>;
const Badge = ({ children, color, variant }) => <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600, backgroundColor: variant === 'outline' ? 'transparent' : (color === 'gray' ? '#f1f5f9' : '#eff6ff'), color: color === 'gray' ? '#64748b' : '#3b82f6', border: '1px solid ' + (color === 'gray' ? '#e2e8f0' : '#bfdbfe') }}>{children}</span>;

// ============================================================================
// 🚀 จบส่วน MOCK - เริ่มส่วนโค้ดจริง
// ============================================================================

export default function SystemMenuPortalPage({ auth, onBack }) {
    const { user } = auth || {};
    const [activeTool, setActiveTool] = useState(null);
    const navigate = useNavigate();

    // ===== Permission flags =====
    const canUsers = can(user, "portal.admin.users.view");
    const canPermissions = can(user, "portal.admin.permissions.manage");
    const canSuppliers = can(user, "portal.cuplump.suppliers.view");
    const canRubberTypes = can(user, "portal.cuplump.rubbertypes.view");

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Outfit, sans-serif' }}>
            <AppShell
                header={{ height: 64 }}
                styles={{
                    main: { backgroundColor: "transparent" },
                }}
            >
                {/* ===== Header ===== */}
                <AppShell.Header>
                    <Group
                        h="100%"
                        px="md"
                        justify="space-between"
                        style={{
                            borderBottom: "1px solid #e2e8f0",
                            backgroundColor: "white",
                        }}
                    >
                        <Group gap="sm">
                            {/* Logo / Icon Box */}
                            <div style={{
                                width: 40, height: 40, borderRadius: 10,
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', boxShadow: '0 4px 6px -1px rgba(59,130,246,0.3)'
                            }}>
                                <IconSettings size={22} />
                            </div>

                            {/* Title Area */}
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Text fw={700} size="lg" style={{ lineHeight: 1.2, letterSpacing: '-0.01em' }}>System Settings</Text>
                                <Text size="xs" c="dimmed">Configuration Center</Text>
                            </div>
                        </Group>

                        <Group gap="sm">
                            <Button
                                variant="subtle"
                                size="xs"
                                leftSection={<IconArrowLeft size={16} />}
                                onClick={onBack}
                            >
                                Back to Portal
                            </Button>
                        </Group>
                    </Group>
                </AppShell.Header>

                {/* ===== Main Content ===== */}
                <AppShell.Main>
                    <Container size="lg" py="md">
                        <Stack gap="md">

                            {/* Section 1: Security & Access Control */}
                            <Divider label="Security & Access Control" labelPosition="left" />
                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                                <SettingCard
                                    title="User Management"
                                    description="จัดการบัญชีผู้ใช้งาน: สร้าง, แก้ไข, ระงับการใช้งาน และรีเซ็ตรหัสผ่าน"
                                    icon={IconUsers}
                                    color="blue"
                                    active={activeTool === "users"}
                                    disabled={!canUsers}
                                    onClick={() => {
                                        if (!canUsers) return;
                                        setActiveTool("users");
                                        navigate("/system/users");
                                    }}
                                />

                                <SettingCard
                                    title="Permission Manager"
                                    description="กำหนดสิทธิ์การเข้าถึง (Roles & Policies) และผูกสิทธิ์กับผู้ใช้งาน"
                                    icon={IconKey}
                                    color="grape"
                                    active={activeTool === "permissions"}
                                    disabled={!canPermissions}
                                    onClick={() => {
                                        if (!canPermissions) return;
                                        setActiveTool("permissions");
                                        navigate("/system/permissions");
                                    }}
                                />
                            </SimpleGrid>

                            {/* Section 2: Business Master Data */}
                            <Divider label="Business Master Data" labelPosition="left" />
                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                                <SettingCard
                                    title="Suppliers"
                                    description="ฐานข้อมูลคู่ค้า/ผู้ส่งมอบ สำหรับระบบรับซื้อยางและระบบคิว"
                                    icon={IconTruck}
                                    color="teal"
                                    active={activeTool === "suppliers"}
                                    disabled={!canSuppliers}
                                    onClick={() => {
                                        if (!canSuppliers) return;
                                        setActiveTool("suppliers");
                                        navigate("/cuplump/suppliers");
                                    }}
                                />

                                <SettingCard
                                    title="Rubber Types"
                                    description="จัดการข้อมูลชนิดยาง (STR20, USS) และเกรดสินค้า"
                                    icon={IconBox}
                                    color="green"
                                    active={activeTool === "rubbertypes"}
                                    disabled={!canRubberTypes}
                                    onClick={() => {
                                        if (!canRubberTypes) return;
                                        setActiveTool("rubbertypes");
                                        navigate("/cuplump/rubber-types");
                                    }}
                                />
                            </SimpleGrid>

                            {/* Security Footer */}
                            <div style={{
                                marginTop: 40,
                                padding: '16px 24px',
                                backgroundColor: 'white',
                                borderRadius: 12,
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                            }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%',
                                    backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <IconShieldLock size={18} color="#64748b" />
                                </div>
                                <Text size="sm" c="dimmed">
                                    การเปลี่ยนแปลงการตั้งค่าระบบจะถูกบันทึกใน Audit Log เพื่อความปลอดภัยและสามารถตรวจสอบย้อนหลังได้
                                </Text>
                            </div>

                        </Stack>
                    </Container>
                </AppShell.Main>
            </AppShell>
        </div>
    );
}

// --- Modern Card Component ---
function SettingCard({
    title,
    description,
    icon: Icon,
    color,
    active,
    disabled,
    onClick
}) {
    const [hover, setHover] = useState(false);

    // Color Palettes
    const colors = {
        blue: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe', shadow: 'rgba(37, 99, 235, 0.1)' },
        grape: { bg: '#f3e8ff', text: '#9333ea', border: '#d8b4fe', shadow: 'rgba(147, 51, 234, 0.1)' },
        teal: { bg: '#f0fdfa', text: '#0d9488', border: '#99f6e4', shadow: 'rgba(13, 148, 136, 0.1)' },
        green: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0', shadow: 'rgba(22, 163, 74, 0.1)' },
        gray: { bg: '#f8fafc', text: '#94a3b8', border: '#e2e8f0', shadow: 'rgba(0,0,0,0)' }
    };

    const theme = disabled ? colors.gray : (colors[color] || colors.blue);
    const isActiveOrHover = (active || hover) && !disabled;

    return (
        <div
            onClick={() => !disabled && onClick()}
            onMouseEnter={() => !disabled && setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                backgroundColor: 'white',
                borderRadius: 16,
                border: `1px solid ${isActiveOrHover ? theme.border : '#e2e8f0'}`,
                padding: 24,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isActiveOrHover ? `0 10px 20px -5px ${theme.shadow}, 0 4px 6px -2px rgba(0,0,0,0.05)` : '0 1px 3px rgba(0,0,0,0.05)',
                transform: hover && !disabled ? 'translateY(-2px)' : 'translateY(0)',
                position: 'relative',
                overflow: 'hidden',
                opacity: disabled ? 0.7 : 1
            }}
        >
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                {/* Icon Box */}
                <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    backgroundColor: theme.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: theme.text,
                    flexShrink: 0,
                    transition: 'transform 0.3s ease',
                    transform: hover && !disabled ? 'scale(1.05)' : 'scale(1)'
                }}>
                    <Icon size={28} />
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <Text fw={600} size="md" c={disabled ? 'dimmed' : 'dark'} style={{ letterSpacing: '-0.01em' }}>
                            {title}
                        </Text>
                        <Badge variant={disabled ? 'outline' : 'light'} color={disabled ? 'gray' : color}>
                            {disabled ? 'Locked' : 'Active'}
                        </Badge>
                    </div>
                    <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
                        {description}
                    </Text>
                </div>
            </div>

            {/* Active Indicator Bar */}
            {active && (
                <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
                    backgroundColor: theme.text
                }} />
            )}
        </div>
    );
}