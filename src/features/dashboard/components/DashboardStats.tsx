import type { ReactNode } from 'react';

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

const Icon = ({ d }: { d: string }) => (
  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const ICONS = {
  clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  alert: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  check: 'M5 13l4 4L19 7',
};

interface Props {
  summary: DashboardSummary;
  onViewItem: (id: string) => void;
}

export const DashboardStats = ({ summary, onViewItem }: Props) => {
  const isStaff = summary.role === 'staff';

  const stats: StatDef[] = [
    { key: 'pending', label: '미처리', tone: 'pending', items: summary.pending, emptyLabel: '처리 대기 없음', icon: <Icon d={ICONS.clock} /> },
    { key: 'urgent', label: '긴급', tone: 'urgent', items: summary.urgent, emptyLabel: '긴급 항목 없음', icon: <Icon d={ICONS.alert} /> },
    { key: 'mine', label: '내 담당', tone: 'mine', items: summary.mine, emptyLabel: '배정된 업무 없음', icon: <Icon d={ICONS.user} /> },
    isStaff
      ? { key: 'done', label: '완료', tone: 'done', items: summary.complete, emptyLabel: '완료된 항목 없음', icon: <Icon d={ICONS.check} /> }
      : { key: 'review', label: '확인 필요', tone: 'review', items: summary.needsReview, emptyLabel: '모두 확인됨', icon: <Icon d={ICONS.check} /> },
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
