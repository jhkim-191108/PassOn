import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import iconBack from "@/assets/Icon-back.png";
import { api } from "@/api/client";
import { getHandoff } from "@/api/handoffs";
import {
    getHandoffCards,
    deleteCard,
    updateCard,
    acknowledgeCard,
    unacknowledgeCard,
    completeCard,
    reopenCard,
} from "@/api/cards";
import { getCardMemos, createCardMemo } from "@/api/memos";
import { getHandoffPhotos, getPhotoFile } from "@/api/photos";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import type { Member } from "@/features/employees";
import { useAppSession } from "@/layouts/appSession";
import type { Card, CardProgress, Handoff, MemoView, Photo, StoreRole, Urgency } from "@/types/api";

import "../../css/handovers.css";

const URGENCY_BADGE = {
    NOW: { label: "긴급", variant: "danger" },
    TODAY: { label: "중요", variant: "warning" },
    LATER: { label: "일반", variant: "neutral" },
} as const;

const PROGRESS_BADGE = {
    OPEN: { label: "미처리", variant: "warning" },
    IN_PROGRESS: { label: "처리중", variant: "primary" },
    DONE: { label: "완료", variant: "success" },
} as const;

const PROGRESS_ACTIONS: { value: CardProgress; label: string }[] = [
    { value: "OPEN", label: "미처리로 되돌리기" },
    { value: "IN_PROGRESS", label: "확인함 (처리중)" },
    { value: "DONE", label: "처리 완료" },
];

const SLOT_LABEL = { MORNING: "오전", AFTERNOON: "오후", CLOSE: "마감" } as const;

type DisplayPhoto = Photo & { url: string };

type EditForm = { title: string; body: string; urgency: Urgency };

function formatDate(value: string) {
    return new Date(value).toLocaleString("ko-KR", {
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

// 오너 글은 오너만, 매니저 글은 오너와 그 매니저, 직원 글은 오너·매니저·작성자 (서버 PermissionMatrix와 같음)
function canDeleteAuthored(role: StoreRole | undefined, userId: string, authorRole: StoreRole, authorId: string) {
    if (!role) return false;
    if (authorRole === "OWNER") return role === "OWNER";
    if (authorRole === "MANAGER") return role === "OWNER" || userId === authorId;
    return role === "OWNER" || role === "MANAGER" || userId === authorId;
}

function Initial({ name }: { name: string }) {
    return <span className="handover-detail__avatar">{name.slice(0, 1)}</span>;
}

function HandoverDetailPage() {
    const { handoffId } = useParams<{ handoffId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, currentStore, todayShifts } = useAppSession();
    const myRole = currentStore?.myRole;
    const canChangeStatus = myRole === "OWNER" || myRole === "MANAGER";

    const [handoff, setHandoff] = useState<Handoff | null>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [photos, setPhotos] = useState<DisplayPhoto[]>([]);
    const [memos, setMemos] = useState<MemoView[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [changing, setChanging] = useState(false);
    const [memoInput, setMemoInput] = useState("");
    const [addingMemo, setAddingMemo] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [editForm, setEditForm] = useState<EditForm | null>(null);
    const [saving, setSaving] = useState(false);

    const card = cards.find((item) => item.id === searchParams.get("card")) ?? cards[0];

    useEffect(() => {
        let cancelled = false;
        const objectUrls: string[] = [];

        async function load() {
            if (!handoffId || !currentStore) {
                setError("인수인계 정보를 찾을 수 없습니다.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError("");
                const [handoffData, cardData, photoData, memberRows] = await Promise.all([
                    getHandoff(handoffId),
                    getHandoffCards(handoffId),
                    getHandoffPhotos(handoffId),
                    api<Member[]>(`/api/stores/${currentStore.id}/members`),
                ]);
                const photoFiles = await Promise.all(
                    photoData.map(async (photo) => {
                        const url = URL.createObjectURL(await getPhotoFile(handoffId, photo.id));
                        objectUrls.push(url);
                        return { ...photo, url };
                    }),
                );
                if (cancelled) return;
                setHandoff(handoffData);
                setCards(cardData);
                setPhotos(photoFiles);
                setMembers(memberRows);
            } catch (loadError) {
                if (cancelled) return;
                console.error("인수인계 상세 조회 실패", loadError);
                setError("인수인계를 불러오지 못했습니다.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void load();
        return () => {
            cancelled = true;
            objectUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [handoffId, currentStore]);

    const cardId = card?.id;
    useEffect(() => {
        if (!cardId) return;
        let cancelled = false;
        setMemos([]);
        getCardMemos(cardId)
            .then((items) => {
                if (!cancelled) setMemos(items);
            })
            .catch((memoError) => console.error("메모 조회 실패", memoError));
        return () => {
            cancelled = true;
        };
    }, [cardId]);

    const goList = () => navigate("/app/handovers");

    if (loading) return <Loading text="인수인계를 불러오는 중입니다." />;

    if (error || !handoff) {
        return <ErrorState title={error || "인수인계를 찾을 수 없습니다."} description="잠시 후 다시 시도해 주세요." />;
    }

    const backLink = (
        <button type="button" className="handover-detail__back" onClick={goList}>
            <img src={iconBack} alt="" width={14} height={14} />
            목록으로
        </button>
    );

    if (!card) {
        return (
            <section className="handover-detail">
                {backLink}
                <EmptyState title="정리된 카드가 없습니다." description="인수인계 분석이 끝나면 카드가 표시됩니다." />
            </section>
        );
    }

    const authorRole = members.find((member) => member.userId === handoff.authorId)?.role ?? "OWNER";
    const canDelete = canDeleteAuthored(myRole, user.id, authorRole, handoff.authorId);
    const canEdit = myRole === "OWNER" || myRole === "MANAGER" || handoff.authorId === user.id;
    const shift = todayShifts.find((item) => item.memberId === card.assigneeMemberId);
    const urgency = URGENCY_BADGE[card.urgency];
    const progress = PROGRESS_BADGE[card.progress];

    const replaceCard = (next: Card) => setCards((current) => current.map((item) => (item.id === next.id ? next : item)));

    async function changeProgress(next: CardProgress) {
        if (!card || card.progress === next || !canChangeStatus) return;
        try {
            setChanging(true);
            setActionError("");
            let updated: Card;
            if (next === "DONE") {
                updated = await completeCard(card.id);
            } else if (card.progress === "DONE") {
                const reopened = await reopenCard(card.id);
                updated = next === "IN_PROGRESS" ? await acknowledgeCard(reopened.id) : reopened;
            } else if (next === "IN_PROGRESS") {
                updated = await acknowledgeCard(card.id);
            } else {
                updated = await unacknowledgeCard(card.id);
            }
            replaceCard(updated);
        } catch (changeError) {
            console.error("카드 처리 상태 변경 실패:", changeError);
            setActionError("처리 상태를 변경하지 못했습니다.");
        } finally {
            setChanging(false);
        }
    }

    async function addMemo() {
        const body = memoInput.trim();
        if (!card || !body) return;
        try {
            setAddingMemo(true);
            setActionError("");
            const created = await createCardMemo(card.id, body);
            setMemos((current) => [...current, created]);
            setMemoInput("");
        } catch (memoError) {
            console.error("메모 등록 실패:", memoError);
            setActionError("메모를 등록하지 못했습니다.");
        } finally {
            setAddingMemo(false);
        }
    }

    async function saveEdit(event: FormEvent) {
        event.preventDefault();
        if (!card || !editForm || !editForm.title.trim()) return;
        try {
            setSaving(true);
            setActionError("");
            const updated = await updateCard(card.id, {
                type: card.type,
                title: editForm.title.trim(),
                body: editForm.body.trim(),
                urgency: editForm.urgency,
                needsReview: card.needsReview,
            });
            replaceCard(updated);
            setEditForm(null);
        } catch (saveError) {
            setActionError(saveError instanceof Error ? saveError.message : "카드를 수정하지 못했습니다.");
        } finally {
            setSaving(false);
        }
    }

    async function removeCard() {
        if (!card) return;
        try {
            setDeleting(true);
            await deleteCard(card.id);
            goList();
        } catch (deleteError) {
            setDeleteOpen(false);
            setActionError(deleteError instanceof Error ? deleteError.message : "카드를 삭제하지 못했습니다.");
        } finally {
            setDeleting(false);
        }
    }

    return (
        <section className="handover-detail">
            {backLink}

            <div className={`handover-detail__bar handover-detail__bar--${card.urgency.toLowerCase()}`} />

            <header className="handover-detail__header">
                <h1>{card.title}</h1>
                <div className="handover-detail__badges">
                    <Badge variant={urgency.variant} size="sm" className="handover-detail__urgency">
                        {urgency.label}
                    </Badge>
                    <Badge variant={progress.variant} size="sm">
                        {progress.label}
                    </Badge>
                </div>
                <p className="handover-detail__meta">
                    <span>
                        <Initial name={handoff.authorName} />
                        {handoff.authorName} 작성
                    </span>
                    <span>{formatDate(card.createdAt)}</span>
                    {card.assigneeName && (
                        <span>
                            <Initial name={card.assigneeName} />
                            {card.assigneeName} 담당{shift ? ` (${SLOT_LABEL[shift.slot]})` : ""}
                        </span>
                    )}
                </p>
            </header>

            {actionError && (
                <p className="handover-detail__error" role="alert">
                    {actionError}
                </p>
            )}

            <div className="handover-detail__box handover-detail__body">{card.body}</div>

            {photos.length > 0 && (
                <div className="handover-detail__photos-wrap">
                    <h2 className="handover-detail__label">첨부 사진 {photos.length}장</h2>
                    <div className="handover-detail__photos">
                        {photos.map((photo) => (
                            <a key={photo.id} className="handover-detail__photo" href={photo.url} target="_blank" rel="noreferrer">
                                <img src={photo.url} alt={photo.originalName} />
                            </a>
                        ))}
                    </div>
                </div>
            )}

            <div className="handover-detail__box">
                <h2 className="handover-detail__label">상태 관리</h2>
                <div className="handover-detail__progress" role="group" aria-label="처리 상태">
                    {PROGRESS_ACTIONS.map((action) => (
                        <button
                            key={action.value}
                            type="button"
                            className="handover-detail__progress-button"
                            aria-pressed={card.progress === action.value}
                            disabled={changing || !canChangeStatus}
                            onClick={() => void changeProgress(action.value)}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="handover-detail__box">
                <h2 className="handover-detail__label">진행 상황 메모</h2>
                {memos.length === 0 ? (
                    <p className="handover-detail__hint">아직 메모가 없어요. 진행 상황을 남겨보세요.</p>
                ) : (
                    <ul className="handover-detail__memos">
                        {memos.map((memo) => (
                            <li key={memo.id}>
                                <div>
                                    <strong>{memo.authorName}</strong>
                                    <span>{formatDate(memo.createdAt)}</span>
                                </div>
                                <p>{memo.body}</p>
                            </li>
                        ))}
                    </ul>
                )}
                <form
                    className="handover-detail__memo-form"
                    onSubmit={(event) => {
                        event.preventDefault();
                        void addMemo();
                    }}
                >
                    <Input
                        value={memoInput}
                        placeholder="진행 상황을 메모하세요..."
                        aria-label="진행 상황 메모"
                        disabled={addingMemo}
                        onChange={(event) => setMemoInput(event.target.value)}
                    />
                    <Button type="submit" size="sm" disabled={addingMemo || !memoInput.trim()}>
                        {addingMemo ? "추가 중..." : "추가"}
                    </Button>
                </form>
            </div>

            {(canEdit || canDelete) && (
                <div className="handover-detail__footer">
                    {canEdit && (
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditForm({ title: card.title, body: card.body, urgency: card.urgency })}
                        >
                            수정
                        </Button>
                    )}
                    {canDelete && (
                        <Button type="button" variant="danger" size="sm" className="handover-detail__delete" onClick={() => setDeleteOpen(true)}>
                            삭제
                        </Button>
                    )}
                </div>
            )}

            <Modal open={editForm !== null} title="카드 수정" onClose={() => !saving && setEditForm(null)}>
                {editForm && (
                    <form className="handover-detail__edit" onSubmit={saveEdit}>
                        <Input
                            label="제목"
                            value={editForm.title}
                            onChange={(event) => setEditForm({ ...editForm, title: event.target.value })}
                        />
                        <Textarea
                            label="내용"
                            rows={4}
                            value={editForm.body}
                            onChange={(event) => setEditForm({ ...editForm, body: event.target.value })}
                        />
                        <Select
                            label="긴급도"
                            value={editForm.urgency}
                            onChange={(event) => setEditForm({ ...editForm, urgency: event.target.value as Urgency })}
                        >
                            <option value="NOW">긴급</option>
                            <option value="TODAY">중요</option>
                            <option value="LATER">일반</option>
                        </Select>
                        <div className="handover-detail__edit-actions">
                            <Button type="button" variant="secondary" onClick={() => setEditForm(null)} disabled={saving}>
                                취소
                            </Button>
                            <Button type="submit" disabled={saving || !editForm.title.trim()}>
                                {saving ? "저장 중..." : "저장"}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            <ConfirmDialog
                open={deleteOpen}
                title="카드 삭제"
                description="이 카드를 삭제하시겠습니까? 휴지통에서 복구할 수 있어요."
                confirmText={deleting ? "삭제 중..." : "삭제"}
                cancelText="취소"
                variant="danger"
                onConfirm={removeCard}
                onClose={() => !deleting && setDeleteOpen(false)}
            />
        </section>
    );
}

export default HandoverDetailPage;
