// 직원관리 화면. 데이터는 useEmployees가 맡고, 이 파일은 목록과 확인 창만 조립한다.
import { useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import InviteModal from "@/features/employees/components/InviteModal";
import {
    EmployeeHeader,
    LeftMemberList,
    MemberList,
    TeamSummary,
    useEmployees,
} from "@/features/employees";
import type { Member } from "@/features/employees";
import type { StoreRole } from "@/types/api";
import "../../css/employees.css";

const roleName = {
    OWNER: "오너",
    MANAGER: "매니저",
    STAFF: "직원",
} as const;

function EmployeesPage() {
    const {
        store,
        teams,
        presentMembers,
        activeMembers,
        leftMembers,
        myUserId,
        message,
        canEdit,
        isOwner,
        changeTeam,
        applyRole,
        leaveMember,
        createTeam,
        deleteTeam,
        ensureInvite,
    } = useEmployees();
    const [inviteOpen, setInviteOpen] = useState(false);
    const [leaving, setLeaving] = useState<Member | null>(null);
    const [leavingPending, setLeavingPending] = useState(false);
    const [roleDraft, setRoleDraft] = useState<{ member: Member; role: StoreRole } | null>(null);
    const [rolePending, setRolePending] = useState(false);

    if (!store) {
        return <p className="employees__message">{message || "불러오는 중"}</p>;
    }

    // 오너 권한을 넘기거나 받는 경우만 확인 창을 연다. 매니저·직원 변경은 바로 반영한다.
    function changeRole(member: Member, role: StoreRole) {
        if (role === member.role) return;
        const handingOver = member.userId === myUserId && member.role === "OWNER" && role !== "OWNER";
        const promoting = role === "OWNER" && member.role !== "OWNER";
        if (handingOver || promoting) {
            setRoleDraft({ member, role });
            return;
        }
        void applyRole(member, role);
    }

    async function confirmLeave() {
        if (!leaving || leavingPending) return;
        setLeavingPending(true);
        try {
            await leaveMember(leaving);
            setLeaving(null);
        } catch {
            // 실패 문구는 message로 남긴다.
        } finally {
            setLeavingPending(false);
        }
    }

    async function confirmRole() {
        if (!roleDraft || rolePending) return;
        setRolePending(true);
        try {
            await applyRole(roleDraft.member, roleDraft.role);
            setRoleDraft(null);
        } catch {
            // 실패 문구는 message로 남긴다.
        } finally {
            setRolePending(false);
        }
    }

    // 초대 링크는 이 사이트 주소 + 서버가 준 경로. 경로가 없으면 /join/코드로 만든다.
    async function openInvite() {
        const next = await ensureInvite();
        if (next?.inviteCode) setInviteOpen(true);
    }

    const otherOwner = roleDraft
        ? presentMembers.some((item) => item.id !== roleDraft.member.id && item.role === "OWNER")
        : false;
    const roleDescription = roleDraft
        ? roleDraft.role === "OWNER"
            ? `${roleDraft.member.name} 님을 오너로 바꿉니다.`
            : otherOwner
                ? `내 직급을 ${roleName[roleDraft.role]}로 바꿉니다. 오너 권한은 다른 오너에게 남습니다.`
                : `내 직급을 ${roleName[roleDraft.role]}로 바꿉니다. 다른 오너가 없어서 이 계정의 오너 권한이 사라집니다.`
        : "";
    const inviteLink = store.inviteCode
        ? `${window.location.origin}${store.invitePath || `/join/${store.inviteCode}`}`
        : "";

    return (
        <section className="employees">
            <EmployeeHeader
                storeName={store.name}
                count={presentMembers.length}
                inviteCode={store.inviteCode}
                canEdit={canEdit}
                onInvite={openInvite}
            />
            {store.inviteCode && (
                <InviteModal
                    open={inviteOpen}
                    storeName={store.name}
                    inviteCode={store.inviteCode}
                    inviteLink={inviteLink}
                    onClose={() => setInviteOpen(false)}
                />
            )}
            <TeamSummary
                teams={teams}
                members={activeMembers}
                canCreate={isOwner}
                onCreate={createTeam}
                onDelete={deleteTeam}
            />
            {message && !leaving && !roleDraft && <p className="employees__message">{message}</p>}
            <MemberList
                members={presentMembers}
                teams={teams}
                actorRole={store.myRole}
                myUserId={myUserId}
                onRoleChange={changeRole}
                onTeamChange={changeTeam}
                onLeave={setLeaving}
            />
            <LeftMemberList members={leftMembers} />
            <ConfirmDialog
                open={leaving !== null}
                title="퇴사 처리"
                description={leaving ? message || `${leaving.name} 님을 퇴사 처리합니다. 재직 목록에서 빠지고 퇴사 기록에 남습니다.` : ""}
                confirmText={leavingPending ? "처리 중…" : "퇴사"}
                cancelText="취소"
                variant="danger"
                onConfirm={() => void confirmLeave()}
                onClose={() => {
                    if (leavingPending) return;
                    setLeaving(null);
                }}
            />
            <ConfirmDialog
                open={roleDraft !== null}
                title="직급 변경"
                description={message || roleDescription}
                confirmText={rolePending ? "변경 중…" : "변경"}
                cancelText="취소"
                onConfirm={() => void confirmRole()}
                onClose={() => {
                    if (rolePending) return;
                    setRoleDraft(null);
                }}
            />
        </section>
    );
}

export default EmployeesPage;
