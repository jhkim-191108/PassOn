import type { Card } from "@/types/api";

interface AiResultCardProps {
    card: Card;
}

function AiResultCard({
    card,
}: AiResultCardProps) {
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
        </article>
    );
}

export default AiResultCard;