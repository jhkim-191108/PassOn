import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Loading from '@/components/ui/Loading';
import { RecordCard, RecordsHeader, RecordsToolbar, useRecords, type RecordPeriod } from '@/features/records';
import { useStoreSession } from '@/features/schedule';
import { PATHS } from '@/routes/paths';
import '../../css/RecordsPage.css';

export const RecordsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // TODO: AuthContext가 생기면 그쪽의 현재 매장으로 교체
  const session = useStoreSession();
  const storeId = session.store?.id ?? '';

  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState<RecordPeriod>('all');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const { items, isLoading, error, reload } = useRecords(storeId, period, query, includeDeleted);

  // 앱 안에서 들어왔으면 이전 화면으로, 주소로 바로 들어왔으면 대시보드로
  const handleBack = () => {
    if (location.key !== 'default') navigate(-1);
    else navigate(PATHS.DASHBOARD);
  };

  const renderList = () => {
    if (session.error) return <ErrorState title="매장 정보를 불러오지 못했어요." description={session.error} />;
    if (session.isLoading || isLoading) return <Loading text="기록을 불러오는 중이에요..." />;
    if (error) return <ErrorState title="기록을 불러오지 못했어요." description={error} onRetry={reload} />;
    if (items.length === 0) {
      return <EmptyState title="기록이 없어요." description="기간이나 검색어를 바꿔서 다시 찾아보세요." />;
    }
    return (
      <div className="records__list">
        {items.map((record) => (
          <RecordCard key={record.id} record={record} />
        ))}
      </div>
    );
  };

  return (
    <div className="records">
      <RecordsHeader onBack={handleBack} />
      <RecordsToolbar
        query={query}
        period={period}
        includeDeleted={includeDeleted}
        onQueryChange={setQuery}
        onPeriodChange={setPeriod}
        onIncludeDeletedChange={setIncludeDeleted}
      />
      {!isLoading && !error && !session.error && <p className="records__count">{items.length}건</p>}
      {renderList()}
    </div>
  );
};