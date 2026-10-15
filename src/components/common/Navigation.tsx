import { NavLink } from "react-router-dom";
import passOnLogo from "../../assets/passon-logo.png";
import { useEffect, useRef, useState } from "react";
import type { Notification } from "../../types/api";

interface NavigationProps {
    userName: string;
    notifications: Notification[];
}

function Navigation({userName, notifications = [], }: NavigationProps) {
    const [open, setOpen] = useState<"noti" | "profile" | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    // DOM 요소<div>를 참조하며 current 값의 초기값을 null로 설정

    useEffect(() => {
        const closeMenu = (e: MouseEvent) => {
            if (
                menuRef.current && !menuRef.current.contains(e.target as Node)
            ) {
                setOpen(null);
            }
        };

        document.addEventListener("mousedown", closeMenu);

        return () => {
            document.removeEventListener("mousedown", closeMenu);
            // 컴포넌트가 사라질 때 이벤트 리스너를 제거하여 메모리 누수를 방지
        };
    }, []);

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
        </div>
        <div className="navigation__actions" ref={menuRef}>
            <div className="navigation__dropdown-wrap">
                {/* 알림버튼 드롭다운 */}
                <button 
                    type="button" 
                    className="navigation__notification"
                    aria-label="알림"
                    onClick={() => setOpen(open === "noti" ? null : "noti")}
                >🔔
                </button>
                {open === "noti" && (
                    <div className="navigation__dropdown notification-dropdown">
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
            {/* 프로필 */}
            <div className="navigation__dropdown-wrap">
                <button 
                    type="button"
                    className="navigation__profile"
                    onClick={() => setOpen(open === "profile" ? null : "profile")}
                >
                    <span className="navigation__avatar">{userName.charAt(0)}</span>
                    <span className="navigation__user">{userName}</span>
                </button> 
                {open === "profile" && (
                    <div className="navigation__dropdown profile-dropdown">
                        <button type="button" className="profile-dropdown__item">내 정보</button>
                        <div className="profile-dropdown__divider"></div>
                        <button type="button" className="profile-dropdown__item dropdown__danger">
                            로그아웃
                        </button>
                    </div>
                )}
            </div>
        </div>
    </nav>
    );
}

export default Navigation;