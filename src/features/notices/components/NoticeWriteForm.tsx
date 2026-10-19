import type { FormEvent } from "react";
import Button from "@/components/ui/Button";
import type { NoticePriority } from "@/types/api";

export interface NoticeFormState {
    title: string;
    body: string;
    priority: NoticePriority;
    pinned: boolean;
    endsOn: string;
}

export const emptyNoticeForm: NoticeFormState = {
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

interface NoticeWriteFormProps {
    editing: boolean;
    form: NoticeFormState;
    formError: string;
    pending: boolean;
    onChange: (form: NoticeFormState) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onClose: () => void;
}

function NoticeWriteForm({ editing, form, formError, pending, onChange, onSubmit, onClose }: NoticeWriteFormProps) {
    return (
        <section className="notice-write">
            <header className="notice-write__header">
                <button type="button" className="notice-write__back" onClick={onClose} aria-label="목록으로">
                    ‹
                </button>
                <div>
                    <h1>{editing ? "공지사항 수정" : "공지사항 작성"}</h1>
                    <p>모든 직원에게 공지됩니다</p>
                </div>
            </header>

            <form onSubmit={onSubmit}>
                <div className="notice-write__card">
                    <label className="notice-write__field">
                        <span>제목 <i>*</i></span>
                        <input
                            value={form.title}
                            maxLength={120}
                            placeholder="공지 제목을 입력하세요"
                            onChange={(event) => onChange({ ...form, title: event.target.value })}
                        />
                    </label>
                    <label className="notice-write__field">
                        <span>내용 <i>*</i></span>
                        <textarea
                            value={form.body}
                            maxLength={4000}
                            placeholder="공지 내용을 입력하세요"
                            onChange={(event) => onChange({ ...form, body: event.target.value })}
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
                                    onClick={() => onChange({ ...form, priority: level.value })}
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
                            onClick={() => onChange({ ...form, pinned: !form.pinned })}
                        >
                            <span />
                        </button>
                    </div>

                    <label className="notice-write__field">
                        <span>공지 종료일 (선택)</span>
                        <input
                            type="date"
                            value={form.endsOn}
                            onChange={(event) => onChange({ ...form, endsOn: event.target.value })}
                        />
                        <small>설정하면 해당 날짜 이후 공지가 자동으로 내려가요.</small>
                    </label>
                </div>

                {formError && <p className="notices__message">{formError}</p>}

                <div className="notice-write__actions">
                    <Button type="button" variant="secondary" className="notice-write__cancel" onClick={onClose}>
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

export default NoticeWriteForm;
