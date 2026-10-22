import iconBack from '@/assets/Icon-back.png';
import '../../../css/ScheduleHeader.css';

interface Props {
  storeName: string;
  onBack: () => void;
}

export const ScheduleHeader = ({ storeName, onBack }: Props) => (
  <header className="schedule-header">
    {/* 모바일·태블릿에서만 보이는 뒤로가기 (1024px 이상은 내비게이션 사용) */}
    <button type="button" className="schedule-header__back" onClick={onBack} aria-label="뒤로">
      <img src={iconBack} alt="" width={18} height={18} />
    </button>
    <div>
      <h1 className="schedule-header__title">근무표</h1>
      {storeName && <p className="schedule-header__store">{storeName}</p>}
    </div>
  </header>
);
