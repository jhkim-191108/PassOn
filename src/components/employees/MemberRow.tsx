import Badge from "../ui/Badge";
import Select from "../ui/Select";
import type { StoreRole } from "../../types/api";
import type { Member, Team } from "./types";

interface MemberRowProps {
    member: Member;
    teams: Team[];
    canEdit: boolean;
    onRoleChange: (member: Member, role: StoreRole) => void;
    onTeamChange: (member: Member, teamId: string) => void;
}

const roleVariant = {
    OWNER: "primary",
    MANAGER: "warning",
    STAFF: "neutral",
} as const;

// 직원 한 줄. 오너는 서버가 역할 변경을 거절하므로 선택 칸을 그리지 않는다.
function MemberRow({ member, teams, canEdit, onRoleChange, onTeamChange }: MemberRowProps) {
    const editable = canEdit && member.role !== "OWNER" && member.status === "ACTIVE";

    return (
        <li className="employees__member">
            <div className="employees__member-main">
                <span className="employees__avatar">{member.name.slice(0, 1)}</span>
                <div>
                    <strong>{member.name}</strong>
                    <Badge size="sm" variant={roleVariant[member.role]}>{member.role}</Badge>
                    <p>{member.email}</p>
                </div>
            </div>
            <span className="employees__member-team">{member.teamName ?? "미배정"}</span>
            {editable && (
                <div className="employees__member-controls">
                    <Select value={member.role} onChange={(event) => onRoleChange(member, event.target.value as StoreRole)}>
                        <option value="MANAGER">Manager</option>
                        <option value="STAFF">Staff</option>
                    </Select>
                    <Select value={member.teamId ?? ""} onChange={(event) => onTeamChange(member, event.target.value)}>
                        <option value="">팀 없음</option>
                        {teams.map((team) => (
                            <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                    </Select>
                </div>
            )}
        </li>
    );
}

export default MemberRow;
