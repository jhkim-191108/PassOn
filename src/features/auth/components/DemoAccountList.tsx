import { useId, useState } from 'react';

// TODO: 공통 컴포넌트 Export명 확정 후 교체
import { Avatar } from './common/Avatar';
import { RoleBadge } from './common/Badge';

import type { AppUser } from '../types';
import '../../../css/DemoAccountList.css';

interface Props {
  users: AppUser[];
  onSelect: (user: AppUser) => void;
  disabled?: boolean;
}

const currentRole = (user: AppUser) =>
  user.memberships.find((m) => m.storeId === user.currentStoreId)?.role ?? 'staff';

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
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          데모 계정으로 체험하기
        </span>
        <svg
          width="14"
          height="14"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
          className={`demo-accounts__chevron${open ? ' demo-accounts__chevron--open' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div id={panelId} className="demo-accounts__panel">
          <p className="demo-accounts__note">
            매장 소속(owner · manager · staff)은 매장을 직접 만들거나 초대를 받아 결정돼요.
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
                      <RoleBadge role={currentRole(user)} />
                    </span>
                    <span className="demo-accounts__email">{user.email}</span>
                  </span>
                  <svg
                    width="13"
                    height="13"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                    className="demo-accounts__arrow"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
