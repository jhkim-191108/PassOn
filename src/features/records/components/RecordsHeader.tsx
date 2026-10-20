import '../../../css/RecordsHeader.css';

interface Props {
  onBack: () => void;
}

export const RecordsHeader = ({ onBack }: Props) => (
  <header className="records-header">
    {/* 모바일에서만 보이는 뒤로가기 (태블릿 이상은 내비게이션 사용) */}
    <button type="button" className="records-header__back" onClick={onBack} aria-label="뒤로">
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <div>
      <h1 className="records-header__title">기록 조회</h1>
      <p className="records-header__desc">작성·수정·처리·삭제 기록을 모두 확인할 수 있어요.</p>
    </div>
  </header>
);