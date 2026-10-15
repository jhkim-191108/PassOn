import { NavLink } from "react-router-dom";
import passOnLogo from "../../assets/passon-logo.png";
import { navItems } from "./navItems";
import { useEffect, useRef, useState } from "react";
import ConfirmDialog from "../ui/ConfirmDialog";
import type { Notification } from "../../types/api";

interface SidebarProps {
    userName: string;
    storeName: string;
    notifications: Notification[];
}

function Sidebar({ userName, storeName, notifications = [], }: SidebarProps) {
    const [open, setOpen] = useState<"noti" | "profile" | null>(null);
    const [logoutConfirm, setLogoutConfirm] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const closeMenu = (e: MouseEvent) => {
            if(menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(null);
            }
        };
        document.addEventListener("mousedown", closeMenu);

        return () => {
            document.removeEventListener("mousedown", closeMenu);
        };
    }, []);

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
            </nav>
            <div className="sidebar__bottom" ref={menuRef}>
                <div className="sidebar__dropdown-wrap">
                    <button type="button" className="sidebar__action" onClick={() => setOpen(open === "noti" ? null : "noti")}>
                        🔔알림
                    </button>
                    {open === "noti" && (
                        <div className="sidebar__dropdown notification-dropdown">
                            <div className="navigation__dropdown-header">
                                <strong>알림</strong>
                            </div>
                            {notifications.length === 0 ? (
                                <div className="notification-dropdown__empty">
                                    새로운 알림이 없습니다.
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <button 
                                        key={notification.id}
                                        className="notification-dropdown__item"
                                    >
                                        <strong>{notification.title}</strong>
                                        <span>{notification.body}</span>
                                    </button>
                                ))
                            )
                        }
                            {/* <button type="button" className="notification-dropdown__item">
                                새로운 인수인계가 등록되었습니다.
                            </button>
                            <button type="button" className="notification-dropdown__item dropdown__danger">
                                긴급 인수인계를 확인해주세요.
                            </button> */}
                        </div>
                    )}
                </div>

                <div className="sidebar__dropdown-wrap">
                    <button 
                        type="button" 
                        className="sidebar__profile" 
                        onClick={() => setOpen(open === "profile" ? null : "profile")}
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
                                onClick={() => setLogoutConfirm(true)}
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