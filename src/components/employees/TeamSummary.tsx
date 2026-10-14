import type { Member, Team } from "./types";

interface TeamSummaryProps {
    teams: Team[];
    members: Member[];
}

const teamColors = ["pink", "orange", "blue", "purple", "green"];

// 위쪽 팀 카드. 팀이 없는 재직자는 미배정 카드에 모은다.
function TeamSummary({ teams, members }: TeamSummaryProps) {
    const active = members.filter((member) => member.status === "ACTIVE");
    const unassigned = active.filter((member) => !member.teamId);

    return (
        <section className="employees__teams">
            <h2>팀 구성 현황</h2>
            <div className="employees__team-grid">
                {teams.map((team, index) => {
                    const names = active
                        .filter((member) => member.teamId === team.id)
                        .map((member) => member.name);
                    return (
                        <article key={team.id} className="employees__team-card">
                            <div>
                                <span className={`employees__team-name employees__team-name--${teamColors[index % teamColors.length]}`}>
                                    {team.name}
                                </span>
                                <strong>{team.memberCount}명</strong>
                            </div>
                            <p>{names.length > 0 ? names.join("  ") : "배정된 직원 없음"}</p>
                        </article>
                    );
                })}
                <article className="employees__team-card">
                    <div>
                        <span className="employees__team-name employees__team-name--gray">미배정</span>
                        <strong>{unassigned.length}명</strong>
                    </div>
                    <p>{unassigned.map((member) => member.name).join("  ")}</p>
                </article>
            </div>
        </section>
    );
}

export default TeamSummary;
