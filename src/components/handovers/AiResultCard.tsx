import { useState } from "react";
import type { Card, CardType, Urgency, UpdateCardRequest } from "@/types/api";
import Button from "../ui/Button";

interface AiResultCardProps {
    card: Card;
    onSave: (
        cardId: string,
        data: UpdateCardRequest
    ) => Promise<void>;
}

function AiResultCard({
    card,
    onSave,
}: AiResultCardProps) {
    const [editing, setEditing] = useState(false);
    const [type, setType] = useState<CardType>(card.type);
    const [urgency, setUrgency] = useState<Urgency>(card.urgency);
    const [title, setTitle] = useState(card.title);
    const [body, setBody] = useState(card.body);
    const [saving, setSaving] = useState(false);
    
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
    if (editing) {
        return (
            <article className="ai-result-card">
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as CardType)}
                >
                    <option value="STOCK">재고</option>
                    <option value="TASK">할 일</option>
                    <option value="GUEST">고객</option>
                    <option value="NOTICE">공지</option>
                </select>

                <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as Urgency)}
                >
                    <option value="NOW">긴급</option>
                    <option value="TODAY">오늘</option>
                    <option value="LATER">나중</option>
                </select>

                <input value={title} onChange={(e) => setTitle(e.target.value)} />
                <textarea value={body} onChange={(e) => setBody(e.target.value)} />
                <Button type="button" onClick={handleCancel} disabled={saving}>
                    취소
                </Button>
                <Button type="button" onClick={handleSave} disabled={saving}>
                    {saving ? "저장 중..." : "저장"}
                </Button>
            </article>
        );
    }

    return (
        <article className="ai-result-card">
            <div className="ai-result-card__header">
                <span>{card.type}</span>
                <span>{card.urgency}</span>
            </div>

            <h3>{card.title}</h3>
            <p>{card.body}</p>

            {card.needsReview && (
                <p>검토가 필요한 내용입니다.</p>
            )}

            <Button type="button" onClick={() => setEditing(true)}>수정</Button>
        </article>
    );
}

export default AiResultCard;