import { NavLink } from "react-router-dom";
import { navItems } from "./navItems";

function BottomNavigation() {
    return (
        <nav className="bottom-nav">
            {navItems.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                    isActive
                    ? "bottom-nav__link bottom-nav__link--active"
                    : "bottom-nav__link"
                    }
                >
                    {item.label}
                </NavLink>
            ))}
        </nav>
    );
}


export default BottomNavigation;