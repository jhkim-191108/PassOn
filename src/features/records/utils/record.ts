import type { ComponentProps } from 'react';

import type Badge from '@/components/ui/Badge';

import type {
  CardProgress,
  CardResponse,
  Member,
  RecordItem,
  RecordPeriod,
  TrashItemResponse,
  Urgency,
} from '../types';

type BadgeVariant = ComponentProps<typeof Badge>['variant'];

export const PERIODS: { value: RecordPeriod; label: string }[] = [
  { value: 'today', label: '오늘' },
  { value: 'week', label: '이번 주' },
  { value: 'month', label: '이번 달' },
  { value: 'all', label: '전체' },
];

// 중요도 기준은 대시보드와 같게: 당장(NOW)=긴급, 오늘 안(TODAY)=중요, 나중(LATER)=일반
export const URGENCY_BADGE: Record<Urgency, { label: string; variant: BadgeVariant }> = {
  NOW: { label: '긴급', variant: 'danger' },
  TODAY: { label: '중요', variant: 'warning' },
  LATER: { label: '일반', variant: 'neutral' },
};

export const PROGRESS_BADGE: Record<CardProgress, { label: string; variant: BadgeVariant }> = {
  OPEN: { label: '미처리', variant: 'warning' },
  IN_PROGRESS: { label: '처리중', variant: 'primary' },
  DONE: { label: '완료', variant: 'success' },
};

const pad = (n: number) => String(n).padStart(2, '0');
const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** 기간 버튼 → 서버 조회 범위 (YYYY-MM-DD, 로컬 날짜 기준 · 주는 월요일 시작) */
export const getPeriodRange = (period: RecordPeriod, now: Date = new Date()): { from?: string; to?: string } => {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (period) {
    case 'today':
      return { from: toISODate(today), to: toISODate(today) };
    case 'week': {
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
      return { from: toISODate(monday), to: toISODate(today) };
    }
    case 'month':
      return { from: toISODate(new Date(today.getFullYear(), today.getMonth(), 1)), to: toISODate(today) };
    default:
      return {};
  }
};

/** "9월 27일 오후 09:00" */
export const formatRecordTime = (iso: string): string => {
  const d = new Date(iso);
  const hour = d.getHours();
  const meridiem = hour < 12 ? '오전' : '오후';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${meridiem} ${pad(h12)}:${pad(d.getMinutes())}`;
};

/** 서버 카드 → 기록 카드 (처리한 사람 이름은 멤버 목록에서 찾음) */
export const cardToRecord = (card: CardResponse, nameByUserId: Map<string, string>): RecordItem => {
  const history: RecordItem['history'] = [];
  if (card.acknowledgedAt) {
    history.push({ type: 'acknowledged', actorName: card.acknowledgedByName ?? '알 수 없음', at: card.acknowledgedAt });
  }
  if (card.completedAt) {
    const name = card.completedBy ? nameByUserId.get(card.completedBy) : undefined;
    history.push({ type: 'completed', actorName: name ?? '알 수 없음', at: card.completedAt });
  }
  return {
    id: card.id,
    title: card.title,
    urgency: card.urgency,
    progress: card.progress,
    isDeleted: false,
    authorName: card.authorName,
    createdAt: card.createdAt,
    history,
  };
};

/** 휴지통 항목 → 기록 카드 */
export const trashToRecord = (item: TrashItemResponse): RecordItem => ({
  id: `trash_${item.kind}_${item.id}`,
  title: item.title,
  urgency: null,
  progress: null,
  isDeleted: true,
  authorName: null,
  createdAt: item.deletedAt,
  history: [{ type: 'deleted', actorName: item.deletedByName ?? '알 수 없음', at: item.deletedAt }],
});

/** 휴지통 항목을 기간 · 검색어로 거름 (휴지통 API에는 조건이 없어서 화면에서 처리) */
export const filterTrash = (items: TrashItemResponse[], range: { from?: string; to?: string }, query: string) => {
  const q = query.trim().toLowerCase();
  return items.filter((item) => {
    const day = toISODate(new Date(item.deletedAt));
    if (range.from && day < range.from) return false;
    if (range.to && day > range.to) return false;
    if (!q) return true;
    return item.title.toLowerCase().includes(q) || (item.deletedByName ?? '').toLowerCase().includes(q);
  });
};

export const buildNameMap = (members: Member[]) => new Map(members.map((m) => [m.userId, m.name]));