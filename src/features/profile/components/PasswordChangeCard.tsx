import Input from '@/components/ui/Input';

import type { PasswordErrors, PasswordForm } from '../types';
import '../../../css/ProfileCard.css';

interface Props {
  form: PasswordForm;
  errors: PasswordErrors;
  onChange: (field: keyof PasswordForm, value: string) => void;
}

export const PasswordChangeCard = ({ form, errors, onChange }: Props) => (
  <section className="profile-card">
    <h2 className="profile-card__title">비밀번호 변경</h2>
    <div className="profile-card__fields">
      <Input
        label="현재 비밀번호"
        type="password"
        placeholder="현재 비밀번호"
        value={form.currentPassword}
        onChange={(e) => onChange('currentPassword', e.target.value)}
        error={errors.currentPassword}
        autoComplete="current-password"
      />
      {/* 디자인은 "6자리 이상"이지만 서버 규칙(8자 이상 + 대소문자 + 특수문자)에 맞춤 */}
      <Input
        label="새 비밀번호"
        type="password"
        placeholder="8자 이상, 대·소문자·특수문자 포함"
        value={form.newPassword}
        onChange={(e) => onChange('newPassword', e.target.value)}
        error={errors.newPassword}
        autoComplete="new-password"
      />
      <Input
        label="새 비밀번호 확인"
        type="password"
        placeholder="비밀번호 확인"
        value={form.confirmPassword}
        onChange={(e) => onChange('confirmPassword', e.target.value)}
        error={errors.confirmPassword}
        autoComplete="new-password"
      />
    </div>
  </section>
);
