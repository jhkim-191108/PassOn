import type { AppUser, UserRole } from '@/features/auth';

import type { HandoffItem } from '../types';

export interface DashboardSummary {
  role: UserRole;
  urgent: HandoffItem[];
  pending: HandoffItem[];
  mine: HandoffItem[];
  needsReview: HandoffItem[];
  ownerReports: HandoffItem[];
  complete: HandoffItem[];
  announcements: HandoffItem[];
  /** 역할별 우선 항목 (오너: 보고 필요 / 매니저: 확인 필요 / 직원: 내 업무) */
  highlighted: HandoffItem[];
  /** 우선 항목을 제외한 최근 미완료 인수인계 */
  recent: HandoffItem[];
}

const uniqueById = (items: HandoffItem[]) =>
  items.filter((item, i, arr) => arr.findIndex((x) => x.id === item.id) === i);

const byNewest = (a: HandoffItem, b: HandoffItem) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

export const getCurrentRole = (user: AppUser): UserRole =>
  user.memberships.find((m) => m.storeId === user.currentStoreId)?.role ?? 'STAFF';

// Figma DashboardPage의 집계 규칙 그대로
export const buildDashboardSummary = (items: HandoffItem[], user: AppUser): DashboardSummary => {
  const role = getCurrentRole(user);
  const active = items.filter((i) => !i.isDeleted && !i.isAnnouncement);

  const urgent = active.filter((i) => i.priority === 'urgent' && i.status !== 'complete');
  const pending = active.filter((i) => i.status === 'pending');
  const mine = active.filter((i) => i.assigneeId === user.id && i.status !== 'complete');
  const needsReview = active.filter(
    (i) => (i.priority === 'important' || i.priority === 'urgent') && !i.confirmedById && i.status === 'pending',
  );
  const ownerReports = active.filter((i) => i.requiresOwnerReport && i.status !== 'complete');
  const complete = active.filter((i) => i.status === 'complete');
  const announcements = items.filter((i) => i.isAnnouncement && i.announcementPinned && !i.isDeleted);

  const highlighted =
    role === 'OWNER'
      ? uniqueById([...ownerReports, ...urgent]).slice(0, 4)
      : role === 'MANAGER'
        ? needsReview.slice(0, 5)
        : uniqueById([...mine, ...urgent]).slice(0, 5);

  const recent = active
    .filter((i) => i.status !== 'complete' && !highlighted.some((h) => h.id === i.id))
    .sort(byNewest)
    .slice(0, 6);

  return { role, urgent, pending, mine, needsReview, ownerReports, complete, announcements, highlighted, recent };
};
