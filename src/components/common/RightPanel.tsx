import { formatRelativeTime } from "@/features/dashboard/utils/time";
import type { ShiftResponse } from "@/features/schedule/types";
import type { Card, Notification, NotificationType } from "@/types/api";
import "../../css/rightPanel.css";

interface RightPanelProps {
    userName: string;
    notifications: Notification[];
    cards: Card[];
    shifts: ShiftResponse[];
}

const TYPE_LABEL = {
    STOCK: "재고",
    TASK: "업무",
    GUEST: "손님",
    NOTICE: "공지",
} as const;

const SLOT_LABEL = {
    MORNING: "오전",
    AFTERNOON: "오후",
    CLOSE: "마감",
} as const;

const NOTI_LABEL: Record<NotificationType, string> = {
    URGENT: "긴급 인수인계가 등록됐어요",
    ASSIGNMENT: "업무가 배정됐어요",
    MEMO: "내 업무에 메모가 추가됐어요",
    COMPLETED: "업무가 완료됐어요",
};

const TIPS = [
    "인수인계를 작성하면 AI가 자동으로 분류해요",
    "긴급 항목은 담당자에게 즉시 알림이 가요",
    "처리 완료 후 반드시 상태를 변경해주세요",
    "메모로 추가 정보를 남길 수 있어요",
];

function chipOf(card: Card) {
    if (card.urgency === "NOW") return { label: "긴급", tone: "urgent" };
    if (card.type === "STOCK") return { label: TYPE_LABEL.STOCK, tone: "stock" };
    if (card.type === "NOTICE") return { label: TYPE_LABEL.NOTICE, tone: "notice" };
    return { label: TYPE_LABEL[card.type], tone: "task" };
}

function RightPanel({ userName, notifications, cards, shifts }: RightPanelProps) {
    const open = cards.filter((card) => card.progress !== "DONE");
    const urgent = open.filter((card) => card.urgency === "NOW");
    const mine = open.filter((card) => card.assigneeName === userName);
    const review = open.filter((card) => card.needsReview);
    const unread = notifications.filter((notification) => !notification.read);
    const slots = (["MORNING", "AFTERNOON", "CLOSE"] as const).map((slot) => ({
        slot,
        names: shifts.filter((shift) => shift.slot === slot).map((shift) => shift.memberName),
    }));

    return (
        <aside className="right-panel">
            <section className="right-panel__block">
                <h2>
                    <span className="right-panel__mark">🔥</span>
                    주요 인수인계
                </h2>
                {open.length === 0 ? (
                    <p className="right-panel__empty">아직 열린 인수인계가 없습니다.</p>
                ) : (
                    <ol className="right-panel__handoffs">
                        {open.slice(0, 4).map((card, index) => {
                            const chip = chipOf(card);
                            return (
                                <li key={card.id}>
                                    <span className={`right-panel__index right-panel__index--${chip.tone}`}>{index + 1}</span>
                                    <div>
                                        <strong>{card.title}</strong>
                                        <p>
                                            <em className={`right-panel__chip right-panel__chip--${chip.tone}`}>{chip.label}</em>
                                            <span>{formatRelativeTime(card.createdAt)}</span>
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                )}
            </section>

            <section className="right-panel__block">
                <h2>
                    <span className="right-panel__mark right-panel__mark--green">●</span>
                    오늘의 현황
                </h2>
                <div className="right-panel__stats">
                    <div className="right-panel__stat right-panel__stat--pending">
                        <strong>{open.length}개</strong>
                        <span>미처리</span>
                    </div>
                    <div className="right-panel__stat right-panel__stat--urgent">
                        <strong>{urgent.length}개</strong>
                        <span>긴급</span>
                    </div>
                    <div className="right-panel__stat right-panel__stat--mine">
                        <strong>{mine.length}개</strong>
                        <span>내 담당</span>
                    </div>
                    <div className="right-panel__stat right-panel__stat--review">
                        <strong>{review.length}개</strong>
                        <span>확인 필요</span>
                    </div>
                </div>
            </section>

            <section className="right-panel__shift">
                <h2>
                    <span className="right-panel__mark right-panel__mark--green">●</span>
                    오늘 근무
                </h2>
                <ul>
                    {slots.map((row) => (
                        <li key={row.slot}>
                            <span className={`right-panel__slot right-panel__slot--${row.slot.toLowerCase()}`}>{SLOT_LABEL[row.slot]}</span>
                            <span>{row.names.length > 0 ? row.names.join(", ") : "배정 없음"}</span>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="right-panel__block">
                <h2>
                    읽지 않은 알림
                    <span className="right-panel__count">{unread.length}</span>
                </h2>
                {unread.length === 0 ? (
                    <p className="right-panel__empty">읽지 않은 알림이 없습니다.</p>
                ) : (
                    <ul className="right-panel__notices">
                        {unread.slice(0, 3).map((notification) => (
                            <li key={notification.id}>
                                <i className={`right-panel__dot right-panel__dot--${notification.type.toLowerCase()}`} />
                                <div>
                                    <strong>{NOTI_LABEL[notification.type] ?? notification.title}</strong>
                                    <p>{notification.body}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="right-panel__block">
                <h2>이용 안내</h2>
                <ul className="right-panel__tips">
                    {TIPS.map((tip) => (
                        <li key={tip}>{tip}</li>
                    ))}
                </ul>
            </section>
        </aside>
    );
}

export default RightPanel;
