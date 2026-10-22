import { useState } from 'react';

import type { HandoffItem } from '../types';
import { getCurrentShiftLabel } from '../utils/time';
import '../../../css/UrgentBanner.css';

interface Props {
  items: HandoffItem[];
  onViewItem: (id: string) => void;
}

const MAX_VISIBLE = 4;

// 현재 근무 시간대의 긴급 항목 띠 배너 (Figma: 1280px 이상에서만 표시)
// Figma에서는 상단 내비 아래 고정 띠 → 지금은 대시보드 맨 위에 배치
// TODO: 모든 페이지에 띄워야 하면 AppLayout(공용 UI)으로 이동
export const UrgentBanner = ({ items, onViewItem }: Props) => {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || items.length === 0) return null;

  return (
    <div className="urgent-banner" role="status">
      <div className="urgent-banner__label">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
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

      <button type="button" className="urgent-banner__close" onClick={() => setDismissed(true)} aria-label="긴급 배너 닫기">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
