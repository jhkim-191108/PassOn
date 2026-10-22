// 직원관리 데이터. 매장과 내 정보는 레이아웃이 갖고, 여기서는 팀·멤버만 받는다.
import { useEffect, useMemo, useRef, useState } from "react";
import { api, ApiError } from "@/api/client";
import type { Store, StoreRole } from "@/types/api";
import type { Member, Team } from "../types";
import { useAppSession } from "@/layouts/appSession";
import { groupMembers } from "../utils/memberGroups";

function errorMessage(error: unknown, fallback: string) {
    return error instanceof ApiError ? error.message : fallback;
}

export function useEmployees() {
    const { user, currentStore, replaceStore } = useAppSession();
    const [teams, setTeams] = useState<Team[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [loadedId, setLoadedId] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const storeIdRef = useRef(currentStore?.id);
    storeIdRef.current = currentStore?.id;

    useEffect(() => {
        const store = currentStore;
        if (!store) {
            setTeams([]);
            setMembers([]);
            setLoadedId(null);
            setMessage("매장이 없습니다.");
            return;
        }
        const storeId = store.id;
        let cancelled = false;
        setLoadedId(null);
        setMessage("");

        async function start() {
            try {
                const [teamRows, memberRows] = await Promise.all([
                    api<Team[]>(`/api/stores/${storeId}/teams`),
                    api<Member[]>(`/api/stores/${storeId}/members`),
                ]);
                if (cancelled) return;
                setTeams(teamRows);
                setMembers(memberRows);
                setLoadedId(storeId);
            } catch (error: unknown) {
                if (!cancelled) setMessage(errorMessage(error, "직원 목록을 불러오지 못했습니다."));
            }
        }

        void start();
        return () => {
            cancelled = true;
        };
    }, [currentStore?.id]);

    async function reloadLists(storeId: string) {
        const [teamRows, memberRows] = await Promise.all([
            api<Team[]>(`/api/stores/${storeId}/teams`),
            api<Member[]>(`/api/stores/${storeId}/members`),
        ]);
        if (storeIdRef.current !== storeId) return;
        setTeams(teamRows);
        setMembers(memberRows);
        setLoadedId(storeId);
    }

    async function run(task: () => Promise<void>, fallback: string) {
        setMessage("");
        try {
            await task();
        } catch (error: unknown) {
            setMessage(errorMessage(error, fallback));
            throw error;
        }
    }

    async function changeTeam(member: Member, teamId: string) {
        if (!currentStore) return;
        const storeId = currentStore.id;
        try {
            await run(async () => {
                const updated = await api<Member>(`/api/stores/${storeId}/members/${member.id}/team`, {
                    method: "PATCH",
                    body: JSON.stringify({ teamId: teamId || null }),
                });
                setMembers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
            }, "팀을 바꾸지 못했습니다.");
        } catch {
            // 실패 문구는 message로 남긴다.
        }
    }

    async function applyRole(member: Member, role: StoreRole) {
        if (!currentStore) return;
        const storeId = currentStore.id;
        await run(async () => {
            const updated = await api<Member>(`/api/stores/${storeId}/members/${member.id}`, {
                method: "PATCH",
                body: JSON.stringify({ role }),
            });
            setMembers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
            if (updated.userId === user.id) replaceStore({ ...currentStore, myRole: updated.role });
        }, "직급을 바꾸지 못했습니다.");
    }

    async function leaveMember(member: Member) {
        if (!currentStore) return;
        const storeId = currentStore.id;
        await run(async () => {
            await api<Member>(`/api/stores/${storeId}/members/${member.id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status: "LEFT" }),
            });
            await reloadLists(storeId);
        }, "퇴사 처리에 실패했습니다.");
    }

    async function createTeam(name: string) {
        if (!currentStore) return;
        const storeId = currentStore.id;
        try {
            await api<Team>(`/api/stores/${storeId}/teams`, {
                method: "POST",
                body: JSON.stringify({ name }),
            });
            await reloadLists(storeId);
        } catch (error: unknown) {
            throw new Error(errorMessage(error, "팀을 만들지 못했습니다."));
        }
    }

    async function deleteTeam(teamId: string) {
        if (!currentStore) return;
        const storeId = currentStore.id;
        try {
            await api(`/api/stores/${storeId}/teams/${teamId}`, { method: "DELETE" });
            await reloadLists(storeId);
        } catch (error: unknown) {
            throw new Error(errorMessage(error, "팀을 삭제하지 못했습니다."));
        }
    }

    async function ensureInvite() {
        if (!currentStore) return null;
        if (currentStore.inviteCode) return currentStore;
        const storeId = currentStore.id;
        try {
            const nextStore = await api<Store>(`/api/stores/${storeId}/invite`, { method: "POST" });
            replaceStore(nextStore);
            setMessage("");
            return nextStore;
        } catch (error: unknown) {
            setMessage(errorMessage(error, "초대 코드를 만들지 못했습니다."));
            return null;
        }
    }

    const { presentMembers, activeMembers, leftMembers } = useMemo(() => groupMembers(members), [members]);
    const store = currentStore && loadedId === currentStore.id ? currentStore : null;

    return {
        store,
        teams,
        presentMembers,
        activeMembers,
        leftMembers,
        myUserId: user.id,
        message,
        canEdit: currentStore?.myRole === "OWNER" || currentStore?.myRole === "MANAGER",
        isOwner: currentStore?.myRole === "OWNER",
        changeTeam,
        applyRole,
        leaveMember,
        createTeam,
        deleteTeam,
        ensureInvite,
    };
}
