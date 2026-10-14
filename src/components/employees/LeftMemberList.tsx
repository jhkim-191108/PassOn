import type { Member } from "./types";

function formatLeftAt(value: string | null) {
    if (!value) {
        return "퇴사";
    }
    const date = new Date(value);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 퇴사`;
}

// 퇴사자는 역할과 팀을 바꾸지 않고 기록만 보여 준다.
function LeftMemberList({ members }: { members: Member[] }) {
    const left = members.filter((member) => member.status === "LEFT");

    return (
        <section className="employees__panel">
            <h2>퇴사 {left.length}명 · 기록 보존 중</h2>
            <ul className="employees__members">
                {left.map((member) => (
                    <li key={member.id} className="employees__member">
                        <div className="employees__member-main">
                            <span className="employees__avatar">{member.name.slice(0, 1)}</span>
                            <div>
                                <strong>{member.name}</strong>
                                <span className="employees__left-label">퇴사</span>
                                <p>{member.email}</p>
                            </div>
                        </div>
                        <span>{formatLeftAt(member.leftAt)}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default LeftMemberList;
