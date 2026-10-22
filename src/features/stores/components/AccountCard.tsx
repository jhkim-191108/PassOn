import { ROLE_BADGE } from "@/features/stores/labels";
import type { Store, User } from "@/types/api";

interface AccountCardProps {
    user: User;
    store: Store;
}

function AccountCard({ user, store }: AccountCardProps) {
    return (
        <article className="store-settings__card" style={{ order: 2 }}>
            <h2>내 계정</h2>
            <div className="store-settings__account">
                <span className="store-settings__avatar">{user.name.charAt(0)}</span>
                <div>
                    <div className="store-settings__identity">
                        <strong>{user.name}</strong>
                        <em>{ROLE_BADGE[store.myRole]}</em>
                    </div>
                    <p>{user.email}</p>
                    <p>{store.name}</p>
                </div>
            </div>
        </article>
    );
}

export default AccountCard;
