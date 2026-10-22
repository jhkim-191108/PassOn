import type { ReactNode } from 'react';

import iconAlert from '@/assets/Icon-alert.png';
import iconCheck from '@/assets/Icon-check.png';
import iconClock from '@/assets/Icon-clock.png';
import iconUser from '@/assets/Icon-user.png';
import type { HandoffItem } from '../types';
import type { DashboardSummary } from '../utils/summary';
import { formatRelativeTime } from '../utils/time';
import '../../../css/DashboardStats.css';

type Tone = 'pending' | 'urgent' | 'mine' | 'review' | 'done';

interface StatDef {
  key: string;
  label: string;
  tone: Tone;
  items: HandoffItem[];
  emptyLabel: string;
  icon: ReactNode;
}

const Icon = ({ src }: { src: string }) => (
  <img src={src} alt="" width={12} height={12} />
);

const ICONS = {
  clock: iconClock,
  alert: iconAlert,
  user: iconUser,
  check: iconCheck,
};

interface Props {
  summary: DashboardSummary;
  onViewItem: (id: string) => void;
}

export const DashboardStats = ({ summary, onViewItem }: Props) => {
  const isStaff = summary.role === 'STAFF';

  const stats: StatDef[] = [
    { key: 'pending', label: '미처리', tone: 'pending', items: summary.pending, emptyLabel: '처리 대기 없음', icon: <Icon src={ICONS.clock} /> },
    { key: 'urgent', label: '긴급', tone: 'urgent', items: summary.urgent, emptyLabel: '긴급 항목 없음', icon: <Icon src={ICONS.alert} /> },
    { key: 'mine', label: '내 담당', tone: 'mine', items: summary.mine, emptyLabel: '배정된 업무 없음', icon: <Icon src={ICONS.user} /> },
    isStaff
      ? { key: 'done', label: '완료', tone: 'done', items: summary.complete, emptyLabel: '완료된 항목 없음', icon: <Icon src={ICONS.check} /> }
      : { key: 'review', label: '확인 필요', tone: 'review', items: summary.needsReview, emptyLabel: '모두 확인됨', icon: <Icon src={ICONS.check} /> },
  ];

  // 모바일·태블릿: 직원에게는 4번째 카드(완료)를 보여주지 않음 (Figma 기준)
  const compactStats = isStaff ? stats.slice(0, 3) : stats;

  return (
    <section aria-label="오늘 현황">
      {/* ── 모바일 · 태블릿: 숫자만 ───────────────────── */}
      <div className="dashboard-stats dashboard-stats--compact">
        {compactStats.map((s) => (
          <div key={s.key} className={`stat-card stat-card--${s.tone}`}>
            <p className="stat-card__label">{s.label}</p>
            <p className="stat-card__value">{s.items.length}</p>
          </div>
        ))}
      </div>

      {/* ── 데스크톱(1280px 이상): 숫자 + 미리보기 2건 ── */}
      <div className="dashboard-stats dashboard-stats--wide">
        {stats.map((s) => (
          <div key={s.key} className={`stat-panel stat-card--${s.tone}`}>
            <div className="stat-panel__header">
              <div className="stat-panel__heading">
                <span className="stat-panel__icon">{s.icon}</span>
                <p className="stat-panel__label">{s.label}</p>
              </div>
              <p className="stat-panel__count">{s.items.length}</p>
            </div>

            <div className="stat-panel__previews">
              {s.items.slice(0, 2).map((item) => (
                <button key={item.id} type="button" className="stat-panel__preview" onClick={() => onViewItem(item.id)}>
                  <span className="stat-panel__preview-title">{item.title}</span>
                  <span className="stat-panel__preview-meta">
                    {item.authorName} · {formatRelativeTime(item.createdAt)}
                  </span>
                </button>
              ))}
              {s.items.length === 0 && <p className="stat-panel__empty">{s.emptyLabel}</p>}
              {s.items.length > 2 && <p className="stat-panel__more">외 {s.items.length - 2}건 더</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
