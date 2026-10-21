import { NavLink } from "react-router-dom";
import passOnLogo from "../../assets/passon-logo.png";
import { navItems } from "./navItems";
import { useState } from "react";
import ConfirmDialog from "../ui/ConfirmDialog";
import type { Notification } from "../../types/api";
import useDropdown from "../hooks/useDropdown";
import NotificationDropdown from "./NotificationDropdown";

interface SidebarProps {
    userName: string;
    storeName: string;
    notifications: Notification[];
    onReadNotification: (notification: Notification) => void;
    onReadAllNotifications: () => void;
}

function Sidebar({ userName, storeName, notifications = [], onReadNotification, onReadAllNotifications }: SidebarProps) {
    const unreadCount = notifications.filter((notification) => !notification.read).length;
    const [logoutConfirm, setLogoutConfirm] = useState(false);

    const {open, ref, toggle, close, } = useDropdown();

    return (
        <aside className="sidebar">
            <NavLink to="/app/dashboard" className="sidebar__logo">
                <img src={passOnLogo} alt="PassOn" />
            </NavLink>

            <div className="sidebar__store">
                <span className="sidebar__store-label">현재 매장</span>
                <strong>{storeName}</strong>
            </div>

            <nav className="sidebar__menu">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                        isActive
                            ? "sidebar__link sidebar__link--active"
                            : "sidebar__link"
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
                <NavLink
                    to="/app/store"
                    className={({ isActive }) =>
                        isActive ? "sidebar__link sidebar__link--active" : "sidebar__link"
                    }
                >
                    매장 설정
                </NavLink>
            </nav>
            <div className="sidebar__bottom" ref={ref}>
                <div className="sidebar__dropdown-wrap">
                    <button type="button" className="sidebar__action" onClick={() => toggle("noti")}>
                        🔔알림
                        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                    </button>
                    {open === "noti" && (
                        <div className="sidebar__dropdown">
                            <NotificationDropdown
                                notifications={notifications}
                                onRead={onReadNotification}
                                onReadAll={onReadAllNotifications}
                            />
                        </div>
                    )}
                </div>

                <div className="sidebar__dropdown-wrap">
                    <button 
                        type="button" 
                        className="sidebar__profile" 
                        onClick={() => toggle("profile")}
                    >
                        <span className="sidebar__avatar">
                            {userName.charAt(0)}
                        </span>

                        <span>{userName}</span>
                    </button>
                    {open === "profile" && (
                        <div className="sidebar__dropdown profile-dropdown">
                            <button type="button" className="profile-dropdown__item">
                                내 정보
                            </button>
                            <div className="profile-dropdown__divider" />
                            <button 
                                type="button" 
                                className="profile-dropdown__item dropdown__danger"
                                onClick={() => {
                                    close();
                                    setLogoutConfirm(true)
                                }}
                            >
                                로그아웃
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <ConfirmDialog
                open={logoutConfirm}
                title="로그아웃"
                description="로그아웃 하시겠습니까?"
                confirmText="로그아웃"
                variant="danger"
                cancelText="취소"
                onClose={() => setLogoutConfirm(false)}
                onConfirm={() => {
                    console.log("로그아웃");
                    setLogoutConfirm(false);
                }}
            />
        </aside>
    );
}

export default Sidebar;