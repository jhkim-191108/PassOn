// 공지 목록. 매장을 받은 뒤 공지를 한 번 넣고, 작성·수정·삭제는 같은 try-catch로 처리한다.
import { useEffect, useState } from "react";
import { ApiError } from "@/api/client";
import { createNotice, deleteNotice, getNotices, updateNotice, type NoticeInput } from "@/api/notices";
import { getStores } from "@/api/stores";
import { pickStore, useCurrentStoreId } from "@/features/stores/currentStore";
import type { Notice, Store } from "@/types/api";

function errorMessage(error: unknown, fallback: string) {
    if (error instanceof ApiError && error.message) return error.message;
    return fallback;
}

export function useNotices() {
    const [store, setStore] = useState<Store | null>(null);
    const [notices, setNotices] = useState<Notice[]>([]);
    const [message, setMessage] = useState("");
    const [pending, setPending] = useState(false);
    const [loading, setLoading] = useState(true);
    const selectedId = useCurrentStoreId();

    useEffect(() => {
        let cancelled = false;

        async function start() {
            try {
                setLoading(true);
                setStore(null);
                setNotices([]);
                const stores = await getStores();
                const current = pickStore(stores);
                if (!current) {
                    if (!cancelled) setMessage("매장이 없습니다.");
                    return;
                }
                const list = await getNotices(current.id);
                if (!cancelled) {
                    setStore(current);
                    setNotices(Array.isArray(list) ? list : []);
                }
            } catch (error: unknown) {
                if (!cancelled) setMessage(errorMessage(error, "공지를 불러오지 못했습니다."));
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        start();
        return () => {
            cancelled = true;
        };
    }, [selectedId]);

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

    function saveNotice(input: NoticeInput, noticeId?: string): Promise<Notice[] | undefined> {
        if (!store) return Promise.resolve(undefined);
        const storeId = store.id;
        return run(async () => {
            if (noticeId) await updateNotice(storeId, noticeId, input);
            else await createNotice(storeId, input);
            return getNotices(storeId);
        }, noticeId ? "공지를 수정하지 못했습니다." : "공지를 등록하지 못했습니다.");
    }

    function removeNotice(noticeId: string) {
        if (!store) return Promise.resolve();
        const storeId = store.id;
        return run(async () => {
            await deleteNotice(storeId, noticeId);
            return getNotices(storeId);
        }, "공지를 삭제하지 못했습니다.");
    }

    const canEdit = store?.myRole === "OWNER" || store?.myRole === "MANAGER";

    return { store, notices, message, pending, loading, canEdit, saveNotice, removeNotice };
}
