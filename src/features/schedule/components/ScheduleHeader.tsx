import '../../../css/ScheduleHeader.css';

interface Props {
  storeName: string;
  onBack: () => void;
}

export const ScheduleHeader = ({ storeName, onBack }: Props) => (
  <header className="schedule-header">
    {/* 모바일·태블릿에서만 보이는 뒤로가기 (1024px 이상은 내비게이션 사용) */}
    <button type="button" className="schedule-header__back" onClick={onBack} aria-label="뒤로">
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <div>
      <h1 className="schedule-header__title">근무표</h1>
      {storeName && <p className="schedule-header__store">{storeName}</p>}
    </div>
  </header>
);
