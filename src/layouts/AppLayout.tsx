import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Navigation from "../components/common/Navigation";
import BottomNavigation from "../components/common/BottomNavigation";
import RightPanel from "../components/common/RightPanel";
import Loading from "../components/ui/Loading";
import ErrorState from "../components/ui/ErrorState";
import { getMe, loadMyPhoto } from "../api/users";
import { getStores } from "../api/stores";
import { loadStorePanel, loadTodayShifts, openStoreSocket } from "../api/live";
import { pickStore, selectStore, useCurrentStoreId } from "../features/stores/currentStore";
import { AppSessionProvider, type AppSession } from "./appSession";

import { getNotifications, readAllNotifications, readNotification } from "../api/notification";
import type { Card, Notification, Store, User } from "../types/api";
import type { ShiftResponse } from "../features/schedule/types";

function AppLayout() {
    const [user, setUser] = useState<User | null>(null);
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [openCards, setOpenCards] = useState<Card[]>([]);
    const [todayShifts, setTodayShifts] = useState<ShiftResponse[]>([]);
    const [liveLoading, setLiveLoading] = useState(false);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const photoUrlRef = useRef<string | null>(null);
    const photoEpoch = useRef(0);
    const photoOwner = useRef<string | null>(null);
    const selectedId = useCurrentStoreId();
    const currentStore = stores.find((store) => store.id === selectedId) ?? pickStore(stores);
    const cardEpoch = useRef(0);
    const shiftEpoch = useRef(0);
    const notificationEpoch = useRef(0);
    const receiveRef = useRef<(notification: Notification) => void>(() => undefined);

    useEffect(() => {
        let cancelled = false;

        async function loadApp() {
            try {
                setLoading(true);
                setError(false);
                const [userData, storeData] = await Promise.all([getMe(), getStores()]);
                if (cancelled) return;
                setUser(userData);
                setStores(storeData);
            } catch (loadError) {
                console.error(loadError);
                if (!cancelled) setError(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void loadApp();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!currentStore) {
            setNotifications([]);
            return;
        }
        const storeId = currentStore.id;
        const epoch = notificationEpoch.current;
        let cancelled = false;
        setNotifications([]);

        async function loadNotifications() {
            try {
                const items = await getNotifications(storeId);
                if (cancelled) return;
                if (epoch === notificationEpoch.current) {
                    setNotifications(items);
                    return;
                }
                setNotifications((current) => {
                    const seen = new Set(current.map((item) => item.id));
                    return [...current, ...items.filter((item) => !seen.has(item.id))];
                });
            } catch (loadError) {
                console.error("알림 조회 실패:", loadError);
                if (!cancelled && epoch === notificationEpoch.current) setNotifications([]);
            }
        }

        void loadNotifications();
        return () => {
            cancelled = true;
        };
    }, [currentStore?.id]);

    useEffect(() => {
        const storeId = currentStore?.id;
        if (!storeId) {
            setOpenCards([]);
            setTodayShifts([]);
            setLiveLoading(false);
            return;
        }
        const cardMark = ++cardEpoch.current;
        const shiftMark = ++shiftEpoch.current;
        let cancelled = false;
        setOpenCards([]);
        setTodayShifts([]);
        setLiveLoading(true);

        async function loadPanel() {
            try {
                const panel = await loadStorePanel(storeId);
                if (cancelled) return;
                if (cardMark === cardEpoch.current) setOpenCards(panel.cards);
                if (shiftMark === shiftEpoch.current) setTodayShifts(panel.shifts);
            } catch (loadError) {
                console.error("오른쪽 패널을 불러오지 못했습니다.", loadError);
                if (cancelled) return;
                if (cardMark === cardEpoch.current) setOpenCards([]);
                if (shiftMark === shiftEpoch.current) setTodayShifts([]);
            } finally {
                if (!cancelled) setLiveLoading(false);
            }
        }

        void loadPanel();
        return () => {
            cancelled = true;
        };
    }, [currentStore?.id]);

    useEffect(() => {
        const storeId = currentStore?.id;
        if (!storeId) return;
        return openStoreSocket(storeId, (message) => {
            if (message.type === "cards") {
                cardEpoch.current += 1;
                setOpenCards(message.cards);
            }
            if (message.type === "shifts") {
                shiftEpoch.current += 1;
                setTodayShifts(message.shifts);
            }
            if (message.type === "notification") receiveRef.current(message.notification);
        });
    }, [currentStore?.id]);

    const replaceUser = useCallback((next: User) => {
        setUser(next);
    }, []);

    // 프로필 사진 바꾸기
    const replacePhoto = useCallback((next: string | null) => {
        photoEpoch.current += 1;
        if (photoUrlRef.current && photoUrlRef.current !== next) {
            URL.revokeObjectURL(photoUrlRef.current);
        }
        photoUrlRef.current = next;
        setPhotoUrl(next);
    }, []);

    // 프로필 사진 불러오기
    useEffect(() => {
        if (!user?.id) return;

        if (photoOwner.current !== user.id) {
            photoOwner.current = user.id;
            if (photoUrlRef.current) replacePhoto(null);
        }

        // 사진이 없으면 다시 받지 않음
        if (user.photo === false) {
            if (photoUrlRef.current) replacePhoto(null);
            return;
        }

        // 방금 올린 사진이면 다시 받지 않음
        if (photoUrlRef.current) return;

        const epoch = photoEpoch.current;
        let cancelled = false;

        async function loadPhoto() {
            try {
                const blob = await loadMyPhoto();
                if (cancelled || epoch !== photoEpoch.current) return;
                const next = blob ? URL.createObjectURL(blob) : null;
                if (photoUrlRef.current && photoUrlRef.current !== next) {
                    URL.revokeObjectURL(photoUrlRef.current);
                }
                photoUrlRef.current = next;
                setPhotoUrl(next);
            } catch {
                if (!cancelled && epoch === photoEpoch.current) {
                    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
                    photoUrlRef.current = null;
                    setPhotoUrl(null);
                }
            }
        }

        void loadPhoto();
        return () => {
            cancelled = true;
        };
    }, [user?.id, user?.photo, replacePhoto]);

    const replaceStore = useCallback((store: Store) => {
        setStores((list) => list.map((item) => (item.id === store.id ? store : item)));
    }, []);

    const replaceStores = useCallback((next: Store[]) => {
        setStores(next);
    }, []);

    const reloadTodayShifts = useCallback(async () => {
        const storeId = currentStore?.id;
        if (!storeId) return;
        const shiftMark = shiftEpoch.current;
        try {
            const shifts = await loadTodayShifts(storeId);
            if (shiftMark === shiftEpoch.current) setTodayShifts(shifts);
        } catch (loadError) {
            console.error("오늘 근무를 불러오지 못했습니다.", loadError);
        }
    }, [currentStore?.id]);

    function receiveNotification(notification: Notification) {
        notificationEpoch.current += 1;
        setNotifications((current) => {
            const exists = current.some((item) => item.id === notification.id);
            if (exists) {
                return current.map((item) => (item.id === notification.id ? notification : item));
            }
            return [notification, ...current];
        });
    }
    receiveRef.current = receiveNotification;

    async function markRead(notification: Notification) {
        if (notification.read) return;
        notificationEpoch.current += 1;
        try {
            const updated = await readNotification(notification.id);
            setNotifications((current) => current.map((item) => (item.id === updated.id ? updated : item)));
        } catch (readError) {
            console.error("알림 읽음 처리 실패:", readError);
        }
    }

    async function markAllRead() {
        if (!currentStore) return;
        notificationEpoch.current += 1;
        try {
            await readAllNotifications(currentStore.id);
            setNotifications((current) => current.map((item) => ({ ...item, read: true })));
        } catch (readError) {
            console.error("알림 전체 읽음 처리 실패:", readError);
        }
    }

    const session = useMemo<AppSession>(
        () => ({
            user: user ?? { id: "", email: "", name: "" },
            stores,
            currentStore,
            openCards,
            todayShifts,
            liveLoading,
            photoUrl,
            replaceUser,
            replacePhoto,
            replaceStore,
            replaceStores,
            setOpenCards,
            reloadTodayShifts,
        }),
        [user, stores, currentStore, openCards, todayShifts, liveLoading, photoUrl, replaceUser, replacePhoto, replaceStore, replaceStores, reloadTodayShifts],
    );

    if (loading) {
        return <Loading text="사용자 정보를 불러오는 중입니다..." />;
    }

    if (error || !user) {
        return <ErrorState title="정보를 불러오지 못했습니다." description="잠시 후 다시 시도해 주세요." />;
    }

    return (
        <AppSessionProvider value={session}>
            <div className="app-layout">
                <Sidebar
                    userName={user.name}
                    photoUrl={photoUrl}
                    userEmail={user.email}
                    role={currentStore?.myRole}
                    storeId={currentStore?.id}
                    storeName={currentStore?.name}
                    stores={stores}
                    onSelectStore={selectStore}
                    notifications={notifications}
                    onReadNotification={markRead}
                    onReadAllNotifications={markAllRead}
                />

                <div className="app-content">
                    <Navigation
                        userName={user.name}
                        photoUrl={photoUrl}
                        role={currentStore?.myRole}
                        storeId={currentStore?.id}
                        storeName={currentStore?.name}
                        stores={stores}
                        onSelectStore={selectStore}
                        notifications={notifications}
                        onReadNotification={markRead}
                        onReadAllNotifications={markAllRead}
                    />

                    <div className="app-body">
                        <main className="app-main">
                            <Outlet context={session} />
                        </main>
                        {currentStore && (
                            <RightPanel
                                userName={user.name}
                                notifications={notifications}
                                cards={openCards}
                                shifts={todayShifts}
                            />
                        )}
                    </div>
                    <BottomNavigation
                        userName={user.name}
                        photoUrl={photoUrl}
                        role={currentStore?.myRole}
                        storeId={currentStore?.id}
                        storeName={currentStore?.name}
                        stores={stores}
                        onSelectStore={selectStore}
                        notifications={notifications}
                        onReadNotification={markRead}
                        onReadAllNotifications={markAllRead}
                    />
                </div>
            </div>
        </AppSessionProvider>
    );
}

export default AppLayout;
