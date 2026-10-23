import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getHandoff } from "@/api/handoffs";
import { getHandoffCards } from "@/api/cards";
import type { Handoff, Card, Photo, } from "@/types/api";
import Loading from "@/components/ui/Loading";
import ErrorState from "@/components/ui/ErrorState";
import Badge from "@/components/ui/Badge";
import { getHandoffPhotos, getPhotoFile } from "@/api/photos";

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
    const [handoff, setHandoff] = useState<Handoff | null>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [photos, setPhotos] = useState<DisplayPhoto[]>([]);

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
            <section className="handover-detail__section">
                <h2>원문</h2>
                <div className="handover-detail__original">{handoff.rawText}</div>
            </section>
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
                        </article>
                    ))}
                </div>
            </section>
        </section>
    )
}

export default HandoverDetailPage;