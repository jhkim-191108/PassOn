// 공지 목록. 매장은 레이아웃이 갖고, 여기서는 공지만 받는다.
import { useEffect, useState } from "react";
import { ApiError } from "@/api/client";
import { createNotice, deleteNotice, getNotices, updateNotice, type NoticeInput } from "@/api/notices";
import { useAppSession } from "@/layouts/appSession";
import type { Notice } from "@/types/api";

function errorMessage(error: unknown, fallback: string) {
    if (error instanceof ApiError && error.message) return error.message;
    return fallback;
}

export function useNotices() {
    const { currentStore } = useAppSession();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [message, setMessage] = useState("");
    const [pending, setPending] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const store = currentStore;
        if (!store) {
            setNotices([]);
            setMessage("매장이 없습니다.");
            setLoading(false);
            return;
        }
        const storeId = store.id;
        let cancelled = false;

        async function start() {
            try {
                setLoading(true);
                setMessage("");
                const list = await getNotices(storeId);
                if (!cancelled) setNotices(Array.isArray(list) ? list : []);
            } catch (error: unknown) {
                if (!cancelled) setMessage(errorMessage(error, "공지를 불러오지 못했습니다."));
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void start();
        return () => {
            cancelled = true;
        };
    }, [currentStore?.id]);

    async function run(task: () => Promise<Notice[]>, fallback: string) {
        setMessage("");
        setPending(true);
        try {
            const next = await task();
            setNotices(next);
            return next;
        } catch (error: unknown) {
            setMessage(errorMessage(error, fallback));
            throw error;
        } finally {
            setPending(false);
        }
    }

    async function saveNotice(input: NoticeInput, noticeId?: string) {
        if (!currentStore) return undefined;
        const storeId = currentStore.id;
        return run(async () => {
            if (noticeId) await updateNotice(storeId, noticeId, input);
            else await createNotice(storeId, input);
            return getNotices(storeId);
        }, noticeId ? "공지를 수정하지 못했습니다." : "공지를 등록하지 못했습니다.");
    }

    async function removeNotice(noticeId: string) {
        if (!currentStore) return undefined;
        const storeId = currentStore.id;
        return run(async () => {
            await deleteNotice(storeId, noticeId);
            return getNotices(storeId);
        }, "공지를 삭제하지 못했습니다.");
    }

    const canEdit = currentStore?.myRole === "OWNER" || currentStore?.myRole === "MANAGER";

    return { store: currentStore, notices, message, pending, loading, canEdit, saveNotice, removeNotice };
}
