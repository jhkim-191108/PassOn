// 공지 목록과 작성. 저장 액션은 NoticeWriteForm의 useActionState가 맡는다.
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ErrorState from "@/components/ui/ErrorState";
import Loading from "@/components/ui/Loading";
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
    const { store, notices, message, loading, canEdit, saveNotice } = useNotices();
    const [editing, setEditing] = useState<Notice | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState<NoticeFormState>(emptyNoticeForm);

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
        setFormOpen(true);
        navigate("/app/notices", { replace: true, state: null });
    }, [editId, notices, navigate]);

    if (loading) return <Loading text="공지를 불러오는 중입니다..." />;
    if (!store) {
        return <ErrorState title="공지를 불러오지 못했습니다." description={message || "잠시 후 다시 시도해 주세요."} />;
    }

    function openCreate() {
        setEditing(null);
        setForm(emptyNoticeForm);
        setFormOpen(true);
    }

    function closeForm() {
        setFormOpen(false);
    }

    if (formOpen) {
        return (
            <NoticeWriteForm
                key={editing?.id ?? "new"}
                editing={editing !== null}
                noticeId={editing?.id ?? ""}
                initial={form}
                notices={notices}
                onSave={saveNotice}
                onSaved={(savedId, endsOn) => {
                    if (savedId) rememberNoticeEnds(savedId, endsOn);
                    setFormOpen(false);
                }}
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
