import { useEffect, useState } from "react";
import type { ComponentProps } from "react";
import { ApiError } from "@/api/client";
import { cancelEscalation, createEscalation, listEscalations, resolveEscalation } from "@/api/escalations";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Loading from "@/components/ui/Loading";
import Modal from "@/components/ui/Modal";
import type { Card, Escalation, EscalationPriority, Urgency } from "@/types/api";
import { useAppSession } from "@/layouts/appSession";
import "../../css/delegate.css";

type BadgeVariant = ComponentProps<typeof Badge>["variant"];
type Tag = { label: string; variant: BadgeVariant };

const PRIORITY_TAG: Record<EscalationPriority, Tag> = {
    IMPORTANT: { label: "중요", variant: "warning" },
    URGENT: { label: "긴급", variant: "danger" },
};

const URGENCY_TAG: Record<Urgency, Tag> = {
    NOW: { label: "긴급", variant: "danger" },
    TODAY: { label: "중요", variant: "warning" },
    LATER: { label: "일반", variant: "neutral" },
};

// 자세히 보기 모달에 넘기는 내용
type Detail = {
    title: string;
    body: string;
    tag: Tag;
    metas: string[];
    escalation?: Escalation;
};

function messageOf(error: unknown, fallback: string) {
    return error instanceof ApiError ? error.message : fallback;
}

function formatAt(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h12",
    }).format(date);
}

function sentTag(card: Card): Tag {
    return card.escalationPriority === "URGENT" ? PRIORITY_TAG.URGENT : PRIORITY_TAG.IMPORTANT;
}

// 당장 처리할 카드는 긴급, 나머지는 중요로 위임
function priorityOf(card: Card): EscalationPriority {
    return card.urgency === "NOW" ? "URGENT" : "IMPORTANT";
}

function TagBadge({ tag }: { tag: Tag }) {
    return (
        <Badge size="sm" variant={tag.variant} className="delegate-tag">
            {tag.label}
        </Badge>
    );
}

function DelegatePage() {
    const { currentStore, openCards, setOpenCards, liveLoading } = useAppSession();
    const role = currentStore?.myRole;
    const storeId = currentStore?.id;
    const [escalations, setEscalations] = useState<Escalation[]>([]);
    const [loading, setLoading] = useState(role === "OWNER");
    const [message, setMessage] = useState("");
    const [detail, setDetail] = useState<Detail | null>(null);
    const [resolveTarget, setResolveTarget] = useState<Escalation | null>(null);
    const [delegateTarget, setDelegateTarget] = useState<Card | null>(null);
    const [cancelTarget, setCancelTarget] = useState<Card | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!storeId || role !== "OWNER") {
            setLoading(false);
            return;
        }
        const ownerStoreId = storeId;

        let ignore = false;

        async function load() {
            setLoading(true);
            setMessage("");
            try {
                const data = await listEscalations(ownerStoreId);
                if (!ignore) setEscalations(data);
            } catch (error) {
                if (!ignore) setMessage(messageOf(error, "위임 정보를 불러오지 못했습니다."));
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        void load();
        return () => {
            ignore = true;
        };
    }, [storeId, role]);

    function updateCard(cardId: string, patch: Partial<Card>) {
        setOpenCards((current) => current.map((card) => (card.id === cardId ? { ...card, ...patch } : card)));
    }

    async function confirmResolve() {
        if (!resolveTarget || busy) return;
        setBusy(true);
        setMessage("");
        try {
            await resolveEscalation(resolveTarget.cardId);
            setEscalations((current) => current.filter((item) => item.id !== resolveTarget.id));
            setDetail((current) => (current?.escalation?.id === resolveTarget.id ? null : current));
            setResolveTarget(null);
        } catch (error) {
            setMessage(messageOf(error, "처리완료에 실패했습니다."));
        } finally {
            setBusy(false);
        }
    }

    async function confirmDelegate() {
        if (!delegateTarget || busy) return;
        setBusy(true);
        setMessage("");
        const priority = priorityOf(delegateTarget);
        try {
            await createEscalation(delegateTarget.id, priority);
            updateCard(delegateTarget.id, { escalationStatus: "PENDING", escalationPriority: priority });
            setDelegateTarget(null);
        } catch (error) {
            setMessage(messageOf(error, "위임에 실패했습니다."));
        } finally {
            setBusy(false);
        }
    }

    async function confirmCancel() {
        if (!cancelTarget || busy) return;
        setBusy(true);
        setMessage("");
        try {
            await cancelEscalation(cancelTarget.id);
            updateCard(cancelTarget.id, { escalationStatus: null, escalationPriority: null });
            setCancelTarget(null);
        } catch (error) {
            setMessage(messageOf(error, "위임 취소에 실패했습니다."));
        } finally {
            setBusy(false);
        }
    }

    if (!currentStore) {
        if (loading) return <Loading text="위임 목록을 불러오는 중입니다..." />;
        return <ErrorState title="매장을 찾지 못했습니다." description="매장을 선택한 뒤 다시 열어 주세요." />;
    }

    if (loading || (role === "MANAGER" && liveLoading && openCards.length === 0)) {
        return <Loading text="위임 목록을 불러오는 중입니다..." />;
    }

    if (role === "STAFF" || !role) {
        return (
            <section className="delegate">
                <header className="delegate__header">
                    <h1>관리자 위임</h1>
                    <p>매니저가 혼자 처리하기 어려운 인수인계를 오너에게 넘기는 기능입니다.</p>
                </header>
                <EmptyState
                    title="오너와 매니저가 사용하는 화면입니다."
                    description="매니저가 위임하면 오너가 이 목록에서 확인하고 처리합니다."
                />
            </section>
        );
    }

    return (
        <section className="delegate">
            <header className="delegate__header">
                <h1>관리자 위임</h1>
                <p>
                    {role === "OWNER"
                        ? "Manager가 위임한 항목을 확인하고 처리하세요."
                        : "Owner 처리가 필요한 항목을 위임하세요."}
                </p>
            </header>

            <div className="delegate__banner">
                <svg className="delegate__banner-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Z" />
                    <path d="m9 12 2 2 4-4" />
                </svg>
                <div>
                    <strong>{role === "OWNER" ? "Owner 권한으로 보는 중" : "Manager 권한으로 보는 중"}</strong>
                    <span>
                        {role === "OWNER"
                            ? `위임된 항목 ${escalations.length}건을 처리할 수 있어요.`
                            : "처리 권한이 없는 항목을 Owner에게 위임할 수 있어요."}
                    </span>
                </div>
            </div>

            {message && (
                <p className="delegate__message" role="alert">
                    {message}
                </p>
            )}

            {role === "OWNER" ? (
                <OwnerList
                    items={escalations}
                    onDetail={(item) =>
                        setDetail({
                            title: item.title,
                            body: item.body,
                            tag: PRIORITY_TAG[item.priority],
                            metas: [`작성: ${item.authorName}`, `위임: ${item.requestedByName}`],
                            escalation: item,
                        })
                    }
                    onResolve={setResolveTarget}
                />
            ) : (
                <ManagerList
                    cards={openCards}
                    onDetail={(card, tag) =>
                        setDetail({
                            title: card.title,
                            body: card.body,
                            tag,
                            metas: [`작성: ${card.authorName}`, ...(card.assigneeName ? [`담당: ${card.assigneeName}`] : [])],
                        })
                    }
                    onDelegate={setDelegateTarget}
                    onCancel={setCancelTarget}
                />
            )}

            <Modal open={detail !== null} title={detail?.title ?? "위임 상세"} onClose={() => setDetail(null)}>
                {detail && (
                    <div className="delegate-detail">
                        <TagBadge tag={detail.tag} />
                        {detail.metas.map((meta) => (
                            <p key={meta} className="delegate-detail__meta">
                                {meta}
                            </p>
                        ))}
                        <p className="delegate-detail__body">{detail.body}</p>
                        {detail.escalation && (
                            <Button type="button" onClick={() => setResolveTarget(detail.escalation ?? null)}>
                                처리완료
                            </Button>
                        )}
                    </div>
                )}
            </Modal>

            <ConfirmDialog
                open={resolveTarget !== null}
                title="이 위임을 처리완료할까요?"
                description="처리완료하면 위임이 끝나고 해당 인수인계 카드도 완료됩니다."
                confirmText={busy ? "처리 중..." : "처리완료"}
                onConfirm={confirmResolve}
                onClose={() => {
                    if (!busy) setResolveTarget(null);
                }}
            />

            <ConfirmDialog
                open={delegateTarget !== null}
                title="Owner에게 위임할까요?"
                description={
                    delegateTarget
                        ? `${delegateTarget.title} 항목을 ${PRIORITY_TAG[priorityOf(delegateTarget)].label}으로 위임합니다.`
                        : undefined
                }
                confirmText={busy ? "위임 중..." : "위임하기"}
                onConfirm={confirmDelegate}
                onClose={() => {
                    if (!busy) setDelegateTarget(null);
                }}
            />

            <ConfirmDialog
                open={cancelTarget !== null}
                title="위임을 취소할까요?"
                description={cancelTarget ? `${cancelTarget.title} 항목이 위임 가능한 항목으로 돌아갑니다.` : undefined}
                confirmText={busy ? "취소 중..." : "위임 취소"}
                onConfirm={confirmCancel}
                onClose={() => {
                    if (!busy) setCancelTarget(null);
                }}
            />
        </section>
    );
}

function OwnerList({
    items,
    onDetail,
    onResolve,
}: {
    items: Escalation[];
    onDetail: (item: Escalation) => void;
    onResolve: (item: Escalation) => void;
}) {
    return (
        <>
            <div className="delegate__section-title">
                <h2>처리 필요</h2>
                <span className="delegate__count">{items.length}</span>
            </div>
            {items.length === 0 ? (
                <EmptyState title="처리 대기 중인 위임이 없습니다." description="매니저가 넘긴 항목이 여기에 표시됩니다." />
            ) : (
                <ul className="delegate__list">
                    {items.map((item) => (
                        <li key={item.id}>
                            <article className="delegate-card delegate-card--sent">
                                <div className="delegate-card__meta">
                                    <TagBadge tag={PRIORITY_TAG[item.priority]} />
                                    <span>{formatAt(item.createdAt)}</span>
                                    <span>위임 {item.requestedByName}</span>
                                </div>
                                <h3>{item.title}</h3>
                                <p>{item.body}</p>
                                <div className="delegate-card__actions">
                                    <Button type="button" variant="secondary" className="delegate-card__detail" onClick={() => onDetail(item)}>
                                        자세히 보기
                                    </Button>
                                    <Button type="button" className="delegate-card__done" onClick={() => onResolve(item)}>
                                        처리완료
                                    </Button>
                                </div>
                            </article>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}

function ManagerList({
    cards,
    onDetail,
    onDelegate,
    onCancel,
}: {
    cards: Card[];
    onDetail: (card: Card, tag: Tag) => void;
    onDelegate: (card: Card) => void;
    onCancel: (card: Card) => void;
}) {
    const sent = cards.filter((card) => card.escalationStatus === "PENDING");
    const waiting = cards.filter((card) => card.escalationStatus !== "PENDING");

    return (
        <>
            <div className="delegate__section-title">
                <h2>OWNER에게 위임됨</h2>
                <span className="delegate__count delegate__count--sent">{sent.length}</span>
            </div>
            {sent.length === 0 ? (
                <p className="delegate__empty">아직 위임한 항목이 없어요.</p>
            ) : (
                <ul className="delegate__list">
                    {sent.map((card) => (
                        <li key={card.id}>
                            <article className="delegate-card delegate-card--sent">
                                <div className="delegate-card__meta">
                                    <TagBadge tag={sentTag(card)} />
                                    <span>{formatAt(card.createdAt)}</span>
                                </div>
                                <h3>{card.title}</h3>
                                <p>{card.body}</p>
                                <div className="delegate-card__actions">
                                    <Button type="button" variant="secondary" className="delegate-card__detail" onClick={() => onDetail(card, sentTag(card))}>
                                        자세히 보기
                                    </Button>
                                    <Button type="button" variant="secondary" className="delegate-card__cancel" onClick={() => onCancel(card)}>
                                        위임 취소
                                    </Button>
                                </div>
                            </article>
                        </li>
                    ))}
                </ul>
            )}

            <div className="delegate__section-title">
                <h2>위임 가능한 항목</h2>
            </div>
            {waiting.length === 0 ? (
                <EmptyState title="위임할 미완료 카드가 없습니다." description="열린 인수인계 카드가 있으면 여기서 Owner에게 넘길 수 있습니다." />
            ) : (
                <ul className="delegate__list">
                    {waiting.map((card) => (
                        <li key={card.id}>
                            <article className="delegate-card">
                                <div className="delegate-card__meta">
                                    <TagBadge tag={URGENCY_TAG[card.urgency]} />
                                    {card.assigneeName && <span>담당 {card.assigneeName}</span>}
                                </div>
                                <h3>{card.title}</h3>
                                <p>{card.body}</p>
                                <div className="delegate-card__actions delegate-card__actions--wide">
                                    <Button type="button" variant="secondary" className="delegate-card__detail" onClick={() => onDetail(card, URGENCY_TAG[card.urgency])}>
                                        자세히
                                    </Button>
                                    <Button type="button" className="delegate-card__send" onClick={() => onDelegate(card)}>
                                        Owner에게 위임
                                    </Button>
                                </div>
                            </article>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}

export default DelegatePage;
