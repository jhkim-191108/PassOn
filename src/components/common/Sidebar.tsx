import { NavLink } from "react-router-dom";
import passOnLogo from "../../assets/passon-logo.png";
import { navItems } from "./navItems";

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