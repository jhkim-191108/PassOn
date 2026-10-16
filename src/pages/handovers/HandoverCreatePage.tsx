import { useOutletContext } from "react-router-dom";
import type { Store } from "@/types/api";

interface AppContext {
    currentStore: Store | undefined;
}

function HandoverCreatePage() {
    const { currentStore } =
        useOutletContext<AppContext>();


    if (!currentStore) {
        return <p>등록된 매장이 없습니다.</p>;
    }


    return (
        <section>
            <h1>인수인계 작성</h1>
            <p>{currentStore.name}</p>
        </section>
    );
}

export default HandoverCreatePage;