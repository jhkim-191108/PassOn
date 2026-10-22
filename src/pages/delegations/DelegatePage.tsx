import { useEffect, useState } from "react";
import { ApiError } from "@/api/client";
import { createEscalation, listEscalations, resolveEscalation } from "@/api/escalations";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Loading from "@/components/ui/Loading";
import Modal from "@/components/ui/Modal";
import type { Card, Escalation, EscalationPriority } from "@/types/api";
import { useAppSession } from "@/layouts/appSession";
import "../../css/delegate.css";

const PRIORITY_LABEL: Record<EscalationPriority, string> = {
    IMPORTANT: "중요",
    URGENT: "긴급",
};

function messageOf(error: unknown, fallback: string) {
    return error instanceof ApiError ? error.message : fallback;
}

function DelegatePage() {
    const { currentStore, openCards, setOpenCards, liveLoading } = useAppSession();
    const role = currentStore?.myRole;
    const storeId = currentStore?.id;
    const [escalations, setEscalations] = useState<Escalation[]>([]);
    const [loading, setLoading] = useState(role === "OWNER");
    const [message, setMessage] = useState("");
    const [detail, setDetail] = useState<Escalation | null>(null);
    const [resolveTarget, setResolveTarget] = useState<Escalation | null>(null);
    const [delegateTarget, setDelegateTarget] = useState<{ card: Card; priority: EscalationPriority } | null>(null);
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

    async function confirmResolve() {
        if (!resolveTarget || busy) return;
        setBusy(true);
        setMessage("");
        try {
            await resolveEscalation(resolveTarget.cardId);
            setEscalations((current) => current.filter((item) => item.id !== resolveTarget.id));
            setDetail((current) => (current?.id === resolveTarget.id ? null : current));
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
        try {
            await createEscalation(delegateTarget.card.id, delegateTarget.priority);
            setOpenCards((current) =>
                current.map((card) =>
                    card.id === delegateTarget.card.id
                        ? { ...card, escalationStatus: "PENDING", escalationPriority: delegateTarget.priority }
                        : card
                )
            );
            setDelegateTarget(null);
        } catch (error) {
            setMessage(messageOf(error, "위임에 실패했습니다."));
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
                        : "혼자 처리하기 어려운 항목을 Owner에게 위임하세요."}
                </p>
            </header>

            {message && (
                <p className="delegate__message" role="alert">
                    {message}
                </p>
            )}

            {role === "OWNER" ? (
                <OwnerList
                    items={escalations}
                    onDetail={setDetail}
                    onResolve={setResolveTarget}
                />
            ) : (
                <ManagerList cards={openCards} onDelegate={(card, priority) => setDelegateTarget({ card, priority })} />
            )}

            <Modal open={detail !== null} title={detail?.title ?? "위임 상세"} onClose={() => setDetail(null)}>
                {detail && (
                    <div className="delegate-detail">
                        <p className={`delegate-badge delegate-badge--${detail.priority.toLowerCase()}`}>
                            {PRIORITY_LABEL[detail.priority]}
                        </p>
                        <p className="delegate-detail__meta">작성: {detail.authorName}</p>
                        <p className="delegate-detail__meta">위임: {detail.requestedByName}</p>
                        <p className="delegate-detail__body">{detail.body}</p>
                        <Button type="button" onClick={() => setResolveTarget(detail)}>
                            처리완료
                        </Button>
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
                title="오너에게 위임할까요?"
                description={
                    delegateTarget
                        ? `${delegateTarget.card.title} 항목을 ${PRIORITY_LABEL[delegateTarget.priority]}으로 위임합니다.`
                        : undefined
                }
                confirmText={busy ? "위임 중..." : "위임하기"}
                onConfirm={confirmDelegate}
                onClose={() => {
                    if (!busy) setDelegateTarget(null);
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
            <div className="delegate__banner">
                <strong>Owner 권한으로 보는 중</strong>
                <span>위임된 항목 {items.length}건을 처리할 수 있어요.</span>
            </div>
            <div className="delegate__section-title">
                <h2>처리 필요</h2>
                <span>{items.length}</span>
            </div>
            {items.length === 0 ? (
                <EmptyState title="처리 대기 중인 위임이 없습니다." description="매니저가 넘긴 항목이 여기에 표시됩니다." />
            ) : (
                <ul className="delegate__list">
                    {items.map((item) => (
                        <li key={item.id}>
                            <article className="delegate-card">
                                <div className="delegate-card__meta">
                                    <span className={`delegate-badge delegate-badge--${item.priority.toLowerCase()}`}>
                                        {PRIORITY_LABEL[item.priority]}
                                    </span>
                                    <span>작성: {item.authorName}</span>
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
    onDelegate,
}: {
    cards: Card[];
    onDelegate: (card: Card, priority: EscalationPriority) => void;
}) {
    const waiting = cards.filter((card) => card.escalationStatus !== "PENDING");
    const sent = cards.filter((card) => card.escalationStatus === "PENDING");

    return (
        <>
            <div className="delegate__section-title">
                <h2>위임할 항목</h2>
                <span>{waiting.length}</span>
            </div>
            {waiting.length === 0 ? (
                <EmptyState title="위임할 미완료 카드가 없습니다." description="열린 인수인계 카드가 있으면 여기서 오너에게 넘길 수 있습니다." />
            ) : (
                <ul className="delegate__list">
                    {waiting.map((card) => (
                        <li key={card.id}>
                            <article className="delegate-card">
                                <div className="delegate-card__meta">
                                    <span>작성: {card.authorName}</span>
                                </div>
                                <h3>{card.title}</h3>
                                <p>{card.body}</p>
                                <div className="delegate-card__actions">
                                    <Button type="button" variant="secondary" onClick={() => onDelegate(card, "IMPORTANT")}>
                                        중요로 위임
                                    </Button>
                                    <Button type="button" onClick={() => onDelegate(card, "URGENT")}>
                                        긴급으로 위임
                                    </Button>
                                </div>
                            </article>
                        </li>
                    ))}
                </ul>
            )}
            {sent.length > 0 && (
                <>
                    <div className="delegate__section-title">
                        <h2>위임함</h2>
                        <span>{sent.length}</span>
                    </div>
                    <ul className="delegate__list">
                        {sent.map((card) => (
                            <li key={card.id}>
                                <article className="delegate-card delegate-card--sent">
                                    <div className="delegate-card__meta">
                                        <span className={`delegate-badge delegate-badge--${(card.escalationPriority ?? "important").toLowerCase()}`}>
                                            {card.escalationPriority === "URGENT" ? "긴급" : "중요"}
                                        </span>
                                        <span>오너 확인 대기</span>
                                    </div>
                                    <h3>{card.title}</h3>
                                    <p>{card.body}</p>
                                </article>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </>
    );
}

export default DelegatePage;
