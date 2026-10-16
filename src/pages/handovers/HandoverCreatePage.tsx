import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { Store } from "@/types/api";
import HandoverForm from "@/components/handovers/HandoverForm";
import {
    createHandoff,
    analyzeHandoff,
} from "../../api/handoffs";


interface AppContext {
    currentStore: Store | undefined;
}

function HandoverCreatePage() {
    const { currentStore } =
        useOutletContext<AppContext>();

        const [loading, setLoading] = useState(false);
        const [error, setError] = useState("");

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

                console.log("원문 저장 완료:", handoff);

                // 2. AI가 분석
                await analyzeHandoff(handoff.id);
                console.log("AI 분석 완료");
            } catch (error) {
                console.error(error);
                setError("인수인계 분석에 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };


    if (!currentStore) {
        return <p>등록된 매장이 없습니다.</p>;
    }


    return (
        <section className="handover-create">
            <div>
                <h1>인수인계 작성</h1>
                <p>{currentStore.name}</p>
            </div>

            <HandoverForm 
                loading={loading}
                onSubmit={handleSubmit}
            />

            {error && (
                <p className="handover-create__error">
                    {error}
                </p>
            )}
        </section>
    );
}

export default HandoverCreatePage;