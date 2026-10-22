import '../../../css/ProfileHeader.css';

interface Props {
  onBack: () => void;
}

export const ProfileHeader = ({ onBack }: Props) => (
  <header className="profile-header">
    <button type="button" className="profile-header__back" onClick={onBack} aria-label="뒤로">
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <h1 className="profile-header__title">마이페이지</h1>
  </header>
);
