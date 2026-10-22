import type { Store } from '../types';
import { ROLE_LABEL } from '../utils/profile';
import '../../../css/StoreMembershipList.css';

interface Props {
  stores: Store[];
  currentStoreId: string;
}

// 소속 매장 목록
// TODO: 매장 전환 기능(AuthContext의 현재 매장)이 생기면 다른 매장을 눌러서 전환
export const StoreMembershipList = ({ stores, currentStoreId }: Props) => (
  <section className="store-memberships" aria-labelledby="store-memberships-title">
    <h2 id="store-memberships-title" className="store-memberships__title">
      소속 매장
    </h2>
    <ul className="store-memberships__list">
      {stores.map((store) => {
        const isCurrent = store.id === currentStoreId;
        return (
          <li key={store.id} className={`store-memberships__item${isCurrent ? ' store-memberships__item--current' : ''}`}>
            <span className="store-memberships__icon" aria-hidden="true">
              {store.name.slice(0, 1)}
            </span>
            <span className="store-memberships__info">
              <strong className="store-memberships__name">{store.name}</strong>
              <span className="store-memberships__role">{ROLE_LABEL[store.myRole]}</span>
            </span>
            {isCurrent && <span className="store-memberships__current">현재</span>}
          </li>
        );
      })}
    </ul>
  </section>
);
