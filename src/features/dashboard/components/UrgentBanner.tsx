import iconBell from '@/assets/Icon-bell.png';
import { useState } from 'react';

import { getCurrentShiftLabel } from '../utils/time';
import '../../../css/UrgentBanner.css';

interface BannerItem {
  id: string;
  title: string;
}

interface Props {
  items: BannerItem[];
  onViewItem: (id: string) => void;
}

const MAX_VISIBLE = 4;

// 상단 내비 아래 긴급 항목 띠 배너 (Figma: 1280px 이상에서만 표시)
// 닫은 뒤 새 긴급 항목이 생기면 다시 보인다
export const UrgentBanner = ({ items, onViewItem }: Props) => {
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const key = items.map((item) => item.id).join(',');
  if (items.length === 0 || dismissedKey === key) return null;

  return (
    <div className="urgent-banner" role="status">
      <div className="urgent-banner__label">
        <img src={iconBell} alt="" width={14} height={14} />
        {getCurrentShiftLabel()} 긴급
      </div>

      <div className="urgent-banner__items">
        {items.slice(0, MAX_VISIBLE).map((item) => (
          <button key={item.id} type="button" className="urgent-banner__item" onClick={() => onViewItem(item.id)}>
            {item.title}
          </button>
        ))}
        {items.length > MAX_VISIBLE && (
          <span className="urgent-banner__more">외 {items.length - MAX_VISIBLE}건</span>
        )}
      </div>

      <button type="button" className="urgent-banner__close" onClick={() => setDismissedKey(key)} aria-label="긴급 배너 닫기">
        ×
      </button>
    </div>
  );
};
