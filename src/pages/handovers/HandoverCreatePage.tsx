import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import HandoverForm from "@/components/handovers/HandoverForm";
import {
    createHandoff,
    analyzeHandoff,
    confirmHandoff,
} from "../../api/handoffs";
import { getHandoffCards, updateCard, deleteCard, } from "../../api/cards";
import type { Store, Card, UpdateCardRequest } from "@/types/api";
import AiResultCard from "@/components/handovers/AiResultCard";
import Button from "@/components/ui/Button";
import { uploadPhoto } from "@/api/photos";

import "../../css/handovers.css";

interface AppContext {
    currentStore: Store | undefined;
}

function HandoverCreatePage() {
    const { currentStore } =
        useOutletContext<AppContext>();
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [cards, setCards] = useState<Card[]>([]);
    const [handoffId, setHandoffId] = useState<string | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [confirmed,setConfirmed] = useState(false);
    const [photos, setPhotos] = useState<File[]>([]);


    const handleSubmit = async (rawText: string) => {
        if (!currentStore) {
            setError("매장 정보를 찾을 수 없습니다.");
            return;
        }
        try {
            setLoading(true);
            setError("");
            // 1. 자연어 저장
            const handoff = await createHandoff(
                currentStore.id,
                rawText
            );
            setHandoffId(handoff.id);
            console.log("원문 저장 완료:", handoff);

            // 1.5 사진 있으면 업로드
            if (photos.length > 0) {
                await Promise.all(
                    photos.map((file) =>
                    uploadPhoto(handoff.id, file)
                    )
                );
                console.log("사진 업로드 완료");
            }
            // 2. AI가 분석
            await analyzeHandoff(handoff.id);
            console.log("AI 분석 완료");
            // 3. 생성된 카드 조회
            const cardData = await getHandoffCards(
                handoff.id
            );
            setCards(cardData);
            console.log("AI 카드:", cardData);
            // 에러처리
        } catch (error) {
            console.error(error);
            setError("인수인계 처리에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!handoffId) return;

        try {
            setConfirming(true);
            setError("");

            const result = await confirmHandoff(handoffId);

            console.log("인수인계 등록 완료:", result);
            setConfirmed(true);
        } catch (error) {
            console.error(error);
            setError("인수인계 등록에 실패했습니다.");
        } finally {
            setConfirming(false);
        }
    }

    const handleUpdateCard = async (
        cardId: string,
        data: UpdateCardRequest
    ) => {
        try {
            setError("");

            const updated = await updateCard(
                cardId,
                data
            );

            setCards((current) =>
                current.map((card) =>
                    card.id === updated.id
                    ? updated
                    : card
                )
            );
        } catch (error) {
            console.error("카드 수정 실패:", error);
            setError("수정사항을 반영하지 못했습니다.");
        }
    };

    const handleDeleteCard = async (
        cardId: string
    ) => {
        try {
            setError("");

            await deleteCard(cardId);

            setCards((current) => 
                current.filter(
                    (card) => card.id !== cardId
                )
            );
        } catch (error) {
            console.error("카드 삭제 실패:", error);
            setError("카드를 삭제하지 못했습니다.");
        }
    };

    if (!currentStore) {
        return <p>등록된 매장이 없습니다.</p>;
    }


    return (
        <section className="handover-create">
            <div className="handover-create__header">
                <h1>인수인계 작성</h1>
                <p>{currentStore.name}</p>
            </div>

            <HandoverForm 
                loading={loading}
                photos={photos}
                onPhotosChange={setPhotos}
                onSubmit={handleSubmit}
            />

            {cards.length > 0 && (
                <div className="handover-create__results">
                    <h2>AI 정리 결과</h2>

                    {cards.map((card) => (
                        <AiResultCard 
                            key={card.id}
                            card={card}
                            editable={!confirmed}
                            onSave={handleUpdateCard}
                            onDelete={handleDeleteCard}
                        />
                    ))}
                    {!confirmed ? (
                        <Button
                            type="button"
                            onClick={handleConfirm}
                            disabled={confirming}
                        >
                            {confirming
                                ?"등록 중..."
                                :"인수인계 등록하기"}
                        </Button>
                    ): (
                        <p>인수인계가 등록되었습니다.</p>
                    )}
                </div>
            )}

            {error && (
                <p className="handover-create__error">
                    {error}
                </p>
            )}
        </section>
    );
}

export default HandoverCreatePage;