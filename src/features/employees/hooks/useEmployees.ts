// 직원관리 데이터. 처음 열 때 매장·내 정보·팀·멤버를 받아 상태를 한 번만 바꾸고,
// 역할·팀·퇴사·팀 생성/삭제의 요청과 에러도 여기서 처리한다.
import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/api/client";
import type { Store, StoreRole } from "@/types/api";
import type { Member, Team } from "../types";
import { pickStore, useCurrentStoreId } from "@/features/stores/currentStore";
import { groupMembers } from "../utils/memberGroups";

type StoreView = Store & { invitePath?: string | null };

type EmployeeData = {
    store: StoreView;
    teams: Team[];
    members: Member[];
    myUserId: string | null;
};

function errorMessage(error: unknown, fallback: string) {
    return error instanceof ApiError ? error.message : fallback;
}

export function useEmployees() {
    const [data, setData] = useState<EmployeeData | null>(null);
    const [message, setMessage] = useState("");
    const selectedId = useCurrentStoreId();

    useEffect(() => {
        let cancelled = false;

        async function start() {
            try {
                setData(null);
                setMessage("");
                const [stores, me] = await Promise.all([
                    api<StoreView[]>("/api/stores"),
                    api<{ id: string }>("/api/users/me"),
                ]);
                const store = pickStore(stores);
                if (!store) {
                    if (!cancelled) setMessage("매장이 없습니다.");
                    return;
                }

                const [teams, members] = await Promise.all([
                    api<Team[]>(`/api/stores/${store.id}/teams`),
                    api<Member[]>(`/api/stores/${store.id}/members`),
                ]);

                if (!cancelled) setData({ store, teams, members, myUserId: me.id });
            } catch (error: unknown) {
                if (!cancelled) setMessage(errorMessage(error, "직원 목록을 불러오지 못했습니다."));
            }
        }

        start();
        return () => {
            cancelled = true;
        };
    }, [selectedId]);

    // 팀 인원 수가 여러 명에게 퍼지는 퇴사·팀 생성·팀 삭제 뒤에만 목록을 다시 받는다.
    async function reloadLists(storeId: string) {
        const [teams, members] = await Promise.all([
            api<Team[]>(`/api/stores/${storeId}/teams`),
            api<Member[]>(`/api/stores/${storeId}/members`),
        ]);
        setData((current) => (current ? { ...current, teams, members } : current));
    }

    // 역할 변경, 팀 이동, 퇴사는 이 try-catch 하나를 같이 쓴다.
    async function run(task: () => Promise<void>, fallback: string) {
        setMessage("");
        try {
            await task();
        } catch (error: unknown) {
            setMessage(errorMessage(error, fallback));
            throw error;
        }
    }

    // 팀 이동은 응답에 바뀐 멤버가 들어 있어서, 그 한 명만 갈아끼운다.
    function changeTeam(member: Member, teamId: string) {
        if (!data) return;
        const storeId = data.store.id;
        return run(async () => {
            const updated = await api<Member>(`/api/stores/${storeId}/members/${member.id}/team`, {
                method: "PATCH",
                body: JSON.stringify({ teamId: teamId || null }),
            });
            setData((current) =>
                current
                    ? {
                          ...current,
                          members: current.members.map((item) => (item.id === updated.id ? updated : item)),
                      }
                    : current,
            );
        }, "팀을 바꾸지 못했습니다.").catch(() => undefined);
    }

    function applyRole(member: Member, role: StoreRole) {
        if (!data) return;
        const storeId = data.store.id;
        const myUserId = data.myUserId;
        return run(async () => {
            const updated = await api<Member>(`/api/stores/${storeId}/members/${member.id}`, {
                method: "PATCH",
                body: JSON.stringify({ role }),
            });
            setData((current) => {
                if (!current) return current;
                return {
                    ...current,
                    store:
                        member.userId === myUserId
                            ? { ...current.store, myRole: role }
                            : current.store,
                    members: current.members.map((item) => (item.id === updated.id ? updated : item)),
                };
            });
        }, "직급을 바꾸지 못했습니다.");
    }

    function leaveMember(member: Member) {
        if (!data) return;
        const storeId = data.store.id;
        return run(async () => {
            await api<Member>(`/api/stores/${storeId}/members/${member.id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status: "LEFT" }),
            });
            await reloadLists(storeId);
        }, "퇴사 처리에 실패했습니다.");
    }

    async function createTeam(name: string) {
        if (!data) return;
        const storeId = data.store.id;
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
        if (!data) return;
        const storeId = data.store.id;
        try {
            await api(`/api/stores/${storeId}/teams/${teamId}`, { method: "DELETE" });
            await reloadLists(storeId);
        } catch (error: unknown) {
            throw new Error(errorMessage(error, "팀을 삭제하지 못했습니다."));
        }
    }

    // 초대 창을 연다고 코드를 새로 발급하지 않는다. 코드가 없을 때만 한 번 만든다.
    async function ensureInvite() {
        if (!data) return null;
        if (data.store.inviteCode) return data.store;
        const storeId = data.store.id;
        try {
            const nextStore = await api<StoreView>(`/api/stores/${storeId}/invite`, { method: "POST" });
            setData((current) => (current ? { ...current, store: nextStore } : current));
            setMessage("");
            return nextStore;
        } catch (error: unknown) {
            setMessage(errorMessage(error, "초대 코드를 만들지 못했습니다."));
            return null;
        }
    }

    const { presentMembers, activeMembers, leftMembers } = useMemo(
        () => groupMembers(data?.members ?? []),
        [data?.members],
    );

    return {
        store: data?.store ?? null,
        teams: data?.teams ?? [],
        presentMembers,
        activeMembers,
        leftMembers,
        myUserId: data?.myUserId ?? null,
        message,
        canEdit: data?.store.myRole === "OWNER" || data?.store.myRole === "MANAGER",
        isOwner: data?.store.myRole === "OWNER",
        changeTeam,
        applyRole,
        leaveMember,
        createTeam,
        deleteTeam,
        ensureInvite,
    };
}
