import '../../../css/StoreSetupChoice.css';

interface Props {
  onCreate: () => void;
  onJoin: () => void;
}

// 매장 생성 / 초대코드 합류 선택 카드
export const StoreSetupChoice = ({ onCreate, onJoin }: Props) => (
  <>
    <div className="setup-choice">
      <button type="button" className="setup-choice__card setup-choice__card--create" onClick={onCreate}>
        <span className="setup-choice__icon" aria-hidden="true">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </span>
        <span className="setup-choice__body">
          <span className="setup-choice__title-row">
            <span className="setup-choice__title">매장 만들기</span>
            <span className="setup-choice__badge">Owner</span>
          </span>
          <span className="setup-choice__desc">
            새 매장을 등록하고 직원을 초대해요. 이 매장의 오너가 됩니다.
          </span>
        </span>
      </button>

      <button type="button" className="setup-choice__card setup-choice__card--join" onClick={onJoin}>
        <span className="setup-choice__icon" aria-hidden="true">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </span>
        <span className="setup-choice__body">
          <span className="setup-choice__title-row">
            <span className="setup-choice__title">초대코드로 합류하기</span>
            <span className="setup-choice__badge">Manager / Staff</span>
          </span>
          <span className="setup-choice__desc">
            오너나 매니저에게 초대코드를 받아 기존 매장에 합류해요.
          </span>
        </span>
      </button>
    </div>

    <p className="setup-choice__note">역할(owner · manager · staff)은 매장별로 정해집니다.</p>
  </>
);
