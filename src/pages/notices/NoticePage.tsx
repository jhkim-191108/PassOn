// 공지 화면. 목록과 작성 페이지를 나누고, 데이터는 useNotices가 맡는다.
import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "@/api/client";
import Button from "@/components/ui/Button";
import { useNotices } from "@/features/notices";
import {
    formatNoticeEnd,
    noticeEndsOn,
    noticeLevelLabel,
    rememberNoticeEnds,
} from "@/features/notices/noticeLevel";
import type { Notice, NoticePriority } from "@/types/api";
import "../../css/notices.css";

const PRIORITIES: NoticePriority[] = ["NORMAL", "IMPORTANT", "URGENT"];

function noticePriority(notice: Notice): NoticePriority {
    return PRIORITIES.includes(notice.priority) ? notice.priority : "NORMAL";
}

interface NoticeFormState {
    title: string;
    body: string;
    priority: NoticePriority;
    pinned: boolean;
    endsOn: string;
}

const emptyForm: NoticeFormState = {
    title: "",
    body: "",
    priority: "NORMAL",
    pinned: false,
    endsOn: "",
};

const LEVELS: { value: NoticePriority; label: string }[] = [
    { value: "NORMAL", label: "일반" },
    { value: "IMPORTANT", label: "중요" },
    { value: "URGENT", label: "긴급" },
];

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function formatNoticeDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`;
}

function NoticePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const editId = (location.state as { editId?: string } | null)?.editId;
    const { store, notices, message, pending, loading, canEdit, saveNotice } = useNotices();
    const [editing, setEditing] = useState<Notice | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState<NoticeFormState>(emptyForm);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (!editId) return;
        const notice = notices.find((item) => item.id === editId);
        if (!notice) return;
        setEditing(notice);
        setForm({
            title: notice.title,
            body: notice.body,
            priority: noticePriority(notice),
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
        setForm(emptyForm);
        setFormError("");
        setFormOpen(true);
    }

    function openEdit(notice: Notice) {
        setEditing(notice);
        setForm({
            title: notice.title,
            body: notice.body,
            priority: noticePriority(notice),
            pinned: notice.pinned,
            endsOn: "",
        });
        setFormError("");
        setFormOpen(true);
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
            <section className="notice-write">
                <header className="notice-write__header">
                    <button type="button" className="notice-write__back" onClick={() => setFormOpen(false)} aria-label="목록으로">
                        ‹
                    </button>
                    <div>
                        <h1>{editing ? "공지사항 수정" : "공지사항 작성"}</h1>
                        <p>모든 직원에게 공지됩니다</p>
                    </div>
                </header>

                <form onSubmit={submit}>
                    <div className="notice-write__card">
                        <label className="notice-write__field">
                            <span>제목 <i>*</i></span>
                            <input
                                value={form.title}
                                maxLength={120}
                                placeholder="공지 제목을 입력하세요"
                                onChange={(event) => setForm({ ...form, title: event.target.value })}
                            />
                        </label>
                        <label className="notice-write__field">
                            <span>내용 <i>*</i></span>
                            <textarea
                                value={form.body}
                                maxLength={4000}
                                placeholder="공지 내용을 입력하세요"
                                onChange={(event) => setForm({ ...form, body: event.target.value })}
                            />
                        </label>

                        <div className="notice-write__field">
                            <span>중요도</span>
                            <div className="notice-write__levels">
                                {LEVELS.map((level) => (
                                    <button
                                        key={level.value}
                                        type="button"
                                        className={form.priority === level.value ? "is-selected" : undefined}
                                        onClick={() => setForm({ ...form, priority: level.value })}
                                    >
                                        {level.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="notice-write__pin">
                            <div>
                                <strong>상단 고정</strong>
                                <p>대시보드 상단에 항상 표시돼요</p>
                            </div>
                            <button
                                type="button"
                                className={form.pinned ? "notice-write__switch is-on" : "notice-write__switch"}
                                aria-pressed={form.pinned}
                                onClick={() => setForm({ ...form, pinned: !form.pinned })}
                            >
                                <span />
                            </button>
                        </div>

                        <label className="notice-write__field">
                            <span>공지 종료일 (선택)</span>
                            <input
                                type="date"
                                value={form.endsOn}
                                onChange={(event) => setForm({ ...form, endsOn: event.target.value })}
                            />
                            <small>설정하면 해당 날짜 이후 공지가 자동으로 내려가요.</small>
                        </label>
                    </div>

                    {formError && <p className="notices__message">{formError}</p>}

                    <div className="notice-write__actions">
                        <Button type="button" variant="secondary" className="notice-write__cancel" onClick={() => setFormOpen(false)}>
                            취소
                        </Button>
                        <Button type="submit" className="notice-write__submit" disabled={pending}>
                            {pending ? "저장 중" : editing ? "수정" : "공지 등록"}
                        </Button>
                    </div>
                </form>
            </section>
        );
    }

    const pinned = notices.filter((notice) => notice.pinned);
    const others = notices.filter((notice) => !notice.pinned);

    function renderNotice(notice: Notice) {
        const level = noticePriority(notice);
        const endsOn = noticeEndsOn(notice.id);
        return (
            <li
                key={notice.id}
                className={`notices__card notices__card--${level.toLowerCase()}`}
                onClick={() => navigate(`/app/notices/${notice.id}`)}
            >
                <div className="notices__card-head">
                    <h2>{notice.title}</h2>
                    <span className={`notices__level notices__level--${level.toLowerCase()}`}>
                        <i />
                        {noticeLevelLabel(level)}
                    </span>
                </div>
                <p className="notices__body">{notice.body}</p>
                <div className="notices__meta">
                    <span className="notices__author">
                        <span className="notices__avatar">{(notice.authorName || "?").slice(0, 1)}</span>
                        {notice.authorName}
                    </span>
                    <span className="notices__date">
                        {endsOn && <em>{formatNoticeEnd(endsOn)}</em>}
                        {formatNoticeDate(notice.createdAt)}
                    </span>
                </div>
            </li>
        );
    }

    return (
        <section className="notices">
            <header className="notices__header">
                <div>
                    <h1 className="notices__title">공지사항</h1>
                    <p className="notices__subtitle">{store.name}의 공지를 확인하세요.</p>
                </div>
                {canEdit && (
                    <Button type="button" className="notices__create" onClick={openCreate}>
                        + 공지 작성
                    </Button>
                )}
            </header>

            {message && (
                <p className="notices__message" role="alert">
                    {message}
                </p>
            )}

            {notices.length === 0 ? (
                <p className="notices__empty">등록된 공지가 없습니다.</p>
            ) : (
                <div className="notices__groups">
                    {pinned.length > 0 && (
                        <section>
                            <p className="notices__pin-label">
                                <span aria-hidden="true">📌</span>
                                상단 고정
                            </p>
                            <ul className="notices__list">{pinned.map(renderNotice)}</ul>
                        </section>
                    )}
                    {others.length > 0 && (
                        <section>
                            <p className="notices__group-label">전체 공지</p>
                            <ul className="notices__list">{others.map(renderNotice)}</ul>
                        </section>
                    )}
                </div>
            )}
        </section>
    );
}

export default NoticePage;
