// src/components/layout/HeaderMegaMenu.jsx
import {
    Anchor,
    Box,
    Burger,
    Button,
    Center,
    Collapse,
    Divider,
    Drawer,
    Group,
    HoverCard,
    ScrollArea,
    SimpleGrid,
    Text,
    ThemeIcon,
    UnstyledButton,
    useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
    IconBook,
    IconChartPie3,
    IconChevronDown,
    IconCode,
    IconCoin,
    IconFingerprint,
    IconNotification,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import classes from "./HeaderMegaMenu.module.css";

// --------------------------------------------------------
// สามารถปรับให้เข้ากับระบบของ YTRC ได้ตามนี้
// --------------------------------------------------------
const apps = [
    {
        icon: IconCode,
        title: "Portal Center",
        description: "ศูนย์กลางเข้าถึงระบบภายในทั้งหมดของ YTRC",
        path: "/",
    },
    {
        icon: IconChartPie3,
        title: "Cuplump",
        description: "จัดการข้อมูลรับซื้อยาง / คุณภาพ / สโตร์",
        path: "/cuplump",
    },
    {
        icon: IconFingerprint,
        title: "Booking Queue",
        description: "จัดการคิวรถขนส่ง และ slot การจอง",
        path: "/booking",
    },
    {
        icon: IconCoin,
        title: "TruckScale",
        description: "เชื่อมต่อและจัดการข้อมูลชั่งน้ำหนักรถ",
        path: "/truckscale",
    },
    {
        icon: IconBook,
        title: "Maintenance",
        description: "แจ้งซ่อม / CM / PM / ติดตามสถานะงานซ่อม",
        path: "/maintenance",
    },
    {
        icon: IconNotification,
        title: "System Settings",
        description: "ตั้งค่าผู้ใช้ สิทธิ์ และข้อมูลหลัก",
        path: "/system",
    },
];

export default function HeaderMegaMenu({ user, onLogout }) {
    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
        useDisclosure(false);
    const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
    const theme = useMantineTheme();
    const navigate = useNavigate();

    const featureLinks = apps.map((item) => (
        <UnstyledButton
            className={classes.subLink}
            key={item.title}
            onClick={() => {
                navigate(item.path);
                closeDrawer();
            }}
        >
            <Group wrap="nowrap" align="flex-start">
                <ThemeIcon size={34} variant="default" radius="md">
                    <item.icon size={20} color={theme.colors.blue[6]} />
                </ThemeIcon>
                <div>
                    <Text size="sm" fw={500}>
                        {item.title}
                    </Text>
                    <Text size="xs" c="dimmed">
                        {item.description}
                    </Text>
                </div>
            </Group>
        </UnstyledButton>
    ));

    return (
        <Box className={classes.wrapper}>
            <header className={classes.header}>
                <Group justify="space-between" h="100">
                    {/* ---------- LOGO / BRAND ---------- */}
                    <Group gap="xs">
                        {/* ถ้ามีโลโก้ไฟล์จริงให้เปลี่ยนเป็น <img src="/logo-dark.png" ... /> */}
                        <Box className={classes.logoMark}>
                            <span className={classes.logoDot} />
                        </Box>
                        <Box>
                            <Text fw={700} fz="sm" lh={1}>
                                YTRC Portal Center
                            </Text>
                            <Text fz={11} c="dimmed">
                                Operations Hub
                            </Text>
                        </Box>
                    </Group>

                    {/* ---------- DESKTOP NAV ---------- */}
                    <Group
                        h="100%"
                        gap={0}
                        visibleFrom="sm"
                        className={classes.navGroup}
                    >
                        <button
                            type="button"
                            className={classes.link}
                            onClick={() => navigate("/")}
                        >
                            Home
                        </button>

                        <HoverCard
                            width={600}
                            position="bottom"
                            radius="md"
                            shadow="md"
                            withinPortal
                        >
                            <HoverCard.Target>
                                <button type="button" className={classes.link}>
                                    <Center inline>
                                        <Box component="span" mr={5}>
                                            Applications
                                        </Box>
                                        <IconChevronDown
                                            size={16}
                                            color={theme.colors.blue[6]}
                                        />
                                    </Center>
                                </button>
                            </HoverCard.Target>

                            <HoverCard.Dropdown
                                style={{ overflow: "hidden" }}
                            >
                                <Group justify="space-between" px="md">
                                    <Text fw={500}>Applications</Text>
                                    <Anchor
                                        component="button"
                                        fz="xs"
                                        onClick={() => navigate("/")}
                                    >
                                        View all
                                    </Anchor>
                                </Group>

                                <Divider my="sm" />

                                <SimpleGrid cols={2} spacing={0}>
                                    {featureLinks}
                                </SimpleGrid>

                                <div className={classes.dropdownFooter}>
                                    <Group justify="space-between">
                                        <div>
                                            <Text fw={500} fz="sm">
                                                YTRC Operations Hub
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                เข้าถึงระบบคิว, TruckScale,
                                                Cuplump, Maintenance และอื่น ๆ
                                                ได้จากที่เดียว
                                            </Text>
                                        </div>
                                        <Button
                                            variant="default"
                                            onClick={() => navigate("/")}
                                        >
                                            Go to Portal
                                        </Button>
                                    </Group>
                                </div>
                            </HoverCard.Dropdown>
                        </HoverCard>

                        <button
                            type="button"
                            className={classes.link}
                            onClick={() => navigate("/reports")}
                        >
                            Reports
                        </button>
                        <button
                            type="button"
                            className={classes.link}
                            onClick={() => navigate("/help")}
                        >
                            Help Center
                        </button>
                    </Group>

                    {/* ---------- RIGHT SECTION ---------- */}
                    <Group visibleFrom="sm" gap="xs">
                        {user ? (
                            <>
                                <Text fz="sm" c="dimmed">
                                    {user.display_name || user.username}
                                </Text>
                                <Button
                                    variant="default"
                                    size="xs"
                                    onClick={() => onLogout?.()}
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="default"
                                    size="xs"
                                    onClick={() => navigate("/login")}
                                >
                                    Log in
                                </Button>
                                <Button
                                    size="xs"
                                    onClick={() => navigate("/request-access")}
                                >
                                    Request Access
                                </Button>
                            </>
                        )}
                    </Group>

                    {/* ---------- MOBILE BURGER ---------- */}
                    <Burger
                        opened={drawerOpened}
                        onClick={toggleDrawer}
                        hiddenFrom="sm"
                        aria-label="Toggle navigation"
                    />
                </Group>
            </header>

            {/* ---------- MOBILE DRAWER ---------- */}
            <Drawer
                opened={drawerOpened}
                onClose={closeDrawer}
                size="100%"
                padding="md"
                title="Navigation"
                hiddenFrom="sm"
                zIndex={1000000}
            >
                <ScrollArea h="calc(100vh - 80px)" mx="-md">
                    <Divider my="sm" />

                    <button
                        type="button"
                        className={classes.link}
                        onClick={() => {
                            navigate("/");
                            closeDrawer();
                        }}
                    >
                        Home
                    </button>

                    <UnstyledButton
                        className={classes.link}
                        onClick={toggleLinks}
                    >
                        <Center inline>
                            <Box component="span" mr={5}>
                                Applications
                            </Box>
                            <IconChevronDown
                                size={16}
                                color={theme.colors.blue[6]}
                            />
                        </Center>
                    </UnstyledButton>
                    <Collapse in={linksOpened}>{featureLinks}</Collapse>

                    <button
                        type="button"
                        className={classes.link}
                        onClick={() => {
                            navigate("/reports");
                            closeDrawer();
                        }}
                    >
                        Reports
                    </button>
                    <button
                        type="button"
                        className={classes.link}
                        onClick={() => {
                            navigate("/help");
                            closeDrawer();
                        }}
                    >
                        Help Center
                    </button>

                    <Divider my="sm" />

                    <Group justify="center" grow pb="xl" px="md">
                        {user ? (
                            <Button
                                variant="default"
                                onClick={() => {
                                    onLogout?.();
                                    closeDrawer();
                                }}
                            >
                                Logout
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="default"
                                    onClick={() => {
                                        navigate("/login");
                                        closeDrawer();
                                    }}
                                >
                                    Log in
                                </Button>
                                <Button
                                    onClick={() => {
                                        navigate("/request-access");
                                        closeDrawer();
                                    }}
                                >
                                    Request Access
                                </Button>
                            </>
                        )}
                    </Group>
                </ScrollArea>
            </Drawer>
        </Box>
    );
}