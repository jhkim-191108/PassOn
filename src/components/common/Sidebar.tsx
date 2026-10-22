import { NavLink, useNavigate } from "react-router-dom";
import passOnLogo from "../../assets/passon-logo.png";
import iconHome from "../../assets/Icon-home.png";
import iconHandover from "../../assets/Icon-handover.png";
import iconNotice from "../../assets/Icon-notice.png";
import iconEmployees from "../../assets/Icon-employees.png";
import iconSchedule from "../../assets/Icon-schedule.png";
import iconHistory from "../../assets/Icon-history.png";
import iconDelegate from "../../assets/Icon-delegate.png";
import iconStore from "../../assets/Icon-store.png";
import iconBell from "../../assets/Icon-bell.png";
import { useState } from "react";
import { logout } from "../../api/auth";
import ConfirmDialog from "../ui/ConfirmDialog";
import type { Notification, Store, StoreRole } from "../../types/api";
import useDropdown from "../hooks/useDropdown";
import NotificationDropdown from "./NotificationDropdown";
import { ROLE_BADGE, TYPE_LABEL } from "../../features/stores/labels";
import { PATHS } from "../../routes/paths";

interface SidebarProps {
    userName: string;
    userEmail?: string;
    role?: StoreRole;
    storeId?: string;
    storeName?: string;
    stores?: Store[];
    onSelectStore?: (storeId: string) => void;
    notifications: Notification[];
    onReadNotification: (notification: Notification) => void;
    onReadAllNotifications: () => void;
}

const WORK_LINKS = [
    { to: "/app/dashboard", label: "대시보드", icon: iconHome, end: true },
    { to: "/app/handovers", label: "인수인계", icon: iconHandover, end: true },
    { to: "/app/notices", label: "공지사항", icon: iconNotice, end: false },
];

const MANAGE_LINKS = [
    { to: "/app/employees", label: "직원 관리", icon: iconEmployees, end: false },
    { to: "/app/schedule", label: "근무표", icon: iconSchedule, end: false },
    { to: "/app/history", label: "기록 조회", icon: iconHistory, end: false },
    { to: "/app/delegate", label: "관리자 위임", icon: iconDelegate, end: false },
];

function Sidebar({
    userName,
    userEmail,
    role,
    storeId,
    storeName,
    stores = [],
    onSelectStore = () => {},
    notifications = [],
    onReadNotification,
    onReadAllNotifications,
}: SidebarProps) {
    const navigate = useNavigate();
    const unreadCount = notifications.filter((notification) => !notification.read).length;
    const [logoutConfirm, setLogoutConfirm] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const { open, ref, toggle, close } = useDropdown<HTMLElement>();
    const initial = storeName?.charAt(0) ?? "";

    return (
        <aside className="sidebar" ref={ref}>
            <NavLink to="/app/dashboard" className="sidebar__logo">
                <img src={passOnLogo} alt="PassOn" />
            </NavLink>

            <div className="sidebar__dropdown-wrap">
                <button
                    type="button"
                    className="sidebar__store"
                    aria-expanded={open === "store"}
                    onClick={() => toggle("store")}
                >
                    <span className="sidebar__store-mark">{initial}</span>
                    <span className="sidebar__store-text">
                        <strong>{storeName || "매장 없음"}</strong>
                        {role && <span>{ROLE_BADGE[role]}</span>}
                    </span>
                    <svg className="sidebar__chevron" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <path d="M2.5 4.5 L6 8 L9.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                </button>
                {open === "store" && (
                    <div className="sidebar__dropdown sidebar__dropdown--store" role="menu">
                        <p className="store-menu__label">매장 선택</p>
                        {stores.length === 0 ? (
                            <p className="store-menu__empty">선택할 매장이 없습니다.</p>
                        ) : (
                            stores.map((store) => {
                                const current = store.id === storeId;
                                return (
                                    <button
                                        key={store.id}
                                        type="button"
                                        role="menuitem"
                                        className={current ? "store-menu__item store-menu__item--current" : "store-menu__item"}
                                        aria-current={current ? "true" : undefined}
                                        onClick={() => {
                                            onSelectStore(store.id);
                                            close();
                                        }}
                                    >
                                        <span className="store-menu__mark">{store.name.charAt(0)}</span>
                                        <span className="store-menu__text">
                                            <strong>{store.name}</strong>
                                            <span>{TYPE_LABEL[store.type]} · {ROLE_BADGE[store.myRole]}</span>
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            <nav className="sidebar__menu">
                <p className="sidebar__group">업무</p>
                {WORK_LINKS.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                            isActive ? "sidebar__link sidebar__link--active" : "sidebar__link"
                        }
                    >
                        <img className="sidebar__icon" src={item.icon} alt="" width={18} height={18} />
                        {item.label}
                    </NavLink>
                ))}
                <p className="sidebar__group">관리</p>
                {MANAGE_LINKS.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                            isActive ? "sidebar__link sidebar__link--active" : "sidebar__link"
                        }
                    >
                        <img className="sidebar__icon" src={item.icon} alt="" width={18} height={18} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar__bottom">
                <div className="sidebar__dropdown-wrap">
                    <button type="button" className="sidebar__action" onClick={() => toggle("noti")}>
                        <img className="sidebar__bell" src={iconBell} alt="" width={18} height={18} />
                        알림
                        {unreadCount > 0 && (
                            <span className="sidebar__badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
                        )}
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

                <NavLink
                    to="/app/store"
                    className={({ isActive }) =>
                        isActive ? "sidebar__link sidebar__link--active" : "sidebar__link"
                    }
                >
                    <img className="sidebar__icon" src={iconStore} alt="" width={18} height={18} />
                    매장 설정
                </NavLink>

                <div className="sidebar__dropdown-wrap">
                    <button type="button" className="sidebar__profile" onClick={() => toggle("profile")}>
                        <span className="sidebar__avatar">{userName.charAt(0)}</span>
                        <span className="sidebar__profile-text">
                            <strong>{userName}</strong>
                            {userEmail && <span>{userEmail}</span>}
                        </span>
                        <svg className="sidebar__chevron" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                            <path d="M2.5 4.5 L6 8 L9.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                    </button>
                    {open === "profile" && (
                        <div className="sidebar__dropdown profile-dropdown">
                            <button
                                type="button"
                                className="profile-dropdown__item"
                                onClick={() => {
                                    close();
                                    navigate(PATHS.MYPAGE);
                                }}
                            >
                                내 정보
                            </button>
                            <div className="profile-dropdown__divider" />
                            <button
                                type="button"
                                className="profile-dropdown__item dropdown__danger"
                                onClick={() => {
                                    close();
                                    setLogoutConfirm(true);
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
                confirmText={loggingOut ? "로그아웃 중..." : "로그아웃"}
                variant="danger"
                cancelText="취소"
                onClose={() => {
                    if (!loggingOut) setLogoutConfirm(false);
                }}
                onConfirm={async () => {
                    if (loggingOut) return;
                    setLoggingOut(true);
                    try {
                        await logout();
                    } catch {
                        // 서버 응답이 없어도 로컬 로그인 정보는 logout()에서 지워진다.
                    } finally {
                        setLoggingOut(false);
                        setLogoutConfirm(false);
                        navigate(PATHS.LOGIN, { replace: true });
                    }
                }}
            />
        </aside>
    );
}

export default Sidebar;
