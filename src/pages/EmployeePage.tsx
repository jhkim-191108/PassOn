import { useEffect, useState } from "react";
import { api, ApiError } from "../api/client";
import type { Store, StoreRole } from "../types/api";
import EmployeeHeader from "../components/employees/EmployeeHeader";
import TeamSummary from "../components/employees/TeamSummary";
import MemberList from "../components/employees/MemberList";
import LeftMemberList from "../components/employees/LeftMemberList";
import type { Member, Team } from "../components/employees/types";
import "../components/employees/employees.css";

function EmployeesPage() {
    const [store, setStore] = useState<Store | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [message, setMessage] = useState("");

    // 팀 인원 수가 바뀌므로 팀과 멤버를 같이 다시 받는다.
    async function load(storeId: string) {
        const [teamList, memberList] = await Promise.all([
            api<Team[]>(`/api/stores/${storeId}/teams`),
            api<Member[]>(`/api/stores/${storeId}/members`),
        ]);
        setTeams(teamList);
        setMembers(memberList);
    }

    useEffect(() => {
        async function start() {
            try {
                const stores = await api<Store[]>("/api/stores");
                const current = stores[0];
                if (!current) {
                    setMessage("매장이 없습니다.");
                    return;
                }
                setStore(current);
                await load(current.id);
            } catch (error: unknown) {
                setMessage(error instanceof ApiError ? error.message : "직원 목록을 불러오지 못했습니다.");
            }
        }

        start();
    }, []);

    async function changeRole(member: Member, role: StoreRole) {
        if (!store) return;
        const updated = await api<Member>(`/api/stores/${store.id}/members/${member.id}`, {
            method: "PATCH",
            body: JSON.stringify({ role }),
        });
        setMembers((list) => list.map((item) => (item.id === updated.id ? updated : item)));
    }

    async function changeTeam(member: Member, teamId: string) {
        if (!store) return;
        await api<Member>(`/api/stores/${store.id}/members/${member.id}/team`, {
            method: "PATCH",
            body: JSON.stringify({ teamId: teamId || null }),
        });
        await load(store.id);
    }

    // 이전 초대 코드는 서버에서 무효가 되고, 응답의 새 코드로 바뀐다.
    async function reissueInvite() {
        if (!store) return;
        setStore(await api<Store>(`/api/stores/${store.id}/invite`, { method: "POST" }));
    }

    if (!store) {
        return <p className="employees__message">{message || "불러오는 중"}</p>;
    }

    const canEdit = store.myRole === "OWNER" || store.myRole === "MANAGER";
    const activeCount = members.filter((member) => member.status !== "LEFT").length;

    return (
        <section className="employees">
            <EmployeeHeader
                storeName={store.name}
                count={activeCount}
                inviteCode={store.inviteCode}
                canEdit={canEdit}
                onInvite={reissueInvite}
            />
            <TeamSummary teams={teams} members={members} />
            <MemberList
                members={members}
                teams={teams}
                canEdit={canEdit}
                onRoleChange={changeRole}
                onTeamChange={changeTeam}
            />
            <LeftMemberList members={members} />
        </section>
    );
}

export default EmployeesPage;
