import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { getTrash } from "@/api/trash";
import type { Store, TrashItem } from "@/types/api";
import { restoreCard } from "@/api/cards";
import { restoreHandoff } from "@/api/handoffs";

import Loading from "@/components/ui/Loading";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

import "../../css/handovers.css";

interface AppContext {
    currentStore: Store | undefined;
}

const trashKindLabel = {
    CARD: "카드",
    HANDOFF: "인수인계",
}

function TrashPage() {
    const { currentStore } = useOutletContext<AppContext>();
    const [items, setItems] = useState<TrashItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    // 복구 
    const [restoreItem, setRestoreItem] = useState<TrashItem | null>(null);
    const [restoring, setRestoring] = useState(false);

    useEffect(() => {
        const loadTrash = async () => {
            if(!currentStore) {
                setError(
                    "매장 정보를 찾을 수 없습니다."
                );
                setLoading(false);
                return;
            }

            try{
                setLoading(true);
                setError("");

                const data = await getTrash(currentStore.id);

                setItems(data);
            } catch (error) {
                console.error(
                    "휴지통 조회 실패:",
                    error
                );

                setError(
                    "휴지통을 불러오지 못했습니다."
                );
            } finally {
                setLoading(false);
            }
        };

        loadTrash();
    }, [currentStore]);

    const handleRestore = async () => {
        if (!restoreItem) return;

        try {
            setRestoring(true);
            setError("");

            if (restoreItem.kind === "CARD") {
                await restoreCard(restoreItem.id);
            } else {
                await restoreHandoff(restoreItem.id);
            }

            setItems((prev) => 
                prev.filter(
                    (item) => !(
                        item.id === restoreItem.id &&
                        item.kind === restoreItem.kind
                    )
                )
            );

            setRestoreItem(null);
        } catch (error) {
            console.error("휴지통 복구 실패:", error);
            setError("항목을 복구하지 못했습니다.")
        } finally{
            setRestoring(false);
        }
    };

    return (
        <section className="trash-page">
            <header className="trash-page__header">
                <div>
                    <h1>휴지통</h1>
                    <p>삭제된 항목은 2주 동안 보관됩니다.</p>
                </div>
            </header>
            {loading && (
                <Loading text="휴지통을 불러오는 중입니다..."/>
            )}

            {error && (
                <ErrorState title={error} description="잠시 후 다시 시도해 주세요." />
            )}

            {!loading && !error && items.length === 0 && (
                <EmptyState 
                    title="휴지통이 비어 있습니다."
                    description="삭제된 카드 및 인수인계가 없습니다."
                />
            )}

            {!loading && !error && items.length > 0 && (
                <div className="trash-list">
                    {items.map((item)=>(
                        <article key={`${item.kind}-${item.id}`} className="trash-list__item">
                            <div className="trash-list__header">
                                <div className="trash-list__badges">
                                    <Badge
                                        variant={item.kind === "CARD" ? "primary" : "neutral"}
                                        size="sm"
                                    >
                                        {trashKindLabel[item.kind]}
                                    </Badge>
                                    {item.kept && (
                                        <Badge variant="success" size="sm">
                                            영구 보관
                                        </Badge>
                                    )}
                                </div>
                                <span className="trash-list__deleted-at">
                                    {new Date(
                                        item.deletedAt
                                    ).toLocaleString("ko-KR", {
                                        year: "numeric",
                                        month: "numeric",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>

                            <h2>{item.title}</h2>

                            <div className="trash-list__meta">
                                <span>
                                    삭제한 사람: {" "}
                                    {item.deletedByName}
                                </span>
                                {!item.kept && (
                                    <span>
                                        복구 가능 기한: {" "}
                                        {new Date(
                                            item.restoreUntil
                                        ).toLocaleString("ko-KR")}
                                    </span>
                                )}
                            </div>
                            {!item.kept && (
                                <div className="trash-list__actions">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setRestoreItem(item)}
                                    >
                                        복구
                                    </Button>
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            )}
            <ConfirmDialog 
                open={restoreItem !== null}
                title="항목 복구"
                description={restoreItem ? `"${restoreItem.title}" 항목을 복구하시겠습니까?` : ""}
                confirmText={restoring ? "복구 중..." : "복구"}
                cancelText="취소"
                onConfirm={handleRestore}
                onClose={() => {
                    if(!restoring) {
                        setRestoreItem(null);
                    }
                }}
            />
        </section>
    );
}


export default TrashPage;