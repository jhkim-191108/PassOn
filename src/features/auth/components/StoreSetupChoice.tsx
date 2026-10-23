import iconBuilding from '@/assets/Icon-building.png';
import iconKey from '@/assets/Icon-key.png';
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
          <img src={iconBuilding} alt="" width={20} height={20} />
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
          <img src={iconKey} alt="" width={20} height={20} />
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

    <p className="setup-choice__note">역할(OWNER · MANAGER · STAFF)은 매장별로 정해집니다.</p>
  </>
);
