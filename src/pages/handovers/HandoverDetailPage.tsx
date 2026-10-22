import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getHandoff } from "@/api/handoffs";
import { getHandoffCards } from "@/api/cards";
import type { Handoff, Card, } from "@/types/api";
import Loading from "@/components/ui/Loading";
import ErrorState from "@/components/ui/ErrorState";
import Badge from "@/components/ui/Badge";

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

function HandoverDetailPage() {
    const {handoffId} = useParams<{ handoffId: string }>();
    const [handoff, setHandoff] = useState<Handoff | null>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadHandoff = async () => {
            if (!handoffId) {
                setError("인수인계 정보를 찾을 수 없습니다.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const [handoffData, cardData] = 
                    await Promise.all([
                        getHandoff(handoffId),
                        getHandoffCards(handoffId),
                    ]);

                    setHandoff(handoffData);
                    setCards(cardData);
            } catch (error) {
                console.error("인수인계 상세 조회 실패", error);
                setError("인수인계를 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        };
        loadHandoff();
    }, [handoffId]);

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

    return (
        <section className="handover-detail">
            <h1>인수인계 상세</h1>

            <div>
                <strong>{handoff.authorName}</strong>

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
            <p>상태: {handoff.status}</p>
            <div>
                <h2>원문</h2>
                <p>{handoff.rawText}</p>
            </div>
            <div>
                <h2>정리된 인수인계</h2>
                {cards.map((card) => (
                    <article key={card.id}>
                        <div>
                            <Badge variant={typeBadgeVariant[card.type]}>{cardTypeLabel[card.type]}</Badge>
                            <Badge variant={urgencyBadgeVariant[card.urgency]}>{urgencyLabel[card.urgency]}</Badge>
                            <Badge variant={progressBadgeVariant[card.progress]}>{progressLabel[card.progress]}</Badge>
                        </div>
                        <h3>{card.title}</h3>
                        <p>{card.body}</p>
                    </article>
                ))}
            </div>
        </section>
    )
}

export default HandoverDetailPage;