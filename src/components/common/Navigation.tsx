import { NavLink, useNavigate } from "react-router-dom";
import passOnLogo from "../../assets/passon-logo.png";
import iconBell from "../../assets/Icon-bell.png";
import { useState } from "react";
import { logout } from "../../api/auth";
import type { Notification, Store, StoreRole } from "../../types/api";
import useDropdown from "../hooks/useDropdown";
import ConfirmDialog from "../ui/ConfirmDialog";
import NotificationDropdown from "./NotificationDropdown";
import { ROLE_BADGE, TYPE_LABEL } from "../../features/stores/labels";
import { PATHS } from "../../routes/paths";

interface NavigationProps {
    userName: string;
    role?: StoreRole;
    storeId?: string;
    storeName?: string;
    stores: Store[];
    onSelectStore: (storeId: string) => void;
    notifications: Notification[];
    onReadNotification: (notification: Notification) => void;
    onReadAllNotifications: () => void;
}

const LINKS = [
    { to: "/app/dashboard", label: "대시보드" },
    { to: "/app/handovers", label: "인수인계" },
    { to: "/app/notices", label: "공지사항" },
    { to: "/app/employees", label: "직원 관리" },
    { to: "/app/schedule", label: "근무표" },
    { to: "/app/history", label: "기록 조회" },
    { to: "/app/delegate", label: "관리자 위임" },
    { to: "/app/store", label: "매장 설정" },
];

function Navigation({
    userName,
    role,
    storeId,
    storeName,
    stores,
    onSelectStore,
    notifications = [],
    onReadNotification,
    onReadAllNotifications,
}: NavigationProps) {
    const navigate = useNavigate();
    const unreadCount = notifications.filter((notification) => !notification.read).length;
    const { open, ref, toggle, close } = useDropdown<HTMLElement>();
    const [logoutConfirm, setLogoutConfirm] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const initial = storeName?.charAt(0) ?? "";

    async function confirmLogout() {
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
    }

    return (
    <header className="navigation" ref={ref}>
        <div className="navigation__brand">
            <NavLink to="/app/dashboard" className="navigation__logo">
                <img src={passOnLogo} alt="PassOn" />
            </NavLink>
            {storeName && (
                <div className="navigation__dropdown-wrap">
                    <button
                        type="button"
                        className="navigation__store"
                        aria-expanded={open === "store"}
                        onClick={() => toggle("store")}
                    >
                        <span className="navigation__store-mark">{initial}</span>
                        <span className="navigation__store-name">{storeName}</span>
                        <svg className="navigation__chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                            <path d="M2 3.5 L5 6.5 L8 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                    </button>
                    {open === "store" && (
                        <div className="navigation__dropdown navigation__dropdown--store" role="menu">
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
                                            {current && (
                                                <svg className="store-menu__check" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                                                    <path d="M3 7.2 L5.8 10 L11 4.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
        <nav className="navigation__menu">
            {LINKS.map((link) => (
                <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === "/app/handovers"}
                    className={({ isActive }) =>
                        isActive ? "navigation__link navigation__link--active" : "navigation__link"
                    }
                >
                    {link.label}
                </NavLink>
            ))}
        </nav>
        <div className="navigation__actions">
            <div className="navigation__dropdown-wrap">
                <button
                    type="button"
                    className="navigation__notification"
                    aria-label={unreadCount > 0 ? `알림 ${unreadCount}건` : "알림"}
                    onClick={() => toggle("noti")}
                >
                    <img className="navigation__bell" src={iconBell} alt="" width={20} height={20} />
                    {unreadCount > 0 && <span className="navigation__dot" />}
                </button>
                {open === "noti" && (
                    <div className="navigation__dropdown">
                        <NotificationDropdown
                            notifications={notifications}
                            onRead={onReadNotification}
                            onReadAll={onReadAllNotifications}
                        />
                    </div>
                )}
            </div>
            <NavLink to="/app/handovers/new" className="navigation__write">
                <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
                    <path d="M5.5 1 V10 M1 5.5 H10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <span>인수인계 작성</span>
            </NavLink>
            <div className="navigation__account">
                <div className="navigation__dropdown-wrap">
                    <button
                        type="button"
                        className="navigation__profile"
                        onClick={() => toggle("profile")}
                    >
                        <span className="navigation__avatar">{userName.charAt(0)}</span>
                        <span className="navigation__user">
                            <strong>{userName}</strong>
                            {role && <span>{role.toLowerCase()}</span>}
                        </span>
                        <svg className="navigation__chevron" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                            <path d="M2.5 4.5 L6 8 L9.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                    </button>
                    {open === "profile" && (
                        <div className="navigation__dropdown profile-dropdown">
                            <button type="button" className="profile-dropdown__item">내 정보</button>
                            <div className="profile-dropdown__divider"></div>
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
            onConfirm={confirmLogout}
        />
    </header>
    );
}

export default Navigation;
