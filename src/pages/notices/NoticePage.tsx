// 공지 목록과 작성. 화면 조각은 features/notices/components가 맡고, 여기서는 저장만 연결한다.
import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "@/api/client";
import NoticeHeader from "@/features/notices/components/NoticeHeader";
import NoticeList from "@/features/notices/components/NoticeList";
import NoticeWriteForm, { emptyNoticeForm, type NoticeFormState } from "@/features/notices/components/NoticeWriteForm";
import { useNotices } from "@/features/notices";
import { noticePriority, rememberNoticeEnds } from "@/features/notices/noticeLevel";
import type { Notice } from "@/types/api";
import "../../css/notices.css";

function NoticePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const editId = (location.state as { editId?: string } | null)?.editId;
    const { store, notices, message, pending, loading, canEdit, saveNotice } = useNotices();
    const [editing, setEditing] = useState<Notice | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState<NoticeFormState>(emptyNoticeForm);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (!editId) return;
        const notice = notices.find((item) => item.id === editId);
        if (!notice) return;
        setEditing(notice);
        setForm({
            title: notice.title,
            body: notice.body,
            priority: noticePriority(notice.priority),
            pinned: notice.pinned,
            endsOn: "",
        });
        setFormError("");
        setFormOpen(true);
        navigate("/app/notices", { replace: true, state: null });
    }, [editId, notices, navigate]);

    if (!store) {
        return <p className="notices__message">{loading ? "불러오는 중" : message || "공지를 불러오지 못했습니다."}</p>;
    }

    function openCreate() {
        setEditing(null);
        setForm(emptyNoticeForm);
        setFormError("");
        setFormOpen(true);
    }

    function closeForm() {
        setFormOpen(false);
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const title = form.title.trim();
        const body = form.body.trim();
        if (!title) {
            setFormError("공지 제목을 입력해 주세요.");
            return;
        }
        if (!body) {
            setFormError("공지 내용을 입력해 주세요.");
            return;
        }
        try {
            const known = new Set(notices.map((notice) => notice.id));
            const next = await saveNotice(
                { title, body, pinned: form.pinned, priority: form.priority },
                editing?.id,
            );
            const savedId = editing?.id ?? next?.find((notice) => !known.has(notice.id))?.id;
            if (savedId) rememberNoticeEnds(savedId, form.endsOn);
            setFormOpen(false);
        } catch (error) {
            setFormError(error instanceof ApiError ? error.message : "공지를 저장하지 못했습니다.");
        }
    }

    if (formOpen) {
        return (
            <NoticeWriteForm
                editing={editing !== null}
                form={form}
                formError={formError}
                pending={pending}
                onChange={setForm}
                onSubmit={(event) => void submit(event)}
                onClose={closeForm}
            />
        );
    }

    return (
        <section className="notices">
            <NoticeHeader storeName={store.name} canEdit={canEdit} onCreate={openCreate} />
            {message && (
                <p className="notices__message" role="alert">
                    {message}
                </p>
            )}
            <NoticeList notices={notices} onOpen={(noticeId) => navigate(`/app/notices/${noticeId}`)} />
        </section>
    );
}

export default NoticePage;
