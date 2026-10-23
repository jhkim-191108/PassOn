import Button from "@/components/ui/Button";
import { ROLE_BADGE, TYPE_LABEL } from "@/features/stores/labels";
import type { Store } from "@/types/api";

interface MyStoresProps {
    stores: Store[];
    currentId: string;
    wide: boolean;
    onCreate: () => void;
    onJoin: () => void;
    onSelect: (storeId: string) => void;
}

function MyStores({ stores, currentId, wide, onCreate, onJoin, onSelect }: MyStoresProps) {
    return (
        <article className={wide ? "store-settings__card store-settings__card--wide" : "store-settings__card"} style={{ order: wide ? 5 : 3 }}>
            <h2>내 매장</h2>
            <ul className="store-settings__stores">
                {stores.map((store) => {
                    const active = store.id === currentId;
                    return (
                        <li key={store.id} className={active ? "store-settings__store store-settings__store--current" : "store-settings__store"}>
                            <button type="button" className="store-settings__store-pick" aria-pressed={active} onClick={() => onSelect(store.id)}>
                                <span className="store-settings__mark">{store.name.charAt(0)}</span>
                                <div>
                                    <strong>{store.name}</strong>
                                    <p>
                                        {ROLE_BADGE[store.myRole]} · {TYPE_LABEL[store.type]}
                                    </p>
                                </div>
                                {active && <em>현재</em>}
                            </button>
                        </li>
                    );
                })}
            </ul>
            <div className="store-settings__store-actions">
                <Button type="button" size="sm" onClick={onCreate}>매장 만들기</Button>
                <Button type="button" variant="secondary" size="sm" onClick={onJoin}>초대코드로 합류</Button>
            </div>
        </article>
    );
}

export default MyStores;
