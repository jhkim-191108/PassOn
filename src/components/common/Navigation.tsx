import { NavLink } from "react-router-dom";
import passOnLogo from "../../assets/passon-logo.png";
import { useEffect, useRef, useState } from "react";

function Navigation() {
    const userName = "전재형";
    const [open, setOpen] = useState<"noti" | "profile" | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

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
                    onClick={() => setOpen(open === "noti" ? null : "noti")}
                >🔔
                </button>
                {open === "noti" && (
                    <div className="navigation__dropdown notification-dropdown">
                        <div className="navigation__dropdown-header">
                            <strong>알림</strong>
                        </div>

                        <button type="button" className="notification-dropdown__item">
                            새로운 인수인계가 등록되었습니다.
                        </button>

                        <button type="button" className="notification-dropdown__item dropdown__danger">
                            긴급 인수인계를 확인해주세요.
                        </button>
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