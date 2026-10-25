import { useMemo } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import ErrorState from '@/components/ui/ErrorState';
import Loading from '@/components/ui/Loading';
import {
  DashboardHeader,
  DashboardStats,
  HandoffEmpty,
  HandoffSection,
  PinnedAnnouncements,
  UrgentAlertModal,
  useCurrentUser,
  useDashboard,
  useUrgentAlert,
  type HandoffItem,
} from '@/features/dashboard';
import { PATHS } from '@/routes/paths';
import '../../css/DashboardPage.css';

const HIGHLIGHT_TITLE = {
  OWNER: '보고 필요',
  MANAGER: '확인 필요',
  STAFF: '내 업무',
} as const;

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, isLoading: isUserLoading, error: userError } = useCurrentUser();
  const { summary, isLoading, error, reload, runQuickAction, pendingIds } = useDashboard(user);

  const urgentAlert = useUrgentAlert(summary.urgent);

  // 화면에 보이는 항목을 id로 찾기 (카드 → 인수인계 상세, 공지 → 공지 상세)
  const itemById = useMemo(() => {
    const all: HandoffItem[] = [
      ...summary.urgent,
      ...summary.pending,
      ...summary.mine,
      ...summary.needsReview,
      ...summary.complete,
      ...summary.announcements,
      ...summary.highlighted,
      ...summary.recent,
    ];
    return new Map(all.map((item) => [item.id, item]));
  }, [summary]);

  const viewItem = (id: string) => {
    const item = itemById.get(id);
    if (!item) return;
    if (item.isAnnouncement) navigate(generatePath(PATHS.NOTICE_DETAIL, { noticeId: item.id }));
    else if (item.handoffId) navigate(`${generatePath(PATHS.HANDOFF_DETAIL, { handoffId: item.handoffId })}?card=${item.id}`);
  };
  const newHandoff = () => navigate(PATHS.HANDOFF_NEW);

  // "지금 확인하기": 알림창을 닫고 첫 번째 긴급 항목으로 이동
  const checkUrgent = () => {
    const first = urgentAlert.items[0];
    urgentAlert.dismiss();
    if (first) viewItem(first.id);
  };

  if (userError || !user) {
    return (
      <div className="dashboard">
        <p className="dashboard__status" role={userError ? 'alert' : 'status'}>
          {userError ?? (isUserLoading ? '대시보드를 불러오는 중…' : '로그인 정보를 찾을 수 없어요.')}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="dashboard">
        <Loading text="대시보드를 불러오는 중…" />
      </div>
    );
  }

  if (error && summary.recent.length === 0 && summary.highlighted.length === 0) {
    return (
      <div className="dashboard">
        <ErrorState title="대시보드를 불러오지 못했습니다." description={error} onRetry={reload} />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <UrgentAlertModal
        open={urgentAlert.isOpen}
        items={urgentAlert.items}
        onLater={urgentAlert.dismiss}
        onCheck={checkUrgent}
        onViewItem={(id) => {
          urgentAlert.dismiss();
          viewItem(id);
        }}
      />

      <DashboardHeader userName={user.name} role={summary.role} summary={summary} onNewHandoff={newHandoff} />

      {/* 빠른 처리 실패 등 화면을 유지한 채 보여줄 에러 */}
      {error && (
        <p className="dashboard__inline-error" role="alert">
          {error}
        </p>
      )}

      <DashboardStats summary={summary} onViewItem={viewItem} />

      <PinnedAnnouncements announcements={summary.announcements} onViewItem={viewItem} />

      <HandoffSection
        title={HIGHLIGHT_TITLE[summary.role]}
        hint={summary.role === 'MANAGER' ? '확인하면 처리중으로 이동' : undefined}
        items={summary.highlighted}
        currentUserId={user.id}
        onViewItem={viewItem}
        onQuickAction={runQuickAction}
        pendingIds={pendingIds}
      />

      <HandoffSection
        title="최근 인수인계"
        items={summary.recent}
        currentUserId={user.id}
        onViewItem={viewItem}
        onQuickAction={runQuickAction}
        pendingIds={pendingIds}
        empty={<HandoffEmpty onNewHandoff={newHandoff} />}
      />
    </div>
  );
};
