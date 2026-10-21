import { useEffect, useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

interface InviteModalProps {
    open: boolean;
    storeName: string;
    inviteCode: string;
    inviteLink: string;
    onClose: () => void;
}

// 직원 초대 창. 초대코드와 링크를 복사하고, 이메일은 메일 앱으로 연다.
function InviteModal({ open, storeName, inviteCode, inviteLink, onClose }: InviteModalProps) {
    const [email, setEmail] = useState("");
    const [copied, setCopied] = useState<"code" | "link" | null>(null);
    const [notice, setNotice] = useState("");

    useEffect(() => {
        if (!copied) return;
        const timer = window.setTimeout(() => setCopied(null), 1500);
        return () => window.clearTimeout(timer);
    }, [copied]);

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

    return (
        <Modal open={open} title="직원 초대" onClose={onClose}>
            <div className="invite-modal__field">
                <span className="invite-modal__label">초대코드</span>
                <div className="invite-modal__code-row">
                    <strong className="invite-modal__code">{inviteCode}</strong>
                    <Button type="button" variant="secondary" size="sm" className="invite-modal__copy" onClick={() => void copy("code", inviteCode)}>
                        {copied === "code" ? "복사됨" : "복사"}
                    </Button>
                </div>
            </div>

            <div className="invite-modal__field">
                <span className="invite-modal__label">초대 링크</span>
                <div className="invite-modal__link-row">
                    <Input className="invite-modal__link" value={inviteLink} readOnly aria-label="초대 링크" />
                    <Button type="button" variant="secondary" size="sm" className="invite-modal__copy" onClick={() => void copy("link", inviteLink)}>
                        {copied === "link" ? "복사됨" : "복사"}
                    </Button>
                </div>
            </div>

            <form className="invite-modal__field" onSubmit={sendEmail}>
                <div className="invite-modal__email-row">
                    <Input
                        label="이메일로 초대"
                        className="invite-modal__email"
                        type="email"
                        value={email}
                        placeholder="이메일 주소 입력"
                        onChange={(event) => {
                            setEmail(event.target.value);
                            setNotice("");
                        }}
                    />
                    <Button type="submit" className="invite-modal__send">전송</Button>
                </div>
            </form>

            {notice && <p className="invite-modal__notice">{notice}</p>}
        </Modal>
    );
}

export default InviteModal;
