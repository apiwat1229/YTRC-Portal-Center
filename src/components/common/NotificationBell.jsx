// src/components/portal/NotificationBell.jsx
import { ActionIcon, Indicator, Tooltip } from "@mantine/core";
import { IconBellRinging } from "@tabler/icons-react";

/**
 * NotificationBell
 * - แสดง icon กระดิ่ง + badge ตัวเลข
 * - การคำนวณ tooltip / แสดง 99+ ทำใน component นี้เลย
 */
export default function NotificationBell({ count = 0, onClick }) {
    const hasUnread = count > 0;
    const displayCount = count > 99 ? "99+" : count;
    const tooltipLabel = hasUnread
        ? `มีแจ้งเตือนใหม่ ${displayCount} รายการ`
        : "ยังไม่มีแจ้งเตือนใหม่";

    const handleClick = () => {
        if (typeof onClick === "function") {
            onClick();
        }
    };

    return (
        <Tooltip label={tooltipLabel} withArrow>
            <div style={{ display: "inline-flex" }} onClick={handleClick}>
                <Indicator
                    disabled={!hasUnread}
                    label={displayCount}
                    size={16}
                    color="red"
                    offset={4}
                >
                    <ActionIcon
                        aria-label="Notifications"
                        radius={12}
                        size="lg"
                        variant="filled"
                        style={{
                            cursor: "pointer",
                            transition:
                                "transform .15s ease, background-color .15s ease, box-shadow .15s ease",
                            backgroundColor: "#fef9c3",
                            color: "#ca8a04",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                                "translateY(-1px)";
                            e.currentTarget.style.backgroundColor = "#fef08a";
                            e.currentTarget.style.boxShadow =
                                "0 0 0 1px rgba(234,179,8,0.5)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "none";
                            e.currentTarget.style.backgroundColor = "#fef9c3";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    >
                        <IconBellRinging size={18} />
                    </ActionIcon>
                </Indicator>
            </div>
        </Tooltip>
    );
}