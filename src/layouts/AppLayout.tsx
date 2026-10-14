import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Navigation from "../components/common/Navigation";
import BottomNavigation from "../components/common/BottomNavigation";

function AppLayout() {
    return (
        <div className="app-layout">
            <Sidebar/>

            <div className="app-content">
                <Navigation />
                
                <main className="app-main">
                    <Outlet/>
                </main>
                <BottomNavigation />
            </div>
        </div>
    );
}

export default AppLayout;