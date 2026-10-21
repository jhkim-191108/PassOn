// 매장 설정 데이터. 화면은 components가 그리고, 저장과 삭제는 여기서 한다.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "@/api/client";
import { deleteStore, getStores, updateStore } from "@/api/stores";
import { getMe, getNotificationSettings, updateMe, updateNotificationSettings } from "@/api/users";
import { PATHS } from "@/routes/paths";
import type { NotificationSettings, Store, User } from "@/types/api";
import { pickStore, useCurrentStoreId } from "@/features/stores/currentStore";

function errorText(error: unknown, fallback: string) {
    return error instanceof ApiError && error.message ? error.message : fallback;
}

export function useStoreSettings() {
    const navigate = useNavigate();
    const [stores, setStores] = useState<Store[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [accountName, setAccountName] = useState("");
    const [storeName, setStoreName] = useState("");
    const [settings, setSettings] = useState<NotificationSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [pending, setPending] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const busy = useRef(false);

    useEffect(() => {
        let cancelled = false;

        async function start() {
            try {
                const [storeList, me, notificationSettings] = await Promise.all([
                    getStores(),
                    getMe(),
                    getNotificationSettings(),
                ]);
                if (cancelled) return;
                const chosen = pickStore(storeList);
                setStores(storeList);
                setUser(me);
                setAccountName(me.name);
                setStoreName(chosen?.name ?? "");
                setSettings(notificationSettings);
                if (storeList.length === 0) setMessage("매장이 없습니다.");
            } catch (error: unknown) {
                if (!cancelled) setMessage(errorText(error, "매장 설정을 불러오지 못했습니다."));
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        start();
        return () => {
            cancelled = true;
        };
    }, []);

    const selectedId = useCurrentStoreId();
    const current = stores.find((store) => store.id === selectedId) ?? stores[0] ?? null;
    const isOwner = current?.myRole === "OWNER";

    useEffect(() => {
        if (current) setStoreName(current.name);
    }, [current]);

    async function saveStoreName(event?: FormEvent<HTMLFormElement>) {
        event?.preventDefault();
        if (!current || !isOwner || busy.current) return;
        const nextName = storeName.trim();
        if (!nextName) {
            setStoreName(current.name);
            setMessage("매장 이름을 입력해 주세요.");
            return;
        }
        if (nextName === current.name) return;
        busy.current = true;
        setPending(true);
        setMessage("");
        try {
            const updated = await updateStore(current.id, nextName);
            setStores((list) => list.map((item) => (item.id === updated.id ? updated : item)));
            setStoreName(updated.name);
        } catch (error: unknown) {
            setMessage(errorText(error, "매장 이름을 저장하지 못했습니다."));
        } finally {
            busy.current = false;
            setPending(false);
        }
    }

    async function saveAccountName(event?: FormEvent<HTMLFormElement>) {
        event?.preventDefault();
        if (!user || busy.current) return;
        const nextName = accountName.trim();
        if (!nextName) {
            setAccountName(user.name);
            setMessage("이름을 입력해 주세요.");
            return;
        }
        if (nextName === user.name) return;
        busy.current = true;
        setPending(true);
        setMessage("");
        try {
            const updated = await updateMe(nextName);
            setUser(updated);
            setAccountName(updated.name);
        } catch (error: unknown) {
            setMessage(errorText(error, "이름을 저장하지 못했습니다."));
        } finally {
            busy.current = false;
            setPending(false);
        }
    }

    async function toggleSetting(key: keyof NotificationSettings) {
        if (!settings || busy.current) return;
        const next = !settings[key];
        const previous = settings;
        busy.current = true;
        setSettings({ ...settings, [key]: next });
        setPending(true);
        setMessage("");
        try {
            const updated = await updateNotificationSettings({ [key]: next });
            setSettings(updated);
        } catch (error: unknown) {
            setSettings(previous);
            setMessage(errorText(error, "알림 설정을 저장하지 못했습니다."));
        } finally {
            busy.current = false;
            setPending(false);
        }
    }

    async function confirmDelete() {
        if (!current) return;
        setPending(true);
        setMessage("");
        try {
            await deleteStore(current.id);
            navigate(PATHS.STORE_SETUP);
        } catch (error: unknown) {
            setDeleteOpen(false);
            setMessage(errorText(error, "매장을 폐쇄하지 못했습니다."));
            setPending(false);
        }
    }

    return {
        current,
        stores,
        user,
        isOwner,
        accountName,
        setAccountName,
        storeName,
        setStoreName,
        settings,
        loading,
        message,
        pending,
        deleteOpen,
        setDeleteOpen,
        saveStoreName,
        saveAccountName,
        toggleSetting,
        confirmDelete,
    };
}
