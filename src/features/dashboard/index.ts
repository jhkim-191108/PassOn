// components
export { DashboardHeader } from './components/DashboardHeader';
export { DashboardStats } from './components/DashboardStats';
export { PinnedAnnouncements } from './components/PinnedAnnouncements';
export { HandoffSection, HandoffEmpty } from './components/HandoffSection';
export { HandoffListCard } from './components/HandoffListCard';
export { UrgentBanner } from './components/UrgentBanner';

// hooks
export { useDashboard } from './hooks/useDashboard';
export { useCurrentUser } from './hooks/useCurrentUser';

// api
export { dashboardApi } from './api/dashboardApi';

// utils
export { buildDashboardSummary, getCurrentRole, type DashboardSummary } from './utils/summary';
export { formatRelativeTime, getGreeting, formatDateLabel, getCurrentShiftLabel } from './utils/time';

// types
export type {
  EditRecord,
  HandoffItem,
  HandoffStatus,
  HandoffTask,
  Memo,
  Photo,
  Priority,
  QuickAction,
  UpdateHandoffRequest,
} from './types';
