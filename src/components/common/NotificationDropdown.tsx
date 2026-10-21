import type { Notification, NotificationType } from "../../types/api";

const TYPE_LABEL: Record<NotificationType, string> = {
    ASSIGNMENT: "업무 배정",
    URGENT: "긴급",
    MEMO: "메모",
    COMPLETED: "처리 완료",
};

interface NotificationDropdownProps {
    notifications: Notification[];
    onRead: (notification: Notification) => void;
    onReadAll: () => void;
}

function formatWhen(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${date.getFullYear()}.${month}.${day} ${hour}:${minute}`;
}

function NotificationDropdown({ notifications, onRead, onReadAll }: NotificationDropdownProps) {
    const unread = notifications.some((notification) => !notification.read);

    return (
        <div className="notification-dropdown">
            <div className="navigation__dropdown-header notification-dropdown__header">
                <strong>알림</strong>
                {unread && (
                    <button type="button" className="notification-dropdown__read-all" onClick={onReadAll}>
                        모두 읽음
                    </button>
                )}
            </div>
            {notifications.length === 0 ? (
                <div className="notification-dropdown__empty">새로운 알림이 없습니다.</div>
            ) : (
                notifications.map((notification) => (
                    <button
                        type="button"
                        key={notification.id}
                        className={
                            notification.read
                                ? "notification-dropdown__item"
                                : "notification-dropdown__item notification-dropdown__item--unread"
                        }
                        onClick={() => onRead(notification)}
                    >
                        <em>{TYPE_LABEL[notification.type]}</em>
                        <strong>{notification.title}</strong>
                        <span>{notification.body}</span>
                        <time>{formatWhen(notification.createdAt)}</time>
                    </button>
                ))
            )}
        </div>
    );
}

export default NotificationDropdown;
