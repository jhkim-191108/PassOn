import iconClipboard from '@/assets/Icon-clipboard.png';
import type { ReactNode } from 'react';

import type { HandoffItem, QuickAction } from '../types';
import { HandoffListCard } from './HandoffListCard';
import '../../../css/HandoffSection.css';

interface Props {
  title: string;
  items: HandoffItem[];
  currentUserId: string;
  onViewItem: (id: string) => void;
  onQuickAction?: (id: string, action: QuickAction) => void;
  pendingIds?: string[];
  /** 제목 오른쪽 안내 문구 */
  hint?: string;
  /** 비어 있을 때 보여줄 내용 (없으면 섹션 자체를 숨김) */
  empty?: ReactNode;
}

// "보고 필요 / 확인 필요 / 내 업무", "최근 인수인계" 목록
export const HandoffSection = ({
  title,
  items,
  currentUserId,
  onViewItem,
  onQuickAction,
  pendingIds = [],
  hint,
  empty,
}: Props) => {
  if (items.length === 0 && !empty) return null;

  return (
    <section className="handoff-section">
      <div className="handoff-section__head">
        <h2 className="handoff-section__title">{title}</h2>
        {hint && <span className="handoff-section__hint">{hint}</span>}
      </div>

      {items.length === 0 ? (
        empty
      ) : (
        <div className="handoff-section__list">
          {items.map((item) => (
            <HandoffListCard
              key={item.id}
              item={item}
              currentUserId={currentUserId}
              onClick={() => onViewItem(item.id)}
              onQuickAction={onQuickAction ? (action) => onQuickAction(item.id, action) : undefined}
              isPending={pendingIds.includes(item.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

interface EmptyProps {
  onNewHandoff: () => void;
}

// 최근 인수인계가 하나도 없을 때
export const HandoffEmpty = ({ onNewHandoff }: EmptyProps) => (
  <div className="handoff-empty">
    <div className="handoff-empty__icon" aria-hidden="true">
      <img src={iconClipboard} alt="" width={24} height={24} />
    </div>
    <p className="handoff-empty__text">인수인계가 없어요</p>
    <button type="button" className="handoff-empty__link" onClick={onNewHandoff}>
      첫 번째 인수인계 작성하기
    </button>
  </div>
);
