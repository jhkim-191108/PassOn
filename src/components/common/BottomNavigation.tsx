import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import iconHome from "../../assets/Icon-home.png";
import iconHandover from "../../assets/Icon-handover.png";
import iconSchedule from "../../assets/Icon-schedule.png";
import iconBell from "../../assets/Icon-bell.png";
import iconMore from "../../assets/Icon-more.png";
import iconNotice from "../../assets/Icon-notice.png";
import iconEmployees from "../../assets/Icon-employees.png";
import iconHistory from "../../assets/Icon-history.png";
import iconStore from "../../assets/Icon-store.png";
import iconDelegate from "../../assets/Icon-delegate.png";
import NotificationDropdown from "./NotificationDropdown";
import ConfirmDialog from "../ui/ConfirmDialog";
import { logout } from "../../api/auth";
import { ROLE_BADGE, TYPE_LABEL } from "../../features/stores/labels";
import { PATHS } from "../../routes/paths";
import type { Notification, Store, StoreRole } from "../../types/api";

interface BottomNavigationProps {
    userName?: string;
    role?: StoreRole;
    storeId?: string;
    storeName?: string;
    stores?: Store[];
    onSelectStore?: (storeId: string) => void;
    notifications?: Notification[];
    onReadNotification?: (notification: Notification) => void;
    onReadAllNotifications?: () => void;
}

const TABS = [
    { to: "/app/dashboard", label: "홈", icon: iconHome, end: true },
    { to: "/app/handovers", label: "인수인계", icon: iconHandover, end: false },
    { to: "/app/schedule", label: "근무표", icon: iconSchedule, end: false },
];

const MORE_LINKS = [
    { to: "/app/notices", label: "공지사항", icon: iconNotice },
    { to: "/app/employees", label: "직원 관리", icon: iconEmployees },
    { to: "/app/history", label: "기록 조회", icon: iconHistory },
    { to: "/app/delegate", label: "관리자 위임", icon: iconDelegate },
    { to: "/app/store", label: "매장 설정", icon: iconStore },
];

function BottomNavigation({
    userName = "",
    role,
    storeId,
    storeName,
    stores = [],
    onSelectStore = () => {},
    notifications = [],
    onReadNotification = () => {},
    onReadAllNotifications = () => {},
}: BottomNavigationProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [panel, setPanel] = useState<"noti" | "more" | null>(null);
    const [storeOpen, setStoreOpen] = useState(false);
    const [logoutConfirm, setLogoutConfirm] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const unreadCount = notifications.filter((notification) => !notification.read).length;
    const storeLine = [storeName, role ? role.toLowerCase() : ""].filter(Boolean).join(" · ");

    useEffect(() => {
        setPanel(null);
        setStoreOpen(false);
    }, [location.pathname]);

    return (
        <nav className="bottom-nav">
            {panel === "noti" && (
                <div className="bottom-nav__sheet" onClick={() => setPanel(null)}>
                    <div
                        className="bottom-nav__sheet-panel bottom-nav__sheet-panel--noti"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="bottom-nav__sheet-handle" />
                        <NotificationDropdown
                            notifications={notifications}
                            onRead={onReadNotification}
                            onReadAll={onReadAllNotifications}
                        />
                    </div>
                </div>
            )}
            {panel === "more" && (
                <div className="bottom-nav__sheet" onClick={() => setPanel(null)}>
                    <div className="bottom-nav__sheet-panel" onClick={(event) => event.stopPropagation()}>
                        <div className="bottom-nav__sheet-handle" />
                        <div className="bottom-nav__sheet-user">
                            <span className="bottom-nav__sheet-avatar">{userName.charAt(0)}</span>
                            <span className="bottom-nav__sheet-id">
                                <strong>{userName}</strong>
                                <button type="button" className="bottom-nav__sheet-meta" onClick={() => setStoreOpen((current) => !current)}>
                                    {storeLine || "매장 없음"}
                                </button>
                            </span>
                            <button type="button" className="bottom-nav__mypage">마이페이지</button>
                            <button
                                type="button"
                                className="bottom-nav__logout"
                                onClick={() => setLogoutConfirm(true)}
                            >
                                로그아웃
                            </button>
                        </div>
                        {storeOpen && (
                            <div className="bottom-nav__stores" role="menu">
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
                                                onClick={() => {
                                                    onSelectStore(store.id);
                                                    setStoreOpen(false);
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
                        <div className="bottom-nav__sheet-grid">
                            {MORE_LINKS.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className={({ isActive }) =>
                                        isActive ? "bottom-nav__more-link bottom-nav__more-link--active" : "bottom-nav__more-link"
                                    }
                                >
                                    <span className="bottom-nav__more-icon-wrap">
                                        <img className="bottom-nav__more-icon" src={link.icon} alt="" width={22} height={22} />
                                    </span>
                                    {link.label}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {TABS.map((tab) => (
                <NavLink
                    key={tab.to}
                    to={tab.to}
                    end={tab.end}
                    className={({ isActive }) =>
                        isActive ? "bottom-nav__link bottom-nav__link--active" : "bottom-nav__link"
                    }
                    onClick={() => setPanel(null)}
                >
                    <img className="bottom-nav__icon" src={tab.icon} alt="" width={20} height={20} />
                    {tab.label}
                </NavLink>
            ))}
            <button
                type="button"
                className={panel === "noti" ? "bottom-nav__button bottom-nav__button--active" : "bottom-nav__button"}
                onClick={() => setPanel((current) => (current === "noti" ? null : "noti"))}
            >
                <img className="bottom-nav__icon" src={iconBell} alt="" width={20} height={20} />
                알림
                {unreadCount > 0 && <span className="bottom-nav__badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
            </button>
            <button
                type="button"
                className={panel === "more" ? "bottom-nav__button bottom-nav__button--active" : "bottom-nav__button"}
                onClick={() => setPanel((current) => (current === "more" ? null : "more"))}
            >
                <img className="bottom-nav__icon" src={iconMore} alt="" width={20} height={20} />
                더보기
            </button>
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
        </nav>
    );
}

export default BottomNavigation;
