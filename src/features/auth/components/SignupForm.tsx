import { useId, useState, type FormEvent } from 'react';

import Button from '@/components/ui/Button';
<<<<<<< HEAD
import Input from '@/components/ui/Input';
=======
>>>>>>> origin/develop
import { ApiError } from '@/api/client';

import { authApi } from '../api/authApi';
import type { SignupRequest } from '../types';
import PasswordInput from './PasswordInput';
import '../../../css/authInput.css';
import '../../../css/SignupForm.css';

export const PASSWORD_MIN_LENGTH = 8;

type Field = 'name' | 'email' | 'password' | 'confirm';
type EmailStatus = 'idle' | 'checking' | 'available' | 'taken';

function passwordRules(password: string) {
  return [
    { id: 'length', label: '8자 이상', met: password.length >= PASSWORD_MIN_LENGTH },
    { id: 'upper', label: '대문자', met: /[A-Z]/.test(password) },
    { id: 'lower', label: '소문자', met: /[a-z]/.test(password) },
    { id: 'special', label: '특수문자', met: /[^A-Za-z0-9]/.test(password) },
  ];
}

function looksLikeEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email.trim());
}

interface Props {
  onSubmit: (values: SignupRequest) => void;
  isPending?: boolean;
  /** 서버 에러 (예: 이미 가입된 이메일) */
  error?: string | null;
  /** 입력값이 바뀔 때 호출 (서버 에러 초기화용) */
  onChange?: () => void;
}

function SignupForm({ onSubmit, isPending = false, error, onChange }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle');
  const [emailError, setEmailError] = useState('');

  const ids = {
    name: useId(),
    email: useId(),
    password: useId(),
    confirm: useId(),
    error: useId(),
  };

  const rules = passwordRules(password);
  const passwordReady = rules.every((rule) => rule.met);
  const confirmMatches = password.length > 0 && password === confirmPassword;

  const firstIssue = (): { field: Field; message: string } | null => {
    if (!name.trim()) return { field: 'name', message: '이름을 입력해주세요' };
    if (!looksLikeEmail(email)) return { field: 'email', message: '올바른 이메일을 입력해주세요' };
    if (emailStatus === 'taken') return { field: 'email', message: '이미 가입된 이메일입니다' };
    if (emailStatus !== 'available') return { field: 'email', message: '이메일 중복 확인을 해주세요' };
    if (!passwordReady) return { field: 'password', message: '비밀번호 조건을 확인해주세요' };
    if (!confirmMatches) return { field: 'confirm', message: '비밀번호가 일치하지 않아요' };
    return null;
  };

  const visibleIssue = submitted ? firstIssue() : null;
  const passwordStarted = password.length > 0 || visibleIssue?.field === 'password';
  const confirmStarted = confirmPassword.length > 0 || visibleIssue?.field === 'confirm';

  const change = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    onChange?.();
  };

  const changeEmail = (value: string) => {
    setEmail(value);
    setEmailStatus('idle');
    setEmailError('');
    onChange?.();
  };

  const checkEmail = async () => {
    setSubmitted(true);
    if (!name.trim() || !looksLikeEmail(email)) return;
    setEmailStatus('checking');
    setEmailError('');
    try {
      const available = await authApi.emailAvailable(email.trim());
      setEmailStatus(available ? 'available' : 'taken');
    } catch (caught) {
      setEmailStatus('idle');
      setEmailError(caught instanceof ApiError ? caught.message : '이메일 확인에 실패했습니다');
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    if (firstIssue() || isPending) return;
    onSubmit({ name: name.trim(), email: email.trim(), password });
  };

  return (
    <form className="signup-form" onSubmit={handleSubmit} noValidate>
      <div className="signup-form__fields">
        <div>
          <label htmlFor={ids.name} className="signup-form__label">
            이름
          </label>
          <Input
            id={ids.name}
            type="text"
            className={`auth-input${visibleIssue?.field === 'name' ? ' auth-input--error' : ''}`}
            value={name}
            onChange={(e) => change(setName)(e.target.value)}
            placeholder="실명을 입력하세요"
            autoComplete="name"
            aria-invalid={visibleIssue?.field === 'name'}
          />
          {visibleIssue?.field === 'name' && <p className="signup-form__hint">{visibleIssue.message}</p>}
        </div>

        <div>
          <label htmlFor={ids.email} className="signup-form__label">
            이메일
          </label>
          <div className="signup-form__email-row">
<<<<<<< HEAD
            <Input
=======
            <input
>>>>>>> origin/develop
              id={ids.email}
              type="email"
              className={`auth-input${visibleIssue?.field === 'email' ? ' auth-input--error' : ''}`}
              value={email}
              onChange={(e) => changeEmail(e.target.value)}
              placeholder="example@email.com"
              autoComplete="email"
              aria-invalid={visibleIssue?.field === 'email'}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={checkEmail}
              disabled={emailStatus === 'checking' || isPending}
            >
              {emailStatus === 'checking' ? '확인 중' : '중복 확인'}
            </Button>
          </div>
          {emailStatus === 'available' && <p className="signup-form__ok">사용할 수 있는 이메일입니다.</p>}
          {visibleIssue?.field === 'email' && <p className="signup-form__hint">{visibleIssue.message}</p>}
          {emailError && <p className="signup-form__hint">{emailError}</p>}
        </div>

        <div>
          <label htmlFor={ids.password} className="signup-form__label">
            비밀번호
          </label>
          <PasswordInput
            id={ids.password}
            value={password}
            onChange={(e) => change(setPassword)(e.target.value)}
            placeholder="비밀번호"
            autoComplete="new-password"
            visible={showPassword}
            onVisibleChange={setShowPassword}
            aria-invalid={passwordStarted && !passwordReady}
            className={passwordStarted && !passwordReady ? 'auth-input--error' : ''}
          />
          <ul className="signup-form__rules" aria-label="비밀번호 조건">
            {rules.map((rule) => (
              <li
                key={rule.id}
                className={`signup-form__rule${rule.met ? ' signup-form__rule--met' : passwordStarted ? ' signup-form__rule--miss' : ''}`}
              >
                <span className="signup-form__rule-mark">{rule.met ? 'v' : 'x'}</span>
                {rule.label}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label htmlFor={ids.confirm} className="signup-form__label">
            비밀번호 확인
          </label>
<<<<<<< HEAD
          <Input
=======
          <input
>>>>>>> origin/develop
            id={ids.confirm}
            type={showPassword ? 'text' : 'password'}
            className={`auth-input${confirmStarted && !confirmMatches ? ' auth-input--error' : ''}`}
            value={confirmPassword}
            onChange={(e) => change(setConfirmPassword)(e.target.value)}
            placeholder="비밀번호를 다시 입력하세요"
            autoComplete="new-password"
            aria-invalid={confirmStarted && !confirmMatches}
          />
          <p
            className={`signup-form__rule${confirmMatches ? ' signup-form__rule--met' : confirmStarted ? ' signup-form__rule--miss' : ''}`}
          >
            <span className="signup-form__rule-mark">{confirmMatches ? 'v' : 'x'}</span>
            비밀번호 일치
          </p>
        </div>
      </div>

      {error && (
        <p id={ids.error} className="signup-form__error" role="alert">
          {error}
        </p>
      )}

      <div className="signup-form__submit">
        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending ? '계정 만드는 중…' : '계정 만들기'}
        </Button>
      </div>
    </form>
  );
}

export default SignupForm;
