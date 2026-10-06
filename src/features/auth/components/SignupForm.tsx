import { useId, useState, type FormEvent } from 'react';

// TODO: 공통 컴포넌트 Export명·variant prop 확정 후 교체
import { Button } from './common/Button';

import type { SignupRequest } from '../types';
import { PasswordInput } from './PasswordInput';
import '../../../css/authInput.css';
import '../../../css/SignupForm.css';

export const PASSWORD_MIN_LENGTH = 6;

interface Props {
  onSubmit: (values: SignupRequest) => void;
  isPending?: boolean;
  /** 서버 에러 (예: 이미 가입된 이메일) */
  error?: string | null;
  /** 입력값이 바뀔 때 호출 (서버 에러 초기화용) */
  onChange?: () => void;
}

export const SignupForm = ({ onSubmit, isPending = false, error, onChange }: Props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const ids = {
    name: useId(),
    email: useId(),
    password: useId(),
    passwordHint: useId(),
    confirm: useId(),
    confirmHint: useId(),
    error: useId(),
  };

  // Figma 원본 검증 규칙
  const passwordTooShort = password.length > 0 && password.length < PASSWORD_MIN_LENGTH;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit =
    name.trim().length > 0 &&
    email.includes('@') &&
    password.length >= PASSWORD_MIN_LENGTH &&
    password === confirmPassword &&
    !isPending;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ name: name.trim(), email: email.trim(), password });
  };

  const change = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    onChange?.();
  };

  return (
    <form className="signup-form" onSubmit={handleSubmit} noValidate>
      <div className="signup-form__fields">
        <div>
          <label htmlFor={ids.name} className="signup-form__label">
            이름
          </label>
          <input
            id={ids.name}
            type="text"
            className="auth-input"
            value={name}
            onChange={(e) => change(setName)(e.target.value)}
            placeholder="실명을 입력하세요"
            autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor={ids.email} className="signup-form__label">
            이메일
          </label>
          <input
            id={ids.email}
            type="email"
            className="auth-input"
            value={email}
            onChange={(e) => change(setEmail)(e.target.value)}
            placeholder="example@email.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor={ids.password} className="signup-form__label">
            비밀번호
          </label>
          <PasswordInput
            id={ids.password}
            value={password}
            onChange={(e) => change(setPassword)(e.target.value)}
            placeholder={`${PASSWORD_MIN_LENGTH}자리 이상`}
            autoComplete="new-password"
            visible={showPassword}
            onVisibleChange={setShowPassword}
            aria-invalid={passwordTooShort}
            aria-describedby={passwordTooShort ? ids.passwordHint : undefined}
          />
          {passwordTooShort && (
            <p id={ids.passwordHint} className="signup-form__hint">
              {PASSWORD_MIN_LENGTH}자리 이상 입력해주세요
            </p>
          )}
        </div>

        <div>
          <label htmlFor={ids.confirm} className="signup-form__label">
            비밀번호 확인
          </label>
          {/* 비밀번호 칸의 보기 토글을 함께 따라감 */}
          <input
            id={ids.confirm}
            type={showPassword ? 'text' : 'password'}
            className={`auth-input${passwordMismatch ? ' auth-input--error' : ''}`}
            value={confirmPassword}
            onChange={(e) => change(setConfirmPassword)(e.target.value)}
            placeholder="비밀번호를 다시 입력하세요"
            autoComplete="new-password"
            aria-invalid={passwordMismatch}
            aria-describedby={passwordMismatch ? ids.confirmHint : undefined}
          />
          {passwordMismatch && (
            <p id={ids.confirmHint} className="signup-form__hint">
              비밀번호가 일치하지 않아요
            </p>
          )}
        </div>
      </div>

      {error && (
        <p id={ids.error} className="signup-form__error" role="alert">
          {error}
        </p>
      )}

      <div className="signup-form__submit">
        <Button type="submit" variant="primary" disabled={!canSubmit}>
          {isPending ? '계정 만드는 중…' : '계정 만들기'}
        </Button>
      </div>
    </form>
  );
};
