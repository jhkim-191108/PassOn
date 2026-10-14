import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Navigation from "../components/common/Navigation";
import BottomNavigation from "../components/common/BottomNavigation";
import Loading from "../components/ui/Loading";
import ErrorState from "../components/ui/ErrorState";
import { getMe } from "../api/users";
import { getStores } from "../api/stores";

import type {
    User,
    Store,
} from "../types/api"


function AppLayout() {
    const [user, setUser] = useState<User | null>(null);
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const loadApp = async () => {
            try {
                setLoading(true);
                setError(false);

                const [userData, storeData] = 
                    await Promise.all([
                        getMe(),
                        getStores(),
                    ]);

                setUser(userData);
                setStores(storeData);
            } catch (error) {
                console.error(error);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        loadApp();
    }, []);

    if (loading) {
        return <Loading text="사용자 정보를 불러오는 중입니다..." />
    }

    if (error || !user) {
        return (
            <ErrorState
                title="정보를 불러오지 못했습니다."
                description="잠시 후 다시 시도해 주세요." />
        );
    }

    const currentStore = stores[0];

    return (
        <div className="app-layout">
            <Sidebar userName={user.name} storeName={currentStore?.name ?? "매장 없음"} />

            <div className="app-content">
                <Navigation userName={user.name} />
                
                <main className="app-main">
                    <Outlet/>
                </main>
                <BottomNavigation />
            </div>
        </div>
    );
}

export default AppLayout;