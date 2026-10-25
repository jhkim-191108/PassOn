import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { acknowledgeCard, completeCard } from "@/api/cards";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";
import Select from "@/components/ui/Select";
import {
    HandoffListCard,
    buildMemberMaps,
    cardToHandoff,
    type CardResponse,
    type HandoffItem,
    type QuickAction,
} from "@/features/dashboard";
import type { Member, Team } from "@/features/employees";
import { useAppSession } from "@/layouts/appSession";

import "../../css/handovers.css";

type StatusFilter = "all" | "pending" | "priority" | "mine" | "complete";
type SortOrder = "newest" | "oldest" | "priority";

const STATUS_FILTERS: { key: StatusFilter; label: string; counted?: boolean }[] = [
    { key: "all", label: "전체" },
    { key: "pending", label: "미처리", counted: true },
    { key: "priority", label: "중요·긴급" },
    { key: "mine", label: "내 담당" },
    { key: "complete", label: "완료" },
];

const SORT_LABEL: Record<SortOrder, string> = {
    newest: "최신순",
    oldest: "오래된순",
    priority: "긴급도순",
};

const PRIORITY_RANK = { urgent: 0, important: 1, normal: 2 } as const;

const TEAM_TONES = ["red", "orange", "blue", "purple", "green"] as const;

function matchesStatus(item: HandoffItem, filter: StatusFilter, userId: string) {
    switch (filter) {
        case "pending":
            return item.status === "pending";
        case "priority":
            return item.priority !== "normal" && item.status !== "complete";
        case "mine":
            return item.assigneeId === userId && item.status !== "complete";
        case "complete":
            return item.status === "complete";
        default:
            return true;
    }
}

function matchesKeyword(item: HandoffItem, keyword: string) {
    if (!keyword) return true;
    return [item.title, item.content, item.authorName, item.assigneeName ?? ""]
        .some((text) => text.toLowerCase().includes(keyword));
}

function compare(order: SortOrder) {
    return (a: HandoffItem, b: HandoffItem) => {
        const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (order === "oldest") return -diff;
        if (order === "priority") return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || diff;
        return diff;
    };
}

function HandoverPage() {
    const navigate = useNavigate();
    const { user, currentStore } = useAppSession();
    const storeId = currentStore?.id ?? "";
    const [items, setItems] = useState<HandoffItem[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [pendingIds, setPendingIds] = useState<string[]>([]);
    const [teamId, setTeamId] = useState<string | null>(null);
    const [status, setStatus] = useState<StatusFilter>("all");
    const [keyword, setKeyword] = useState("");
    const [order, setOrder] = useState<SortOrder>("newest");

    useEffect(() => {
        if (!storeId) {
            setError("매장 정보를 찾을 수 없습니다.");
            setLoading(false);
            return;
        }
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError("");
                const [cards, memberRows, teamRows] = await Promise.all([
                    api<CardResponse[]>(`/api/stores/${storeId}/cards`),
                    api<Member[]>(`/api/stores/${storeId}/members`),
                    api<Team[]>(`/api/stores/${storeId}/teams`),
                ]);
                if (cancelled) return;
                const maps = buildMemberMaps(memberRows);
                setItems(cards.map((card) => cardToHandoff(card, storeId, maps)));
                setMembers(memberRows);
                setTeams(teamRows);
            } catch (loadError) {
                console.error("인수인계 조회 실패:", loadError);
                if (!cancelled) setError("인수인계를 불러오지 못했습니다.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void load();
        return () => {
            cancelled = true;
        };
    }, [storeId]);

    // 카드 팀 = 담당자의 팀
    const teamByUserId = useMemo(
        () => new Map(members.map((member) => [member.userId, member.teamId])),
        [members],
    );
    const teamOf = (item: HandoffItem) => (item.assigneeId ? teamByUserId.get(item.assigneeId) ?? null : null);

    const teamItems = teamId ? items.filter((item) => teamOf(item) === teamId) : items;
    const query = keyword.trim().toLowerCase();
    const visible = teamItems
        .filter((item) => matchesStatus(item, status, user.id) && matchesKeyword(item, query))
        .sort(compare(order));

    async function runQuickAction(id: string, action: QuickAction) {
        setPendingIds((ids) => [...ids, id]);
        setActionError("");
        try {
            const card = (await (action === "confirm" ? acknowledgeCard(id) : completeCard(id))) as CardResponse;
            const updated = cardToHandoff(card, storeId, buildMemberMaps(members));
            setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
        } catch (actionFailure) {
            setActionError(actionFailure instanceof Error ? actionFailure.message : "처리하지 못했습니다.");
        } finally {
            setPendingIds((ids) => ids.filter((pendingId) => pendingId !== id));
        }
    }

    return (
        <section className="handover-page">
            <div className="handover-page__header">
                <h1>인수인계</h1>

                <div className="handover-page__actions">
                    <Button variant="secondary" onClick={() => navigate("/app/handovers/trash")}>
                        휴지통
                    </Button>
                    <Button type="button" onClick={() => navigate("/app/handovers/new")}>
                        + 작성
                    </Button>
                </div>
            </div>

            {loading && <Loading text="인수인계를 불러오는 중입니다..." />}

            {error && <ErrorState title={error} description="잠시 후 다시 시도해 주세요." />}

            {!loading && !error && (
                <>
                    <div className="handover-teams" role="group" aria-label="팀">
                        <button
                            type="button"
                            className="handover-team handover-team--all"
                            aria-pressed={teamId === null}
                            onClick={() => setTeamId(null)}
                        >
                            ≡ 전체 <b>{items.length}</b>
                        </button>
                        {teams.map((team, index) => (
                            <button
                                key={team.id}
                                type="button"
                                className={`handover-team handover-team--${TEAM_TONES[index % TEAM_TONES.length]}`}
                                aria-pressed={teamId === team.id}
                                onClick={() => setTeamId(teamId === team.id ? null : team.id)}
                            >
                                {team.name} <b>{items.filter((item) => teamOf(item) === team.id).length}</b>
                            </button>
                        ))}
                    </div>

                    <Input
                        className="handover-page__search"
                        value={keyword}
                        placeholder="제목, 내용, 작성자, 담당자 검색"
                        aria-label="인수인계 검색"
                        onChange={(event) => setKeyword(event.target.value)}
                    />

                    <div className="handover-filters" role="group" aria-label="상태">
                        {STATUS_FILTERS.map((filter) => (
                            <button
                                key={filter.key}
                                type="button"
                                className="handover-filter"
                                aria-pressed={status === filter.key}
                                onClick={() => setStatus(filter.key)}
                            >
                                {filter.label}
                                {filter.counted && (
                                    <b> {teamItems.filter((item) => matchesStatus(item, filter.key, user.id)).length}</b>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="handover-page__toolbar">
                        <span>{visible.length}건</span>
                        <Select
                            className="handover-page__sort"
                            value={order}
                            aria-label="정렬"
                            onChange={(event) => setOrder(event.target.value as SortOrder)}
                        >
                            {(Object.keys(SORT_LABEL) as SortOrder[]).map((key) => (
                                <option key={key} value={key}>
                                    {SORT_LABEL[key]}
                                </option>
                            ))}
                        </Select>
                    </div>

                    {actionError && (
                        <p className="handover-page__error" role="alert">
                            {actionError}
                        </p>
                    )}

                    {visible.length === 0 ? (
                        <EmptyState
                            title={items.length === 0 ? "등록된 인수인계가 없습니다." : "조건에 맞는 카드가 없습니다."}
                            description={items.length === 0 ? "새 인수인계를 작성해주세요." : "필터나 검색어를 바꿔 보세요."}
                        />
                    ) : (
                        <div className="handover-list">
                            {visible.map((item) => (
                                <HandoffListCard
                                    key={item.id}
                                    item={item}
                                    currentUserId={user.id}
                                    onClick={() => item.handoffId && navigate(`/app/handovers/${item.handoffId}?card=${item.id}`)}
                                    onQuickAction={(action) => void runQuickAction(item.id, action)}
                                    isPending={pendingIds.includes(item.id)}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </section>
    );
}

export default HandoverPage;
