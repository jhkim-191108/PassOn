import type { FormEvent } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useCopyToClipboard } from "@/features/auth/hooks/useCopyToClipboard";
import type { Store } from "@/types/api";

interface StoreInfoCardProps {
    store: Store;
    storeName: string;
    onStoreName: (name: string) => void;
    onSave: (event?: FormEvent<HTMLFormElement>) => void;
}

function inviteLinkOf(store: Store) {
    if (!store.inviteCode) return "";
    return `${window.location.origin}${store.invitePath || `/join/${store.inviteCode}`}`;
}

function StoreInfoCard({ store, storeName, onStoreName, onSave }: StoreInfoCardProps) {
    const { copiedKey, copy } = useCopyToClipboard<"code" | "link">();
    const link = inviteLinkOf(store);

    return (
        <article className="store-settings__card" style={{ order: 1 }}>
            <h2>매장 정보</h2>
            <form onSubmit={onSave}>
                <Input
                    label="매장 이름"
                    value={storeName}
                    maxLength={40}
                    onChange={(event) => onStoreName(event.target.value)}
                    onBlur={() => void onSave()}
                />
            </form>
            {store.inviteCode && (
                <>
                    <div className="store-settings__field">
                        <span>초대코드</span>
                        <div className="store-settings__code-row">
                            <strong className="store-settings__code">{store.inviteCode}</strong>
                            <Button type="button" variant="secondary" size="sm" className="store-settings__copy" onClick={() => void copy("code", store.inviteCode ?? "")}>
                                {copiedKey === "code" ? "복사됨" : "복사"}
                            </Button>
                        </div>
                        <p className="store-settings__hint">직원에게 공유해 매장에 합류시키세요.</p>
                    </div>
                    <div className="store-settings__field">
                        <span>초대 링크</span>
                        <div className="store-settings__link-row">
                            <input value={link} readOnly />
                            <Button type="button" variant="secondary" size="sm" className="store-settings__copy" onClick={() => void copy("link", link)}>
                                {copiedKey === "link" ? "복사됨" : "복사"}
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </article>
    );
}

export default StoreInfoCard;
