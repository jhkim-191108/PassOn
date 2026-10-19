// 공지 상세. 화면은 NoticeDetailView가 그리고, 상태·메모·삭제는 이 페이지가 저장한다.
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import NoticeDetailView, { type NoticeMemo, type NoticeStatus } from "@/features/notices/components/NoticeDetailView";
import { useNotices } from "@/features/notices";
import "../../css/notices.css";

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

function NoticeDetailPage() {
    const { noticeId } = useParams();
    const navigate = useNavigate();
    const { store, notices, message, loading, canEdit, removeNotice } = useNotices();
    const notice = notices.find((item) => item.id === noticeId);
    const [status, setStatus] = useState<NoticeStatus>(() => readMap<NoticeStatus>(STATUS_KEY)[noticeId ?? ""] ?? "PENDING");
    const [memos, setMemos] = useState<NoticeMemo[]>(() => readMap<NoticeMemo[]>(MEMO_KEY)[noticeId ?? ""] ?? []);
    const [doneTasks, setDoneTasks] = useState<string[]>(() => readMap<string[]>(TASK_KEY)[noticeId ?? ""] ?? []);
    const [memoText, setMemoText] = useState("");
    const [deleting, setDeleting] = useState(false);

    if (!store) {
        return <p className="notices__message">{loading ? "불러오는 중" : message || "공지를 불러오지 못했습니다."}</p>;
    }

    if (!notice) {
        return <p className="notices__message">{message || "공지를 찾을 수 없습니다."}</p>;
    }

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
        const all = readMap<NoticeMemo[]>(MEMO_KEY);
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
        <>
            <NoticeDetailView
                notice={notice}
                status={status}
                memos={memos}
                doneTasks={doneTasks}
                memoText={memoText}
                canEdit={canEdit}
                onBack={() => navigate("/app/notices")}
                onStatus={changeStatus}
                onToggleTask={toggleTask}
                onMemoText={setMemoText}
                onAddMemo={addMemo}
                onEdit={() => navigate("/app/notices", { state: { editId: notice.id } })}
                onDelete={() => setDeleting(true)}
            />
            <ConfirmDialog
                open={deleting}
                title="공지 삭제"
                description={`"${notice.title}" 공지를 삭제할까요?`}
                confirmText="삭제"
                variant="danger"
                onClose={() => setDeleting(false)}
                onConfirm={() => void confirmDelete()}
            />
        </>
    );
}

export default NoticeDetailPage;
