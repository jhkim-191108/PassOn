import { useId, useState, type FormEvent } from 'react';

// TODO: 공통 컴포넌트 Export명·variant prop 확정 후 교체
import { Button } from './common/Button';

import type { LoginRequest } from '../types';
import { PasswordInput } from './PasswordInput';
import '../../../css/authInput.css';
import '../../../css/LoginForm.css';

interface Props {
  onSubmit: (values: LoginRequest) => void;
  isPending?: boolean;
  error?: string | null;
  /** 입력값이 바뀔 때 호출 (에러 메시지 초기화용) */
  onChange?: () => void;
}

export const LoginForm = ({ onSubmit, isPending = false, error, onChange }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();

  const canSubmit = email.trim() !== '' && password.trim() !== '' && !isPending;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ email: email.trim(), password });
  };

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <div className="login-form__field">
        <label htmlFor={emailId} className="login-form__label">
          이메일
        </label>
        <input
          id={emailId}
          type="email"
          className="auth-input"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            onChange?.();
          }}
          placeholder="이메일 주소"
          autoComplete="email"
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
        />
      </div>

      <div className="login-form__field">
        <label htmlFor={passwordId} className="login-form__label">
          비밀번호
        </label>
        <PasswordInput
          id={passwordId}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            onChange?.();
          }}
          placeholder="비밀번호"
          autoComplete="current-password"
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
        />
      </div>

      {error && (
        <p id={errorId} className="login-form__error" role="alert">
          {error}
        </p>
      )}

      <div className="login-form__submit">
        <Button type="submit" variant="primary" disabled={!canSubmit}>
          {isPending ? '로그인 중…' : '로그인'}
        </Button>
      </div>
    </form>
  );
};
