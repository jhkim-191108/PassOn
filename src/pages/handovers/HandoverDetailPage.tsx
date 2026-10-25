import { useEffect, useState } from "react";
import { useAppSession } from "@/layouts/appSession";
import { useParams } from "react-router-dom";
import { getHandoff } from "@/api/handoffs";
import {
    getHandoffCards,
    deleteCard,
    acknowledgeCard,
    unacknowledgeCard,
    completeCard,
    reopenCard,
} from "@/api/cards";
import { getCardMemos, createCardMemo, } from "@/api/memos";
import type { Handoff, Card, Photo, CardProgress, MemoView, } from "@/types/api";
import Loading from "@/components/ui/Loading";
import ErrorState from "@/components/ui/ErrorState";
import Badge from "@/components/ui/Badge";
import { getHandoffPhotos, getPhotoFile } from "@/api/photos";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";

import "../../css/handovers.css";

const cardTypeLabel = {
    STOCK: "재고",
    TASK: "할 일",
    GUEST: "고객",
    NOTICE: "공지",
};

const urgencyLabel = {
    NOW: "긴급",
    TODAY: "오늘",
    LATER: "나중",
};

const progressLabel = {
    OPEN: "미완료",
    IN_PROGRESS: "진행 중",
    DONE: "완료",
};

const typeBadgeVariant = {
    STOCK: "warning",
    TASK: "primary",
    GUEST: "neutral",
    NOTICE: "success",
} as const;

const urgencyBadgeVariant = {
    NOW: "danger",
    TODAY: "warning",
    LATER: "neutral",
} as const;

const progressBadgeVariant = {
    OPEN: "danger",
    IN_PROGRESS: "primary",
    DONE: "success",
} as const;

type DisplayPhoto = Photo & {
    url: string;
};

function HandoverDetailPage() {
    const {handoffId} = useParams<{ handoffId: string }>();
    const { currentStore } = useAppSession();
    const canManageCompletion =
        currentStore?.myRole === "OWNER" ||
        currentStore?.myRole === "MANAGER";
    const [handoff, setHandoff] = useState<Handoff | null>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [photos, setPhotos] = useState<DisplayPhoto[]>([]);
    const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [changingCardId, setChangingCardId] = useState<string | null>(null);
    const [memos, setMemos] = useState<Record<string, MemoView[]>>({});
    const [memoInputs, setMemoInputs] = useState<Record<string, string>>({});
    const [addingMemoCardId, setAddingMemoCardId] = useState<string | null>(null);
    const [memoErrors, setMemoErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        let cancelled = false;
        const objectUrls: string[] = [];
        const loadHandoff = async () => {
            if (!handoffId) {
                setError("인수인계 정보를 찾을 수 없습니다.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const [handoffData, cardData, photoData] = 
                    await Promise.all([
                        getHandoff(handoffId),
                        getHandoffCards(handoffId),
                        getHandoffPhotos(handoffId),
                    ]);

                    const memoEntries = await Promise.all(
                        cardData.map(async (card) => {
                            try {
                                const cardMemos = await getCardMemos(card.id);

                                return [
                                    card.id,
                                    cardMemos,
                                ] as const;
                            } catch(error) {
                                console.error("메모 조회 실패", card.id, error);
                                return [
                                card.id,
                                []
                                ] as const;
                            }
                        })
                    );

                    const memoMap: Record<string, MemoView[]> = Object.fromEntries(memoEntries);

                    const photoFiles = await Promise.all(
                        photoData.map(async (photo) => {
                            const blob = await getPhotoFile(
                                handoffId,
                                photo.id
                            );

                            const url = URL.createObjectURL(blob);
                            objectUrls.push(url);

                            return{
                                ...photo,
                                url,
                            };
                        })
                    );

                    if(cancelled) {
                        objectUrls.forEach((url) => URL.revokeObjectURL(url));
                        return;
                    }

                    setHandoff(handoffData);
                    setCards(cardData);
                    setPhotos(photoFiles);
                    setMemos(memoMap);
            } catch (error) {
                if (cancelled) return;

                console.error("인수인계 상세 조회 실패", error);
                setError("인수인계를 불러오지 못했습니다.");
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };
        loadHandoff();

        return () => {
            cancelled = true;

            objectUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [handoffId]);

    const handleDeleteCard = async () => {
        if (!canManageCompletion) return;
        if (!deleteCardId) return;

        try {
            setDeleting(true);
            setError("");

            await deleteCard(deleteCardId);

            setCards((current) => 
                current.filter(
                    (card) => card.id !== deleteCardId
                )
            );

            setDeleteCardId(null);
        } catch (error) {
            console.error("카드 삭제 실패:", error);
            setError("카드를 삭제하지 못했습니다.");
        } finally {
            setDeleting(false);
        }
    };

    const handleProgressChange = async (
        card: Card,
        nextProgress: CardProgress
    ) => {
        if(card.progress === nextProgress) return;
        if (!canManageCompletion) return;

        try {
            setChangingCardId(card.id);
            setError("");

            let updatedCard: Card;

            if (nextProgress === "DONE") {
                updatedCard = await completeCard(card.id);
            } else if (card.progress === "DONE") {
                const reopenedCard = await reopenCard(card.id);

                if(nextProgress === "IN_PROGRESS") {
                    updatedCard = await acknowledgeCard(
                        reopenedCard.id
                    );
                } else {
                    updatedCard = reopenedCard;
                }
            } else if (nextProgress === "IN_PROGRESS") {
                updatedCard = await acknowledgeCard(card.id);
            } else {
                updatedCard = await unacknowledgeCard(card.id);
            }
            setCards((current) => 
                current.map((item) =>
                    item.id === updatedCard.id
                        ? updatedCard
                        : item
                )
            );
        } catch (error) {
            console.error("카드 처리 상태 변경 실패:", error);
            setError("카드 처리 상태를 변경하지 못했습니다.");
        } finally {
            setChangingCardId(null);
        }
    };

    if (loading) {
        return (
            <Loading text="인수인계를 불러오는 중입니다." />
        );
    }

    if(error || !handoff) {
        return (
            <ErrorState 
                title={error || "인수인계를 찾을 수 없습니다."}
                description="잠시 후 다시 시도해 주세요."
            />
        );
    }

    const handleAddMemo = async (cardId: string) => {
        const body = memoInputs[cardId]?.trim();

        if (!body) return;
        try {
            setAddingMemoCardId(cardId);
            setMemoErrors((current) => ({
                ...current,
                [cardId]: "",
            }));
            const createdMemo = await createCardMemo(
                cardId,
                body
            );

            setMemos((current) => ({
                ...current,
                [cardId]: [
                    ...(current[cardId] ?? []),
                    createdMemo,
                ],
            }));

            setMemoInputs((current) => ({
                ...current,
                [cardId]: "",
            }));
        } catch (error) {
            console.error("메모 등록 실패:", error);
            setMemoErrors((current) => ({
                ...current,
                [cardId]: "메모를 등록하지 못했습니다.",
            }));
        } finally {
            setAddingMemoCardId(null);
        }
    }

    return (
        <section className="handover-detail">
                <header className="handover-detail__header">
                <h1>인수인계 상세</h1>

                <div className="handover-detail__info">
                    <strong>작성자: {handoff.authorName}</strong>

                    <span>
                        {new Date(
                            handoff.createdAt
                        ).toLocaleString("ko-KR", {
                            year: "numeric",
                            month: "numeric",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                </div>
            </header>
            <div className="handover-detail__status">
                <span>상태 </span>

                <Badge
                    variant={handoff.status === "CONFIRMED" ? "success" : handoff.status === "FAILED" ? "danger" : "warning"}
                    size="sm"
                >{handoff.status === "CONFIRMED" 
                    ? "등록 완료"
                    : handoff.status === "ANALYZED"
                    ? "분석 완료"
                    : handoff.status === "ANALYZING"
                    ? "분석 중"
                    : handoff.status === "FAILED"
                    ? "분석 실패"
                    : "작성 중"}
                </Badge>
            </div>
            {/* <section className="handover-detail__section">
                <h2>원문</h2>
                <div className="handover-detail__original">{handoff.rawText}</div>
            </section> */}
            {photos.length > 0 && (
                <section className="handover-detail__section">
                    <h2>첨부 사진</h2>
                    <div className="handover-detail__photos">
                        {photos.map((photo) => (
                            <a
                                key={photo.id}
                                className="handover-detail__photo"
                                href={photo.url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <img src={photo.url} alt={photo.originalName} />
                                <span>{photo.originalName}</span>
                            </a>
                        ))}
                    </div>
                </section>
            )}
            <section className="handover-detail__section">
                <h2>정리된 인수인계</h2>
                <div className="handover-detail__cards">
                    {cards.map((card) => (
                        <article key={card.id} className="handover-detail__card">
                            <div className="handover-detail__badges">
                                <Badge variant={typeBadgeVariant[card.type]}>{cardTypeLabel[card.type]}</Badge>
                                <Badge variant={urgencyBadgeVariant[card.urgency]}>{urgencyLabel[card.urgency]}</Badge>
                                <Badge variant={progressBadgeVariant[card.progress]}>{progressLabel[card.progress]}</Badge>
                            </div>
                            <h3>{card.title}</h3>
                            <p>{card.body}</p>

                            <div className="handover-detail__card-actions">
                                <div className="handover-detail__progress-control">
                                    <Select
                                        label="처리 상태"
                                        value={card.progress}
                                        disabled={changingCardId === card.id || !canManageCompletion }
                                        onChange={(event) => handleProgressChange(
                                            card,
                                            event.target.value as CardProgress
                                        )}
                                    >
                                        <option value="OPEN">미처리</option>
                                        <option value="IN_PROGRESS">처리 중</option>
                                        <option value="DONE">처리 완료</option>
                                    </Select>
                                </div>
                                {canManageCompletion && (
                                    <Button
                                        type="button"
                                        variant="danger"
                                        size="sm"
                                        disabled={changingCardId === card.id}
                                        onClick={() => setDeleteCardId(card.id)}
                                    >
                                        삭제
                                    </Button>
                                )}
                            </div>
                            <div className="handover-detail__memos">
                                <h4>후속 메모</h4>
                                
                                {(memos[card.id] ?? []).length > 0 && (
                                    <div className="handover-detail__memo-list">
                                        {(memos[card.id] ?? []).map((memo) => (
                                            <div
                                                key={memo.id}
                                                className="handover-detail__memo"
                                            >
                                                <div className="handover-detail__memo-meta">
                                                    <strong>{memo.authorName}</strong>
                                                    <span>
                                                        {new Date(
                                                            memo.createdAt
                                                        ).toLocaleString("ko-KR", {
                                                            month: "numeric",
                                                            day: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                </div>

                                                <p>{memo.body}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="handover-detail__memo-form">
                                    <Textarea 
                                        value={memoInputs[card.id] ?? ""}
                                        placeholder="코멘트를 남겨주세요."
                                        rows={2}
                                        disabled={addingMemoCardId === card.id}
                                        onChange={(event) =>
                                            setMemoInputs((current) => ({
                                                ...current,
                                                [card.id]: event.target.value,
                                            }))
                                        }
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={
                                            addingMemoCardId === card.id ||
                                            !(memoInputs[card.id] ?? "").trim()
                                        }
                                        onClick={() => handleAddMemo(card.id)}
                                    >{addingMemoCardId === card.id
                                        ? "등록 중..."
                                        : "등록"}
                                    </Button>
                                </div>
                                {memoErrors[card.id] && (
                                    <p className="handover-detail__memo-error">
                                        {memoErrors[card.id]}
                                    </p>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            </section>
            <ConfirmDialog 
                open={deleteCardId !== null}
                title="카드 삭제"
                description="이 카드를 삭제하시겠습니까?"
                confirmText={deleting ? "삭제 중..." : "삭제"}
                cancelText="취소"
                variant="danger"
                onConfirm={handleDeleteCard}
                onClose={() => {
                    if (!deleting) {
                        setDeleteCardId(null);
                    }
                }}
            />
        </section>
    )
}

export default HandoverDetailPage;