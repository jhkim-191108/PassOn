// components
export { DashboardHeader } from './components/DashboardHeader';
export { DashboardStats } from './components/DashboardStats';
export { PinnedAnnouncements } from './components/PinnedAnnouncements';
export { HandoffSection, HandoffEmpty } from './components/HandoffSection';
export { HandoffListCard } from './components/HandoffListCard';
export { UrgentBanner } from './components/UrgentBanner';
export { UrgentAlertModal } from './components/UrgentAlertModal';

// hooks
export { useDashboard } from './hooks/useDashboard';
export { useCurrentUser } from './hooks/useCurrentUser';
export { useUrgentAlert } from './hooks/useUrgentAlert';

// utils
export { buildDashboardSummary, getCurrentRole, type DashboardSummary } from './utils/summary';
export { buildMemberMaps, cardToHandoff, noticeToHandoff } from './utils/card';
export { formatRelativeTime, getGreeting, formatDateLabel, getCurrentShiftLabel } from './utils/time';

// types
export type {
  EditRecord,
  HandoffItem,
  HandoffStatus,
  HandoffTask,
  CardProgress,
  CardResponse,
  Memo,
  Urgency,
  Photo,
  Priority,
  QuickAction,
  UpdateHandoffRequest,
} from './types';
