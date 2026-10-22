import { useEffect, useState } from "react";

const KEY = "passon.currentStoreId";
const EVENT = "passon-store";

export function readCurrentStoreId() {
    return sessionStorage.getItem(KEY);
}

export function selectStore(id: string) {
    if (readCurrentStoreId() === id) return;
    sessionStorage.setItem(KEY, id);
    window.dispatchEvent(new Event(EVENT));
}

export function clearCurrentStore() {
    sessionStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
}

export function pickStore<T extends { id: string }>(stores: T[]) {
    const saved = readCurrentStoreId();
    return stores.find((store) => store.id === saved) ?? stores[0] ?? null;
}

export function useCurrentStoreId() {
    const [id, setId] = useState(readCurrentStoreId);

    useEffect(() => {
        const sync = () => setId(readCurrentStoreId());
        window.addEventListener(EVENT, sync);
        return () => window.removeEventListener(EVENT, sync);
    }, []);

    return id;
}
