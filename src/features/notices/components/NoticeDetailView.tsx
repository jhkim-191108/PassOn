import Button from "@/components/ui/Button";
import NoticeLevel from "@/features/notices/components/NoticeLevel";
import { noticePriority } from "@/features/notices/noticeLevel";
import type { Notice } from "@/types/api";

export type NoticeStatus = "PENDING" | "IN_PROGRESS" | "DONE";

export interface NoticeMemo {
    id: string;
    text: string;
}

interface NoticeDetailViewProps {
    notice: Notice;
    status: NoticeStatus;
    memos: NoticeMemo[];
    doneTasks: string[];
    memoText: string;
    canEdit: boolean;
    onBack: () => void;
    onStatus: (status: NoticeStatus) => void;
    onToggleTask: (line: string) => void;
    onMemoText: (value: string) => void;
    onAddMemo: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

function formatDetailWhen(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const hour = date.getHours();
    const ampm = hour < 12 ? "오전" : "오후";
    const h = hour % 12 || 12;
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${date.getMonth() + 1}월 ${date.getDate()}일 ${ampm} ${h}:${minute}`;
}

function taskLines(body: string) {
    return body
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.includes("—") || line.includes(" - "));
}

const STATUS_LABEL = {
    PENDING: "미처리",
    IN_PROGRESS: "처리중",
    DONE: "처리 완료",
} as const;

function NoticeDetailView({
    notice,
    status,
    memos,
    doneTasks,
    memoText,
    canEdit,
    onBack,
    onStatus,
    onToggleTask,
    onMemoText,
    onAddMemo,
    onEdit,
    onDelete,
}: NoticeDetailViewProps) {
    const level = noticePriority(notice.priority);
    const tasks = taskLines(notice.body);

    return (
        <section className={`notice-detail notice-detail--${level.toLowerCase()}`}>
            <button type="button" className="notice-detail__back" onClick={onBack}>
                ‹ 목록으로
            </button>
            <div className="notice-detail__bar" />
            <h1>{notice.title}</h1>
            <div className="notice-detail__badges">
                <NoticeLevel priority={level} />
                <span className="notice-detail__chip">{STATUS_LABEL[status]}</span>
                <span className="notice-detail__chip">공지</span>
            </div>
            <p className="notice-detail__meta">
                {notice.authorName} 작성 · {formatDetailWhen(notice.createdAt)}
            </p>

            <article className="notice-detail__panel">{notice.body}</article>

            {tasks.length > 0 && (
                <article className="notice-detail__panel">
                    <h2>업무 항목</h2>
                    <ul>
                        {tasks.map((line) => (
                            <li key={line}>
                                <label>
                                    <input type="checkbox" checked={doneTasks.includes(line)} onChange={() => onToggleTask(line)} />
                                    {line}
                                </label>
                            </li>
                        ))}
                    </ul>
                </article>
            )}

            <article className="notice-detail__panel">
                <h2>상태 관리</h2>
                <div className="notice-detail__status">
                    <button type="button" className={status === "PENDING" ? "is-selected" : undefined} onClick={() => onStatus("PENDING")}>
                        미처리로 되돌리기
                    </button>
                    <button type="button" className={status === "IN_PROGRESS" ? "is-selected" : undefined} onClick={() => onStatus("IN_PROGRESS")}>
                        확인함 (처리중)
                    </button>
                    <button type="button" className={status === "DONE" ? "is-selected" : undefined} onClick={() => onStatus("DONE")}>
                        처리 완료
                    </button>
                </div>
            </article>

            <article className="notice-detail__panel">
                <h2>진행 상황 메모</h2>
                {memos.length === 0 ? (
                    <p className="notice-detail__hint">아직 메모가 없어요. 진행 상황을 남겨보세요.</p>
                ) : (
                    <ul className="notice-detail__memos">
                        {memos.map((memo) => (
                            <li key={memo.id}>{memo.text}</li>
                        ))}
                    </ul>
                )}
                <div className="notice-detail__memo-row">
                    <input
                        value={memoText}
                        placeholder="진행 상황을 메모하세요..."
                        onChange={(event) => onMemoText(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                onAddMemo();
                            }
                        }}
                    />
                    <Button type="button" className="notice-detail__add" onClick={onAddMemo}>
                        추가
                    </Button>
                </div>
            </article>

            {canEdit && (
                <div className="notice-detail__footer">
                    <button type="button" onClick={onEdit}>
                        수정
                    </button>
                    <button type="button" className="is-danger" onClick={onDelete}>
                        삭제
                    </button>
                </div>
            )}
        </section>
    );
}

export default NoticeDetailView;
