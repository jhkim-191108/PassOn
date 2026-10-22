import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import Button from "@/components/ui/Button";
import { getHandoffs } from "@/api/handoffs";
import type { Handoff, Store } from "@/types/api";
import Loading from "@/components/ui/Loading";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";

import "../../css/handovers.css";

interface AppContext {
    currentStore: Store | undefined;
}

function HandoverPage() {
    const navigate = useNavigate();
    const { currentStore } = useOutletContext<AppContext>();
    const [handoffs, setHandoffs] = useState<Handoff[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadHandoffs = async () => {
            if (!currentStore) {
                setError("매장 정보를 찾을 수 없습니다.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError("");
                
                const data = await getHandoffs(currentStore.id);
            
                setHandoffs(data);
            } catch (error) {
                console.error(
                    "인수인계 조회 실패:",
                    error
                );
                setError(
                    "인수인계를 불러오지 못했습니다."
                );
            } finally {
                setLoading(false);
            }
        };
        loadHandoffs();
    }, [currentStore]);
        
    return (
        <section className="handover-page">
            <div className="handover-page__header">
                <h1>인수인계</h1>

                <Button
                    type="button"
                    onClick={() =>
                        navigate("/app/handovers/new")
                    }
                >
                    새 인수인계 작성
                </Button>
            </div>

            {loading && (
                <Loading text="인수인계를 불러오는 중입니다..." />
            )}

            {error && (
                <ErrorState 
                    title={error} 
                    description="잠시 후 다시 시도해 주세요."
                />
            )}

            {!loading &&
            !error &&
            handoffs.length === 0 && (
                <EmptyState 
                    title="등록된 인수인계가 없습니다."
                    description="새 인수인계를 작성해주세요."
                />
            )}

            {!loading &&
            !error &&
            handoffs.length > 0 && (
                <div className="handover-list">
                    {handoffs.map((handoff) => (
                        <article
                            key={handoff.id}
                            className="handover-list__item"
                            onClick={() => navigate(`/app/handovers/${handoff.id}`)}
                        >
                            <div>
                                <strong>
                                    {handoff.authorName}
                                </strong>
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

                            <p>{handoff.rawText}</p>

                            <div className="handover-list__meta">
                                <Badge variant="neutral" size="sm">
                                    카드 {handoff.cardCount}개
                                </Badge>
                                <Badge variant={handoff.openCardCount > 0 ? "danger" : "success"} size="sm">
                                    미완료 {handoff.openCardCount}개
                                </Badge>
                                <Badge variant={handoff.status === "CONFIRMED" ? "success" : "warning"} size="sm">
                                    {handoff.status === "CONFIRMED" ? "등록 완료" : handoff.status}
                                </Badge>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

export default HandoverPage;