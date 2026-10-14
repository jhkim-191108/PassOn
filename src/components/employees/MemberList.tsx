import MemberRow from "./MemberRow";
import type { StoreRole } from "../../types/api";
import type { Member, Team } from "./types";

interface MemberListProps {
    members: Member[];
    teams: Team[];
    canEdit: boolean;
    onRoleChange: (member: Member, role: StoreRole) => void;
    onTeamChange: (member: Member, teamId: string) => void;
}

// 재직과 정지 멤버. 퇴사는 LeftMemberList로 보낸다.
function MemberList({ members, teams, canEdit, onRoleChange, onTeamChange }: MemberListProps) {
    const active = members.filter((member) => member.status !== "LEFT");

    return (
        <section className="employees__panel">
            <div className="employees__panel-head">
                <h2>재직 중 {active.length}명</h2>
                {canEdit && <span>역할 · 팀 변경 가능</span>}
            </div>
            <ul className="employees__members">
                {active.map((member) => (
                    <MemberRow
                        key={member.id}
                        member={member}
                        teams={teams}
                        canEdit={canEdit}
                        onRoleChange={onRoleChange}
                        onTeamChange={onTeamChange}
                    />
                ))}
            </ul>
        </section>
    );
}

export default MemberList;
