// 공지 한 건. 목록에서 카드를 누르면 이 화면으로 들어온다.
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useNotices } from "@/features/notices";
import { noticeLevelLabel } from "@/features/notices/noticeLevel";
import type { Notice, NoticePriority } from "@/types/api";
import "../../css/notices.css";

const PRIORITIES: NoticePriority[] = ["NORMAL", "IMPORTANT", "URGENT"];

function noticePriority(notice: Notice): NoticePriority {
    return PRIORITIES.includes(notice.priority) ? notice.priority : "NORMAL";
}

type NoticeStatus = "PENDING" | "IN_PROGRESS" | "DONE";

interface NoteMemo {
    id: string;
    text: string;
}

const STATUS_KEY = "passon.noticeStatus";
const MEMO_KEY = "passon.noticeMemos";
const TASK_KEY = "passon.noticeTasks";

function readMap<T>(key: string): Record<string, T> {
    try {
        const parsed = JSON.parse(localStorage.getItem(key) ?? "{}") as Record<string, T>;
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

function writeMap<T>(key: string, value: Record<string, T>) {
    localStorage.setItem(key, JSON.stringify(value));
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

function NoticeDetailPage() {
    const { noticeId } = useParams();
    const navigate = useNavigate();
    const { store, notices, message, loading, canEdit, removeNotice } = useNotices();
    const notice = notices.find((item) => item.id === noticeId);
    const [status, setStatus] = useState<NoticeStatus>(() => readMap<NoticeStatus>(STATUS_KEY)[noticeId ?? ""] ?? "PENDING");
    const [memos, setMemos] = useState<NoteMemo[]>(() => readMap<NoteMemo[]>(MEMO_KEY)[noticeId ?? ""] ?? []);
    const [doneTasks, setDoneTasks] = useState<string[]>(() => readMap<string[]>(TASK_KEY)[noticeId ?? ""] ?? []);
    const [memoText, setMemoText] = useState("");
    const [deleting, setDeleting] = useState(false);

    if (!store) {
        return <p className="notices__message">{loading ? "불러오는 중" : message || "공지를 불러오지 못했습니다."}</p>;
    }

    if (!notice) {
        return <p className="notices__message">{message || "공지를 찾을 수 없습니다."}</p>;
    }

    const level = noticePriority(notice);
    const tasks = taskLines(notice.body);

    function changeStatus(next: NoticeStatus) {
        setStatus(next);
        const all = readMap<NoticeStatus>(STATUS_KEY);
        if (noticeId) {
            all[noticeId] = next;
            writeMap(STATUS_KEY, all);
        }
    }

    function toggleTask(line: string) {
        const next = doneTasks.includes(line) ? doneTasks.filter((item) => item !== line) : [...doneTasks, line];
        setDoneTasks(next);
        if (!noticeId) return;
        const all = readMap<string[]>(TASK_KEY);
        all[noticeId] = next;
        writeMap(TASK_KEY, all);
    }

    function addMemo() {
        const text = memoText.trim();
        if (!text || !noticeId) return;
        const next = [...memos, { id: `${Date.now()}`, text }];
        setMemos(next);
        setMemoText("");
        const all = readMap<NoteMemo[]>(MEMO_KEY);
        all[noticeId] = next;
        writeMap(MEMO_KEY, all);
    }

    async function confirmDelete() {
        if (!notice) return;
        try {
            await removeNotice(notice.id);
            navigate("/app/notices");
        } catch {
            setDeleting(false);
        }
    }

    return (
        <section className={`notice-detail notice-detail--${level.toLowerCase()}`}>
            <button type="button" className="notice-detail__back" onClick={() => navigate("/app/notices")}>
                ‹ 목록으로
            </button>
            <div className="notice-detail__bar" />
            <h1>{notice.title}</h1>
            <div className="notice-detail__badges">
                <span className={`notices__level notices__level--${level.toLowerCase()}`}>
                    <i />
                    {noticeLevelLabel(level)}
                </span>
                <span className="notice-detail__chip">{status === "DONE" ? "처리 완료" : status === "IN_PROGRESS" ? "처리중" : "미처리"}</span>
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
                                    <input type="checkbox" checked={doneTasks.includes(line)} onChange={() => toggleTask(line)} />
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
                    <button type="button" className={status === "PENDING" ? "is-selected" : undefined} onClick={() => changeStatus("PENDING")}>
                        미처리로 되돌리기
                    </button>
                    <button type="button" className={status === "IN_PROGRESS" ? "is-selected" : undefined} onClick={() => changeStatus("IN_PROGRESS")}>
                        확인함 (처리중)
                    </button>
                    <button type="button" className={status === "DONE" ? "is-selected" : undefined} onClick={() => changeStatus("DONE")}>
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
                        onChange={(event) => setMemoText(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                addMemo();
                            }
                        }}
                    />
                    <Button type="button" className="notice-detail__add" onClick={addMemo}>
                        추가
                    </Button>
                </div>
            </article>

            {canEdit && (
                <div className="notice-detail__footer">
                    <button type="button" onClick={() => navigate("/app/notices", { state: { editId: notice.id } })}>
                        수정
                    </button>
                    <button type="button" className="is-danger" onClick={() => setDeleting(true)}>
                        삭제
                    </button>
                </div>
            )}

            <ConfirmDialog
                open={deleting}
                title="공지 삭제"
                description={`"${notice.title}" 공지를 삭제할까요?`}
                confirmText="삭제"
                variant="danger"
                onClose={() => setDeleting(false)}
                onConfirm={() => void confirmDelete()}
            />
        </section>
    );
}

export default NoticeDetailPage;
