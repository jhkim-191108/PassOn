// 매장 설정 데이터. 사용자와 매장 목록은 레이아웃이 갖고, 여기서는 알림 설정과 저장만 한다.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ApiError } from "@/api/client";
import { deleteStore, updateStore } from "@/api/stores";
import { getNotificationSettings, updateNotificationSettings } from "@/api/users";
import type { NotificationSettings } from "@/types/api";
import { clearCurrentStore, selectStore } from "@/features/stores/currentStore";
import { useAppSession } from "@/layouts/appSession";

function errorText(error: unknown, fallback: string) {
    return error instanceof ApiError && error.message ? error.message : fallback;
}

export function useStoreSettings() {
    const { user, stores, currentStore, replaceStore, replaceStores } = useAppSession();
    const current = currentStore;
    const [storeName, setStoreName] = useState(current?.name ?? "");
    const [settings, setSettings] = useState<NotificationSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [pending, setPending] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const busy = useRef(false);
    const isOwner = current?.myRole === "OWNER";

    useEffect(() => {
        let cancelled = false;

        async function start() {
            try {
                const notificationSettings = await getNotificationSettings();
                if (!cancelled) setSettings(notificationSettings);
            } catch (error: unknown) {
                if (!cancelled) setMessage(errorText(error, "매장 설정을 불러오지 못했습니다."));
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void start();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (current) setStoreName(current.name);
    }, [current?.id, current?.name]);

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
            replaceStore(updated);
            setStoreName(updated.name);
        } catch (error: unknown) {
            setMessage(errorText(error, "매장 이름을 저장하지 못했습니다."));
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
        if (!current || !isOwner || busy.current) return;
        busy.current = true;
        setPending(true);
        setMessage("");
        try {
            await deleteStore(current.id);
            const rest = stores.filter((store) => store.id !== current.id);
            replaceStores(rest);
            setDeleteOpen(false);
            const next = rest[0];
            if (next) {
                selectStore(next.id);
                setStoreName(next.name);
            } else {
                clearCurrentStore();
                setStoreName("");
                setMessage("매장을 폐쇄했습니다.");
            }
        } catch (error: unknown) {
            setDeleteOpen(false);
            setMessage(errorText(error, "매장을 폐쇄하지 못했습니다."));
        } finally {
            busy.current = false;
            setPending(false);
        }
    }

    return {
        current,
        stores,
        user,
        isOwner,
        storeName,
        setStoreName,
        settings,
        loading,
        message: message || (current ? "" : "매장이 없습니다."),
        pending,
        deleteOpen,
        setDeleteOpen,
        saveStoreName,
        toggleSetting,
        confirmDelete,
    };
}
