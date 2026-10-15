import type { StoreRole } from "@/types/api";
import type { Member, Team } from "../types";
import MemberRow from "./MemberRow";

interface MemberListProps {
    members: Member[];
    teams: Team[];
    actorRole: StoreRole;
    myUserId: string | null;
    onRoleChange: (member: Member, role: StoreRole) => void;
    onTeamChange: (member: Member, teamId: string) => void;
    onLeave: (member: Member) => void;
}

// 재직 목록. 넘어온 members는 이미 퇴사자를 뺀 목록이다.
function MemberList({ members, teams, actorRole, myUserId, onRoleChange, onTeamChange, onLeave }: MemberListProps) {
    return (
        <section className="employees__panel">
            <div className="employees__panel-head">
                <h2>재직 중 {members.length}명</h2>
                {(actorRole === "OWNER" || actorRole === "MANAGER") && <span>역할 · 팀 · 퇴사 처리 가능</span>}
            </div>
            <ul className="employees__members">
                {members.map((member) => (
                    <MemberRow
                        key={member.id}
                        member={member}
                        teams={teams}
                        actorRole={actorRole}
                        isSelf={member.userId === myUserId}
                        onRoleChange={onRoleChange}
                        onTeamChange={onTeamChange}
                        onLeave={onLeave}
                    />
                ))}
            </ul>
        </section>
    );
}

export default MemberList;
