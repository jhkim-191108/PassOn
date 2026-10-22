// TODO: 공통 컴포넌트 위치(components/common) 확정 후 경로 교체
import iconPlus from '@/assets/Icon-plus.png';
import Button from '@/components/ui/Button';

import type { UserRole } from '@/features/auth';

import type { DashboardSummary } from '../utils/summary';
import { formatDateLabel, getGreeting } from '../utils/time';
import '../../../css/DashboardHeader.css';

interface Props {
  userName: string;
  role: UserRole;
  summary: DashboardSummary;
  onNewHandoff: () => void;
}

// 역할별 한 줄 요약 (Figma 문구 그대로)
const roleMessage = (role: UserRole, s: DashboardSummary) => {
  if (role === 'OWNER') {
    return s.ownerReports.length > 0 ? `보고 필요 ${s.ownerReports.length}건이 있어요` : '오늘도 잘 부탁드려요';
  }
  if (role === 'MANAGER') {
    return s.needsReview.length > 0 ? `확인 필요 ${s.needsReview.length}건이 있어요` : '모든 업무가 확인됐어요';
  }
  return s.mine.length > 0 ? `내 담당 업무 ${s.mine.length}건이 있어요` : '배정된 업무가 없어요';
};

export const DashboardHeader = ({ userName, role, summary, onNewHandoff }: Props) => (
  <header className="dashboard-header">
    <div>
      <p className="dashboard-header__date">{formatDateLabel()}</p>
      <h1 className="dashboard-header__title">
        {getGreeting()}, {userName}님
      </h1>
      <p className="dashboard-header__message">{roleMessage(role, summary)}</p>
    </div>
    <Button variant="primary" onClick={onNewHandoff}>
      <span className="dashboard-header__write">
        <img src={iconPlus} alt="" width={14} height={14} />
        작성
      </span>
    </Button>
  </header>
);
