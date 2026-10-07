import { NavLink } from "react-router-dom";
import passOnLogo from "../../assets/passon-logo.png";


function Navigation() {
    const userName = "전재형";
    

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
        <div className="navigation__actions">
            <button type="button" className="navigation__notification">🔔</button>
            <span className="navigation__avatar">{userName.charAt(0)}</span>
            <span className="navigation__user">{userName}</span>
        </div>
    </nav>
    );
}

export default Navigation;