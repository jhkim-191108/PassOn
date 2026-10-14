import { useId, useState, type FormEvent } from 'react';

// TODO: 공통 컴포넌트 Export명·variant prop 확정 후 교체
import Button from './common/Button';

import type { CreateStoreRequest, StoreType } from '../types';
import '../../../css/authInput.css';
import '../../../css/StoreCreateForm.css';

const STORE_TYPES: { value: StoreType; label: string; icon: string }[] = [
  { value: 'cafe', label: '카페', icon: '☕' },
  { value: 'convenience', label: '편의점', icon: '🏪' },
  { value: 'study-cafe', label: '스터디카페', icon: '📚' },
  { value: 'restaurant', label: '레스토랑', icon: '🍽' },
  { value: 'other', label: '기타', icon: '🏢' },
];

interface Props {
  onSubmit: (values: CreateStoreRequest) => void;
  isPending?: boolean;
  error?: string | null;
  onChange?: () => void;
}

export const StoreCreateForm = ({ onSubmit, isPending = false, error, onChange }: Props) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<StoreType>('cafe');
  const nameId = useId();
  const typeLabelId = useId();

  const canSubmit = name.trim().length > 0 && !isPending;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ name: name.trim(), type });
  };

  return (
    <form className="store-create" onSubmit={handleSubmit} noValidate>
      <div className="store-create__fields">
        <div>
          <label htmlFor={nameId} className="store-create__label">
            매장 이름
          </label>
          <input
            id={nameId}
            type="text"
            className="auth-input"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              onChange?.();
            }}
            placeholder="예: 카페 모닝"
            autoComplete="organization"
          />
        </div>

        <div>
          <p id={typeLabelId} className="store-create__label store-create__label--group">
            매장 종류
          </p>
          <div className="store-create__types" role="radiogroup" aria-labelledby={typeLabelId}>
            {STORE_TYPES.map((t) => {
              const selected = type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`store-create__type${selected ? ' store-create__type--selected' : ''}`}
                  onClick={() => setType(t.value)}
                >
                  <span className="store-create__type-icon" aria-hidden="true">
                    {t.icon}
                  </span>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <p className="store-create__error" role="alert">
          {error}
        </p>
      )}

      <div className="store-create__submit">
        <Button type="submit" variant="primary" disabled={!canSubmit}>
          {isPending ? '매장 만드는 중…' : '매장 만들기'}
        </Button>
      </div>
    </form>
  );
};
