import { NavLink } from "react-router-dom";
import passOnLogo from "../../assets/passon-logo.png";

function Sidebar() {
    const userName = "전재형";

    return (
        <aside className="sidebar">
            <NavLink to="/app/dashboard" className="sidebar__logo">
                <img src={passOnLogo} alt="PassOn" />
            </NavLink>

            <div className="sidebar__store">
                <span className="sidebar__store-label">현재 매장</span>
                <strong>PassOn 카페</strong>
            </div>

            <nav className="sidebar__menu">
                <NavLink
                    to="/app/dashboard"
                    className={({ isActive }) =>
                    isActive
                    ? "sidebar__link sidebar__link--active"
                    : "sidebar__link"
                    }
                >
                    대시보드
                </NavLink>

                <NavLink
                    to="/app/handovers"
                    className={({ isActive }) =>
                    isActive
                    ? "sidebar__link sidebar__link--active"
                    : "sidebar__link"
                    }
                >
                    인수인계
                </NavLink>

                <NavLink
                    to="/app/notices"
                    className={({ isActive }) =>
                    isActive
                    ? "sidebar__link sidebar__link--active"
                    : "sidebar__link"
                    }
                >
                    공지사항
                </NavLink>

                <div className="sidebar__divider" />

                <NavLink
                    to="/app/employees"
                    className={({ isActive }) =>
                    isActive
                    ? "sidebar__link sidebar__link--active"
                    : "sidebar__link"
                    }
                >
                    직원 관리
                </NavLink>

                <NavLink
                    to="/app/schedule"
                    className={({ isActive }) =>
                    isActive
                    ? "sidebar__link sidebar__link--active"
                    : "sidebar__link"
                    }
                >
                    근무표
                </NavLink>

                <NavLink
                    to="/app/history"
                    className={({ isActive }) =>
                    isActive
                    ? "sidebar__link sidebar__link--active"
                    : "sidebar__link"
                    }
                >
                    기록 조회
                </NavLink>
            </nav>
            <div className="sidebar__bottom">
                <button type="button" className="sidebar__action">
                    🔔알림
                </button>

                <button type="button" className="sidebar__profile">
                    <span className="sidebar__avatar">
                        {userName.charAt(0)}
                    </span>

                    <span>{userName}</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;