import { createContext, useContext, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { ShiftResponse } from "@/features/schedule/types";
import type { Card, Store, User } from "@/types/api";

export interface AppSession {
    user: User;
    stores: Store[];
    currentStore: Store | null;
    openCards: Card[];
    todayShifts: ShiftResponse[];
    liveLoading: boolean;
    photoUrl: string | null;
    replaceUser: (user: User) => void;
    replacePhoto: (url: string | null) => void;
    replaceStore: (store: Store) => void;
    replaceStores: (stores: Store[]) => void;
    setOpenCards: Dispatch<SetStateAction<Card[]>>;
    reloadTodayShifts: () => Promise<void>;
}

const AppSessionContext = createContext<AppSession | null>(null);

export function AppSessionProvider({ value, children }: { value: AppSession; children: ReactNode }) {
    return <AppSessionContext.Provider value={value}>{children}</AppSessionContext.Provider>;
}

export function useAppSession() {
    const session = useContext(AppSessionContext);
    if (!session) {
        throw new Error("앱 화면 안에서만 사용할 수 있습니다.");
    }
    return session;
}

export function useOptionalAppSession() {
    return useContext(AppSessionContext);
}
