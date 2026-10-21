import { generatePath, useNavigate } from 'react-router-dom';

import ErrorState from '@/components/ui/ErrorState';
import Loading from '@/components/ui/Loading';

import {
  DashboardHeader,
  DashboardStats,
  HandoffEmpty,
  HandoffSection,
  PinnedAnnouncements,
  UrgentBanner,
  useCurrentUser,
  useDashboard,
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
  const user = useCurrentUser();
  const { summary, isLoading, error, reload, runQuickAction, pendingIds } = useDashboard(user);

  const viewItem = (id: string) => navigate(generatePath(PATHS.HANDOFF_DETAIL, { id }));
  const newHandoff = () => navigate(PATHS.HANDOFF_NEW);

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
      <UrgentBanner items={summary.urgent} onViewItem={viewItem} />

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
