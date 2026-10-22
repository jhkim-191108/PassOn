import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import type { StoreRole } from "@/types/api";
import type { Member, Team } from "../types";
import { isActiveMember } from "../utils/memberGroups";

interface MemberRowProps {
    member: Member;
    teams: Team[];
    actorRole: StoreRole;
    isSelf: boolean;
    onRoleChange: (member: Member, role: StoreRole) => void;
    onTeamChange: (member: Member, teamId: string) => void;
    onLeave: (member: Member) => void;
}

const roleVariant = {
    OWNER: "primary",
    MANAGER: "warning",
    STAFF: "neutral",
} as const;

const roleLabel = {
    OWNER: "Owner",
    MANAGER: "Manager",
    STAFF: "Staff",
} as const;

// 한 줄의 수정 권한.
// 오너: 본인 직급, 그리고 오너가 아닌 멤버의 직급·팀·퇴사.
// 매니저: 직원(STAFF)만. 다른 오너와 정지·퇴사 멤버는 잠근다.
// 직급 선택에 오너가 있는 것은 오너 계정뿐이다.
function canManage(actorRole: StoreRole, member: Member, isSelf: boolean) {
    if (!isActiveMember(member)) return false;
    if (actorRole === "OWNER") return isSelf || member.role !== "OWNER";
    if (actorRole === "MANAGER") return member.role === "STAFF";
    return false;
}

function MemberRow({ member, teams, actorRole, isSelf, onRoleChange, onTeamChange, onLeave }: MemberRowProps) {
    const manageable = canManage(actorRole, member, isSelf);
    const roles: StoreRole[] = actorRole === "OWNER" ? ["OWNER", "MANAGER", "STAFF"] : ["MANAGER", "STAFF"];

    return (
        <li className="employees__member">
            <div className="employees__member-main">
                <span className="employees__avatar">{member.name.slice(0, 1)}</span>
                <div>
                    <div className="employees__member-name">
                        <strong>{member.name}</strong>
                        <Badge size="sm" variant={roleVariant[member.role]}>{member.role}</Badge>
                        {member.teamName && (
                            <Badge size="sm" className="employees__team-badge">{member.teamName}</Badge>
                        )}
                    </div>
                    <p>{member.email}</p>
                </div>
            </div>
            {manageable && (
                <div className="employees__member-controls">
                    <Select value={member.role} onChange={(event) => onRoleChange(member, event.target.value as StoreRole)}>
                        {roles.map((role) => (
                            <option key={role} value={role}>{roleLabel[role]}</option>
                        ))}
                    </Select>
                    {member.role !== "OWNER" && (
                        <Select value={member.teamId ?? ""} onChange={(event) => onTeamChange(member, event.target.value)}>
                            <option value="">팀 없음</option>
                            {teams.map((team) => (
                                <option key={team.id} value={team.id}>{team.name}</option>
                            ))}
                        </Select>
                    )}
                    {member.role !== "OWNER" && (
                        <Button type="button" variant="danger" size="sm" onClick={() => onLeave(member)}>
                            퇴사
                        </Button>
                    )}
                </div>
            )}
        </li>
    );
}

export default MemberRow;
