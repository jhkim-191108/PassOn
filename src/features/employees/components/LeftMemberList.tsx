import Badge from "@/components/ui/Badge";
import type { Member } from "../types";

const roleVariant = {
    OWNER: "primary",
    MANAGER: "warning",
    STAFF: "neutral",
} as const;

function formatLeftAt(value: string | null) {
    if (!value) return "";
    const date = new Date(value);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}.${month}.${day}`;
}

// 퇴사 기록. 역할과 팀은 바꾸지 않고, 날짜는 YYYY.MM.DD로 보여 준다.
// 넘어온 members는 퇴사자만 있다. 없으면 빈 목록 대신 안내 문구를 보여 준다.
function LeftMemberList({ members }: { members: Member[] }) {
    return (
        <section className="employees__panel">
            <div className="employees__panel-head">
                <h2>퇴사 {members.length}명 · 기록 보존 중</h2>
            </div>
            {members.length === 0 && (
                <p className="employees__left-empty">현재 퇴사자가 없습니다.</p>
            )}
            {members.length > 0 && (
                <ul className="employees__members">
                    {members.map((member) => (
                        <li key={member.id} className="employees__member employees__member--left">
                            <div className="employees__member-main">
                                <span className="employees__avatar employees__avatar--left">{member.name.slice(0, 1)}</span>
                                <div>
                                    <div className="employees__member-name">
                                        <strong>{member.name}</strong>
                                        <Badge size="sm" variant={roleVariant[member.role]}>{member.role}</Badge>
                                        <Badge size="sm" className="employees__left-badge">퇴사</Badge>
                                    </div>
                                    <p>{member.email}</p>
                                </div>
                            </div>
                            {formatLeftAt(member.leftAt) && (
                                <time className="employees__left-date" dateTime={member.leftAt ?? undefined}>
                                    {formatLeftAt(member.leftAt)}
                                </time>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default LeftMemberList;
