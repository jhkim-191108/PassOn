import { useEffect, useId, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

interface InviteModalProps {
    open: boolean;
    storeName: string;
    inviteCode: string;
    inviteLink: string;
    onClose: () => void;
}

// 직원 초대 창. 초대코드와 링크를 복사하고, 이메일은 메일 앱으로 연다.
function InviteModal({ open, storeName, inviteCode, inviteLink, onClose }: InviteModalProps) {
    const titleId = useId();
    const emailId = useId();
    const [email, setEmail] = useState("");
    const [copied, setCopied] = useState<"code" | "link" | null>(null);
    const [notice, setNotice] = useState("");

    useEffect(() => {
        if (!open) return;

        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") onClose();
        }

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    useEffect(() => {
        if (!copied) return;
        const timer = window.setTimeout(() => setCopied(null), 1500);
        return () => window.clearTimeout(timer);
    }, [copied]);

    if (!open) return null;

    // 클립보드 API가 막히면 선택 복사로 한 번 더 시도한다.
    async function copy(kind: "code" | "link", text: string) {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            const area = document.createElement("textarea");
            area.value = text;
            area.setAttribute("readonly", "");
            area.style.position = "fixed";
            area.style.left = "-9999px";
            document.body.appendChild(area);
            area.select();
            const ok = document.execCommand("copy");
            area.remove();
            if (!ok) {
                setNotice("복사하지 못했습니다.");
                return;
            }
        }
        setCopied(kind);
        setNotice("");
    }

    // 서버에 초대 메일 API가 없어서, 메일 앱에 코드와 링크를 넣어 연다.
    function sendEmail(event: FormEvent) {
        event.preventDefault();
        const address = email.trim();
        if (!address.includes("@")) {
            setNotice("이메일 주소를 입력하세요.");
            return;
        }
        const subject = encodeURIComponent(`${storeName} 직원 초대`);
        const body = encodeURIComponent(`초대코드: ${inviteCode}\n초대 링크: ${inviteLink}`);
        window.location.href = `mailto:${address}?subject=${subject}&body=${body}`;
    }

    return createPortal(
        <div className="invite-modal__backdrop" onMouseDown={onClose}>
            <div
                className="invite-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="invite-modal__header">
                    <h2 id={titleId}>직원 초대</h2>
                    <button type="button" className="invite-modal__close" onClick={onClose} aria-label="닫기">
                        ×
                    </button>
                </div>

                <div className="invite-modal__field">
                    <span className="invite-modal__label">초대코드</span>
                    <div className="invite-modal__code-row">
                        <strong className="invite-modal__code">{inviteCode}</strong>
                        <button type="button" className="invite-modal__copy" onClick={() => copy("code", inviteCode)}>
                            {copied === "code" ? "복사됨" : "복사"}
                        </button>
                    </div>
                </div>

                <div className="invite-modal__field">
                    <span className="invite-modal__label">초대 링크</span>
                    <div className="invite-modal__link-row">
                        <input className="invite-modal__link" value={inviteLink} readOnly aria-label="초대 링크" />
                        <button type="button" className="invite-modal__copy" onClick={() => copy("link", inviteLink)}>
                            {copied === "link" ? "복사됨" : "복사"}
                        </button>
                    </div>
                </div>

                <form className="invite-modal__field" onSubmit={sendEmail}>
                    <label className="invite-modal__label" htmlFor={emailId}>이메일로 초대</label>
                    <div className="invite-modal__email-row">
                        <input
                            id={emailId}
                            className="invite-modal__email"
                            type="email"
                            value={email}
                            placeholder="이메일 주소 입력"
                            onChange={(event) => {
                                setEmail(event.target.value);
                                setNotice("");
                            }}
                        />
                        <button type="submit" className="invite-modal__send">전송</button>
                    </div>
                </form>

                {notice && <p className="invite-modal__notice">{notice}</p>}
            </div>
        </div>,
        document.body,
    );
}

export default InviteModal;
