import iconBack from '@/assets/Icon-back.png';
import iconChevron from '@/assets/Icon-chevron.png';
import iconMonitor from '@/assets/Icon-monitor.png';
import { useId, useState } from 'react';
import type { ComponentProps } from 'react'; 

// TODO: 공통 컴포넌트 Export명 확정 후 교체
import { Avatar } from './common/Avatar';
import Badge from './common/Badge';

import type { AppUser, UserRole } from '../types';
import '../../../css/DemoAccountList.css';

interface Props {
  users: AppUser[];
  onSelect: (user: AppUser) => void;
  disabled?: boolean;
}

const currentRole = (user: AppUser) =>
  user.memberships.find((m) => m.storeId === user.currentStoreId)?.role ?? 'STAFF';

const ROLE_BADGE: Record<UserRole, { label: string; variant: ComponentProps<typeof Badge>['variant'] }> = {
  OWNER: { label: 'Owner', variant: 'primary' },
  MANAGER: { label: 'Manager', variant: 'success' },
  STAFF: { label: 'Staff', variant: 'neutral' },
};

export const DemoAccountList = ({ users, onSelect, disabled = false }: Props) => {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="demo-accounts">
      <button
        type="button"
        className="demo-accounts__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="demo-accounts__toggle-label">
          <img src={iconMonitor} alt="" width={14} height={14} />
          데모 계정으로 체험하기
        </span>
        <img
          src={iconChevron}
          alt=""
          width={14}
          height={14}
          className={`demo-accounts__chevron${open ? ' demo-accounts__chevron--open' : ''}`}
        />
      </button>

      {open && (
        <div id={panelId} className="demo-accounts__panel">
          <p className="demo-accounts__note">
            매장 소속(OWNER · MANAGER · STAFF)은 매장을 직접 만들거나 초대를 받아 결정돼요.
          </p>
          <ul className="demo-accounts__list">
            {users.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  className="demo-accounts__item"
                  onClick={() => onSelect(user)}
                  disabled={disabled}
                >
                  <Avatar name={user.name} size="md" />
                  <span className="demo-accounts__info">
                    <span className="demo-accounts__name-row">
                      <span className="demo-accounts__name">{user.name}</span>
                      <Badge variant={ROLE_BADGE[currentRole(user)].variant} size="sm">
                        {ROLE_BADGE[currentRole(user)].label}
                      </Badge>
                    </span>
                    <span className="demo-accounts__email">{user.email}</span>
                  </span>
                  <img className="demo-accounts__arrow" src={iconBack} alt="" width={13} height={13} style={{ transform: "rotate(180deg)" }} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
