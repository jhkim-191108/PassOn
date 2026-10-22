import type { PasswordErrors, PasswordForm, StoreRole } from '../types';

export const ROLE_LABEL: Record<StoreRole, string> = {
  OWNER: 'Owner',
  MANAGER: 'Manager',
  STAFF: 'Staff',
};

export const NAME_MAX_LENGTH = 40;

// 서버 규칙과 같게: 8~72자, 영문 대문자 · 소문자 · 특수문자 포함, 공백 없음
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9\s])\S{8,72}$/;

export const EMPTY_PASSWORD_FORM: PasswordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

/** 비밀번호 칸 중 하나라도 입력했으면 변경하려는 것으로 봄 */
export const isPasswordTouched = (form: PasswordForm) =>
  Boolean(form.currentPassword || form.newPassword || form.confirmPassword);

export const validatePassword = (form: PasswordForm): PasswordErrors => {
  const errors: PasswordErrors = {};
  if (!form.currentPassword) errors.currentPassword = '현재 비밀번호를 입력해 주세요.';
  if (!form.newPassword) errors.newPassword = '새 비밀번호를 입력해 주세요.';
  else if (!PASSWORD_PATTERN.test(form.newPassword)) {
    errors.newPassword = '8자 이상, 영문 대문자 · 소문자 · 특수문자를 포함해 주세요.';
  }
  if (form.newPassword && form.confirmPassword !== form.newPassword) {
    errors.confirmPassword = '새 비밀번호와 같지 않아요.';
  }
  return errors;
};

export const validateName = (name: string): string | null => {
  const trimmed = name.trim();
  if (!trimmed) return '이름을 입력해 주세요.';
  if (trimmed.length > NAME_MAX_LENGTH) return `이름은 ${NAME_MAX_LENGTH}자 이하로 입력해 주세요.`;
  return null;
};

const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const PHOTO_MAX_BYTES = 5 * 1024 * 1024;

/** 서버 제한과 같게: jpeg · png · webp · gif, 5MB 이하 */
export const validatePhoto = (file: File): string | null => {
  if (!PHOTO_TYPES.includes(file.type)) return 'JPG, PNG, WEBP, GIF 사진만 올릴 수 있어요.';
  if (file.size > PHOTO_MAX_BYTES) return '5MB 이하 사진만 올릴 수 있어요.';
  return null;
};
