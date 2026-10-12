import {Outlet} from "react-router-dom";
import Navigation from "../components/common/Navigation";
import Sidebar from "../components/common/Sidebar";

function AppLayout() {
    return (
        <div className="app-layout">
            <Sidebar/>

            <main className="app-main">
                <Outlet/>
            </main>
        </div>
    );
}

export default AppLayout;