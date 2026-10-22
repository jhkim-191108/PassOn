import { NavLink, useNavigate } from "react-router-dom";
import passOnLogo from "../../assets/icon-logo.png";
import iconBell from "../../assets/Icon-bell.png";
import iconChevron from "../../assets/Icon-chevron.png";
import iconCheck from "../../assets/Icon-check.png";
import iconPlus from "../../assets/Icon-plus.png";
import iconMypage from "../../assets/Icon-mypage.png";
import iconLogout from "../../assets/Icon-logout.png";
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
    photoUrl?: string | null;
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
    photoUrl,
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
                        <img className="navigation__chevron" src={iconChevron} alt="" width={10} height={10} />
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
                                                <img className="store-menu__check" src={iconCheck} alt="" width={14} height={14} />
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
                <img src={iconPlus} alt="" width={11} height={11} />
                <span>인수인계 작성</span>
            </NavLink>
            <div className="navigation__account">
                <div className="navigation__dropdown-wrap">
                    <button
                        type="button"
                        className="navigation__profile"
                        onClick={() => toggle("profile")}
                    >
                        <span className="navigation__avatar">
                            {photoUrl ? <img src={photoUrl} alt="" /> : userName.charAt(0)}
                        </span>
                        <span className="navigation__user">
                            <strong>{userName}</strong>
                            {role && <span>{role.toLowerCase()}</span>}
                        </span>
                        <img className="navigation__chevron" src={iconChevron} alt="" width={12} height={12} />
                    </button>
                    {open === "profile" && (
                        <div className="navigation__dropdown profile-dropdown">
                            <button
                                type="button"
                                className="profile-dropdown__item"
                                onClick={() => {
                                    close();
                                    navigate(PATHS.MYPAGE);
                                }}
                            >
                                <img className="profile-dropdown__icon" src={iconMypage} alt="" width={16} height={16} />
                                마이페이지
                            </button>
                            <div className="profile-dropdown__divider"></div>
                            <button
                                type="button"
                                className="profile-dropdown__item dropdown__danger"
                                onClick={() => {
                                    close();
                                    setLogoutConfirm(true);
                                }}
                            >
                                <img className="profile-dropdown__icon" src={iconLogout} alt="" width={16} height={16} />
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
