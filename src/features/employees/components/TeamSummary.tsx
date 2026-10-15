import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { Member, Team } from "../types";
import { isActiveMember } from "../utils/memberGroups";

interface TeamSummaryProps {
    teams: Team[];
    members: Member[];
    canCreate: boolean;
    onCreate: (name: string) => Promise<void>;
    onDelete: (teamId: string) => Promise<void>;
}

const teamColors = ["pink", "orange", "blue", "purple", "green"];
const avatarColors = ["yellow", "purple", "green", "blue", "pink"];

function avatarColor(name: string) {
    const sum = [...name].reduce((total, char) => total + char.charCodeAt(0), 0);
    return avatarColors[sum % avatarColors.length];
}

function TeamPeople({ people }: { people: Member[] }) {
    if (people.length === 0) {
        return <p className="employees__team-empty">배정된 직원 없음</p>;
    }

    return (
        <ul className="employees__team-people">
            {people.map((member) => (
                <li key={member.id}>
                    <span className={`employees__team-avatar employees__team-avatar--${avatarColor(member.name)}`}>
                        {member.name.slice(0, 1)}
                    </span>
                    {member.name}
                </li>
            ))}
        </ul>
    );
}

// 팀 카드. 근무 중인 멤버만 이름과 이니셜로 보여 주고, 팀이 없는 사람은 미배정에 모은다.
// 팀 만들기와 삭제는 오너만 본다. 삭제하면 그 팀 직원은 미배정으로 돌아간다.
function TeamSummary({ teams, members, canCreate, onCreate, onDelete }: TeamSummaryProps) {
    const active = members.filter((member) => isActiveMember(member));
    const unassigned = active.filter((member) => !member.teamId);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);
    const [target, setTarget] = useState<Team | null>(null);
    const [deleteError, setDeleteError] = useState("");
    const [deleting, setDeleting] = useState(false);

    async function submit(event: FormEvent) {
        event.preventDefault();
        const trimmed = name.trim();
        if (!trimmed || pending) return;
        setPending(true);
        setError("");
        try {
            await onCreate(trimmed);
            setName("");
            setOpen(false);
        } catch (caught: unknown) {
            setError(caught instanceof Error ? caught.message : "팀을 만들지 못했습니다.");
        } finally {
            setPending(false);
        }
    }

    async function confirmDelete() {
        if (!target || deleting) return;
        setDeleting(true);
        setDeleteError("");
        try {
            await onDelete(target.id);
            setTarget(null);
        } catch (caught: unknown) {
            setDeleteError(caught instanceof Error ? caught.message : "팀을 삭제하지 못했습니다.");
        } finally {
            setDeleting(false);
        }
    }

    return (
        <section className="employees__teams">
            <div className="employees__teams-head">
                <h2>팀 구성 현황</h2>
            </div>
            <div className="employees__team-grid">
                {teams.map((team, index) => {
                    const people = active.filter((member) => member.teamId === team.id);
                    return (
                        <article key={team.id} className="employees__team-card">
                            <div className="employees__team-card-head">
                                <span className={`employees__team-name employees__team-name--${teamColors[index % teamColors.length]}`}>
                                    {team.name}
                                </span>
                                <strong className="employees__team-count">{people.length}명</strong>
                            </div>
                            <TeamPeople people={people} />
                            {canCreate && (
                                <button type="button" className="employees__team-delete" onClick={() => {
                                    setDeleteError("");
                                    setTarget(team);
                                }}>
                                    삭제
                                </button>
                            )}
                        </article>
                    );
                })}
                <article className="employees__team-card">
                    <div className="employees__team-card-head">
                        <span className="employees__team-name employees__team-name--gray">미배정</span>
                        <strong className="employees__team-count">{unassigned.length}명</strong>
                    </div>
                    <TeamPeople people={unassigned} />
                </article>
                {canCreate && (
                    <article className="employees__team-card employees__team-card--add">
                        {open ? (
                            <form onSubmit={submit}>
                                <label className="employees__team-add-label" htmlFor="team-name">팀 이름</label>
                                <input
                                    id="team-name"
                                    className="employees__team-add-input"
                                    value={name}
                                    placeholder="예: 오픈"
                                    onChange={(event) => {
                                        setName(event.target.value);
                                        setError("");
                                    }}
                                />
                                {error && <p className="employees__team-add-error">{error}</p>}
                                <div className="employees__team-add-actions">
                                    <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>취소</Button>
                                    <Button type="submit" size="sm" disabled={pending || name.trim() === ""}>
                                        {pending ? "만드는 중…" : "만들기"}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <button type="button" className="employees__team-add" onClick={() => setOpen(true)}>
                                + 팀 만들기
                            </button>
                        )}
                    </article>
                )}
            </div>
            <ConfirmDialog
                open={target !== null}
                title="팀 삭제"
                description={deleteError || (target ? `${target.name} 팀을 삭제합니다. 소속 직원은 미배정으로 이동합니다.` : "")}
                confirmText={deleting ? "삭제 중…" : "삭제"}
                cancelText="취소"
                variant="danger"
                onConfirm={confirmDelete}
                onClose={() => {
                    if (deleting) return;
                    setTarget(null);
                    setDeleteError("");
                }}
            />
        </section>
    );
}

export default TeamSummary;
