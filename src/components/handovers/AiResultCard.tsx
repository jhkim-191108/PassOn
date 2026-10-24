import { useState } from "react";
import type { Card, CardType, Urgency, UpdateCardRequest } from "@/types/api";
import ConfirmDialog from "../ui/ConfirmDialog";
import Button from "../ui/Button";
import Select from "../ui/Select";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Badge from "../ui/Badge";

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

interface AiResultCardProps {
    card: Card;
    editable?: boolean;
    onSave: (
        cardId: string,
        data: UpdateCardRequest
    ) => Promise<void>;
    onDelete: (
        cardId: string
    ) => Promise<void>;
}

function AiResultCard({
    card,
    editable = true,
    onSave,
    onDelete,
}: AiResultCardProps) {
    const [editing, setEditing] = useState(false);
    const [type, setType] = useState<CardType>(card.type);
    const [urgency, setUrgency] = useState<Urgency>(card.urgency);
    const [title, setTitle] = useState(card.title);
    const [body, setBody] = useState(card.body);
    const [saving, setSaving] = useState(false);
    // 삭제
    const [deleteOpen, setDeleteOpen] = useState(false);
    
    const handleCancel = () => {
        setType(card.type);
        setUrgency(card.urgency);
        setTitle(card.title);
        setBody(card.body);
        setEditing(false);
    }

    const handleSave = async () => {
        try {
            setSaving(true);
        
            await onSave(card.id, {
                type,
                title,
                body,
                urgency,
                needsReview: false,
            });
            setEditing(false);
        } finally {
            setSaving(false);
        };
    }

    const handleDelete = async () => {
        setDeleteOpen(false);

        await onDelete(card.id);
    };


    if (editing) {
        return (
            <article className="ai-result-card">
                <Select
                    label="카드 종류"
                    value={type}
                    onChange={(e) => setType(e.target.value as CardType)}
                >
                    <option value="STOCK">재고</option>
                    <option value="TASK">할 일</option>
                    <option value="GUEST">고객</option>
                    <option value="NOTICE">공지</option>
                </Select>

                <Select
                    label="처리 시점"
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as Urgency)}
                >
                    <option value="NOW">긴급</option>
                    <option value="TODAY">오늘</option>
                    <option value="LATER">나중</option>
                </Select>

                <Input label="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
                <Textarea label="내용" value={body} onChange={(e) => setBody(e.target.value)} />
                <div className="ai-result-card__actions">
                    <Button type="button" variant="secondary" size="sm" onClick={handleCancel} disabled={saving}>
                        취소
                    </Button>
                    <Button type="button" size="sm" onClick={handleSave} disabled={saving}>
                        {saving ? "저장 중..." : "저장"}
                    </Button>
                </div>
            </article>
        );
    }

    return (
        <article className="ai-result-card">
            <div className="ai-result-card__header">
                <Badge
                    variant={typeBadgeVariant[card.type]}
                    size="sm"
                >
                    {cardTypeLabel[card.type]}
                </Badge>
                <Badge
                    variant={urgencyBadgeVariant[card.urgency]}
                    size="sm"
                >
                    {urgencyLabel[card.urgency]}
                </Badge>
                {card.needsReview && (
                    <Badge variant="warning" size="sm">검토가 필요한 내용입니다.</Badge>
                )}
            </div>

            <h3>{card.title}</h3>
            <p>{card.body}</p>

            <div className="ai-result-card__actions">
                {editable && (
                    <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => setEditing(true)}
                    >
                        수정
                    </Button>
                )}

                <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteOpen(true)}
                >
                    삭제
                </Button>
            </div>
            <ConfirmDialog
                open={deleteOpen}
                title="카드 삭제"
                description="이 카드를 삭제하시겠습니까?"
                confirmText="삭제"
                cancelText="취소"
                variant="danger"
                onConfirm={handleDelete}
                onClose={() => setDeleteOpen(false)}
            />
        </article>
    );
}

export default AiResultCard;