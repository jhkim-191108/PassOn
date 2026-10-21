import { NavLink } from "react-router-dom";
import passOnLogo from "../../assets/passon-logo.png";
import { useState } from "react";
import type { Notification } from "../../types/api";
import useDropdown from "../hooks/useDropdown";
import ConfirmDialog from "../ui/ConfirmDialog";
import NotificationDropdown from "./NotificationDropdown";

interface NavigationProps {
    userName: string;
    notifications: Notification[];
    onReadNotification: (notification: Notification) => void;
    onReadAllNotifications: () => void;
}

function Navigation({ userName, notifications = [], onReadNotification, onReadAllNotifications }: NavigationProps) {
    const unreadCount = notifications.filter((notification) => !notification.read).length;
    const { open, ref, toggle, close } = useDropdown();
    const [logoutConfirm, setLogoutConfirm] = useState(false);


    return (
    <nav className="navigation">
        <NavLink to="/app/dashboard" className="navigation__logo">
            <img src={passOnLogo} alt="PassOn" />
        </NavLink>
        <div className="navigation__menu">
            <NavLink 
                to="/app/dashboard"
                className={({ isActive }) => 
                    isActive ? "navigation__link navigation__link--active" : "navigation__link"
                }
            >
                대시보드
            </NavLink>

            <NavLink to="/app/handovers"className={({ isActive }) => 
                    isActive ? "navigation__link navigation__link--active" : "navigation__link"
                }
            >
                인수인계
            </NavLink>
            <NavLink to="/app/notices" className={({ isActive }) => 
                    isActive ? "navigation__link navigation__link--active" : "navigation__link"
                }
            >
                공지사항
            </NavLink>
            <NavLink to="/app/employees" className={({ isActive }) => 
                    isActive ? "navigation__link navigation__link--active" : "navigation__link"
                }
            >
                직원관리
            </NavLink>
            <NavLink to="/app/schedule" className={({ isActive }) => 
                    isActive ? "navigation__link navigation__link--active" : "navigation__link"
                }
            >
                    근무표
            </NavLink>
            <NavLink to="/app/history" className={({ isActive }) => 
                    isActive ? "navigation__link navigation__link--active" : "navigation__link"
                }
            >
                기록 조회
            </NavLink>
            <NavLink to="/app/store" className={({ isActive }) =>
                    isActive ? "navigation__link navigation__link--active" : "navigation__link"
                }
            >
                매장 설정
            </NavLink>
        </div>
        <div className="navigation__actions" ref={ref}>
            <div className="navigation__dropdown-wrap">
                {/* 알림버튼 드롭다운 */}
                <button
                    type="button"
                    className="navigation__notification"
                    aria-label={unreadCount > 0 ? `알림 ${unreadCount}건` : "알림"}
                    onClick={() => toggle("noti")}
                >
                    🔔
                    {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
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
            {/* 프로필 */}
            <div className="navigation__dropdown-wrap">
                <button 
                    type="button"
                    className="navigation__profile"
                    onClick={() => toggle("profile")}
                >
                    <span className="navigation__avatar">{userName.charAt(0)}</span>
                    <span className="navigation__user">{userName}</span>
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
    </nav>
    );
}

export default Navigation;