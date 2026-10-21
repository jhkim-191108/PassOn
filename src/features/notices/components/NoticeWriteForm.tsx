import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ApiError } from "@/api/client";
import type { NoticeInput } from "@/api/notices";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import type { Notice, NoticePriority } from "@/types/api";

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

function readPriority(value: FormDataEntryValue | null): NoticePriority {
    if (value === "IMPORTANT" || value === "URGENT" || value === "NORMAL") return value;
    return "NORMAL";
}

interface NoticeWriteFormProps {
    editing: boolean;
    noticeId: string;
    initial: NoticeFormState;
    notices: Notice[];
    onSave: (input: NoticeInput, noticeId?: string) => Promise<Notice[] | undefined>;
    onSaved: (savedId: string | undefined, endsOn: string) => void;
    onClose: () => void;
}

function NoticeSubmitButton({ editing }: { editing: boolean }) {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" className="notice-write__submit" disabled={pending}>
            {pending ? "저장 중" : editing ? "수정" : "공지 등록"}
        </Button>
    );
}

function NoticeWriteForm({ editing, noticeId, initial, notices, onSave, onSaved, onClose }: NoticeWriteFormProps) {
    const [priority, setPriority] = useState(initial.priority);
    const [pinned, setPinned] = useState(initial.pinned);
    const [formError, formAction] = useActionState(async (_prev: string, formData: FormData) => {
        const title = String(formData.get("title") ?? "").trim();
        const body = String(formData.get("body") ?? "").trim();
        const endsOn = String(formData.get("endsOn") ?? "");
        const id = String(formData.get("noticeId") ?? "");
        if (!title) return "공지 제목을 입력해 주세요.";
        if (!body) return "공지 내용을 입력해 주세요.";

        try {
            const known = new Set(notices.map((notice) => notice.id));
            const next = await onSave(
                {
                    title,
                    body,
                    pinned: String(formData.get("pinned") ?? "") === "true",
                    priority: readPriority(formData.get("priority")),
                },
                id || undefined,
            );
            const savedId = id || next?.find((notice) => !known.has(notice.id))?.id;
            onSaved(savedId, endsOn);
            return "";
        } catch (error) {
            return error instanceof ApiError ? error.message : "공지를 저장하지 못했습니다.";
        }
    }, "");

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

            <form action={formAction}>
                <input type="hidden" name="noticeId" value={noticeId} />
                <input type="hidden" name="priority" value={priority} />
                <input type="hidden" name="pinned" value={pinned ? "true" : "false"} />
                <div className="notice-write__card">
                    <Input
                        name="title"
                        label="제목 *"
                        defaultValue={initial.title}
                        maxLength={120}
                        placeholder="공지 제목을 입력하세요"
                    />
                    <Textarea
                        name="body"
                        label="내용 *"
                        defaultValue={initial.body}
                        maxLength={4000}
                        placeholder="공지 내용을 입력하세요"
                    />

                    <div className="notice-write__field">
                        <span>중요도</span>
                        <div className="notice-write__levels">
                            {LEVELS.map((level) => (
                                <Button
                                    key={level.value}
                                    type="button"
                                    variant="secondary"
                                    className={priority === level.value ? "is-selected" : undefined}
                                    onClick={() => setPriority(level.value)}
                                >
                                    {level.label}
                                </Button>
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
                            className={pinned ? "notice-write__switch is-on" : "notice-write__switch"}
                            aria-pressed={pinned}
                            onClick={() => setPinned((current) => !current)}
                        >
                            <span />
                        </button>
                    </div>

                    <Input
                        name="endsOn"
                        type="date"
                        label="공지 종료일 (선택)"
                        defaultValue={initial.endsOn}
                        hint="설정하면 해당 날짜 이후 공지가 자동으로 내려가요."
                    />
                </div>

                {formError && <p className="notices__message">{formError}</p>}

                <div className="notice-write__actions">
                    <Button type="button" variant="secondary" className="notice-write__cancel" onClick={onClose}>
                        취소
                    </Button>
                    <NoticeSubmitButton editing={editing} />
                </div>
            </form>
        </section>
    );
}

export default NoticeWriteForm;
