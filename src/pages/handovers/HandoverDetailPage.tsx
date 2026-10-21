import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getHandoff } from "@/api/handoffs";
import { getHandoffCards } from "@/api/cards";
import type { Handoff, Card, } from "@/types/api";
import Loading from "@/components/ui/Loading";
import ErrorState from "@/components/ui/ErrorState";

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
                            <span>{card.type}</span>
                            <span>{card.urgency}</span>
                        </div>
                        <h3>{card.title}</h3>
                        <p>{card.body}</p>

                        <span>{card.progress}</span>
                    </article>
                ))}
            </div>
        </section>
    )
}

export default HandoverDetailPage;