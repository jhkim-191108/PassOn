import iconAlert from '@/assets/Icon-alert.png';
import Modal from '@/components/ui/Modal';

import type { HandoffItem } from '../types';
import '../../../css/UrgentAlertModal.css';

interface Props {
  open: boolean;
  items: HandoffItem[];
  onLater: () => void;
  onCheck: () => void;
  onViewItem: (id: string) => void;
}

// 대시보드 진입 시 긴급 항목이 있으면 띄우는 알림창 (공용 Modal 사용)
export const UrgentAlertModal = ({ open, items, onLater, onCheck, onViewItem }: Props) => (
  <Modal open={open} title="" onClose={onLater}>
    <div className="urgent-alert">
      <div className="urgent-alert__head">
        <span className="urgent-alert__icon" aria-hidden="true">
          <img src={iconAlert} alt="" width={22} height={22} />
        </span>
        <div>
          <h2 className="urgent-alert__title">긴급 알림이 있습니다!</h2>
          <p className="urgent-alert__desc">즉시 확인이 필요한 항목이에요</p>
        </div>
      </div>

      <ul className="urgent-alert__list">
        {items.map((item) => (
          <li key={item.id}>
            <button type="button" className="urgent-alert__item" onClick={() => onViewItem(item.id)}>
              <strong className="urgent-alert__item-title">{item.title}</strong>
              <span className="urgent-alert__item-body">{item.content}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="urgent-alert__actions">
        <button type="button" className="urgent-alert__later" onClick={onLater}>
          나중에
        </button>
        <button type="button" className="urgent-alert__check" onClick={onCheck}>
          지금 확인하기
        </button>
      </div>
    </div>
  </Modal>
);
