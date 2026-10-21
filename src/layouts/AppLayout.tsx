import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Navigation from "../components/common/Navigation";
import BottomNavigation from "../components/common/BottomNavigation";
import RightPanel from "../components/common/RightPanel";
import Loading from "../components/ui/Loading";
import ErrorState from "../components/ui/ErrorState";
import { getMe } from "../api/users";
import { getStores } from "../api/stores";
import { pickStore, useCurrentStoreId } from "../features/stores/currentStore";

import { getNotifications, readAllNotifications, readNotification } from "../api/notification";
import type { Notification } from "../types/api";

import type {
    User,
    Store,
} from "../types/api"


function AppLayout() {
    const [user, setUser] = useState<User | null>(null);
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [notifications, setNotifications] =
        useState<Notification[]>([]);
    useCurrentStoreId();
    const currentStore = pickStore(stores);

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

    useEffect(() => {
        if (!currentStore) return;
        let cancelled = false;

        getNotifications(currentStore.id)
            .then((items) => {
                if (!cancelled) setNotifications(items);
            })
            .catch((loadError) => {
                console.error("알림 조회 실패:", loadError);
                if (!cancelled) setNotifications([]);
            });

        return () => {
            cancelled = true;
        };
    }, [currentStore?.id]);

    async function markRead(notification: Notification) {
        if (notification.read) return;
        try {
            const updated = await readNotification(notification.id);
            setNotifications((current) =>
                current.map((item) => (item.id === updated.id ? updated : item)),
            );
        } catch (error) {
            console.error("알림 읽음 처리 실패:", error);
        }
    }

    async function markAllRead() {
        if (!currentStore) return;
        try {
            await readAllNotifications(currentStore.id);
            setNotifications((current) => current.map((item) => ({ ...item, read: true })));
        } catch (error) {
            console.error("알림 전체 읽음 처리 실패:", error);
        }
    }

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

    return (
        <div className="app-layout">
            <Sidebar 
                userName={user.name} 
                storeName={currentStore?.name ?? "매장 없음"} 
                notifications={notifications}
                onReadNotification={markRead}
                onReadAllNotifications={markAllRead}
            />

            <div className="app-content">
                <Navigation
                    userName={user.name}
                    notifications={notifications}
                    onReadNotification={markRead}
                    onReadAllNotifications={markAllRead}
                />
                
                <div className="app-body">
                    <main className="app-main">
                        <Outlet context={{ currentStore }}/>
                    </main>
                    {currentStore && (
                        <RightPanel
                            storeId={currentStore.id}
                            userName={user.name}
                            notifications={notifications}
                        />
                    )}
                </div>
                <BottomNavigation />
            </div>
        </div>
    );
}

export default AppLayout;