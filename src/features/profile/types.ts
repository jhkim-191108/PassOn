import type { Store, StoreRole, User } from '@/types/api';

export type { Store, StoreRole };

/** GET /api/users/me — 서버에는 photo(사진 등록 여부)가 더 있음 */
// TODO: 공용 타입(User)에 photo가 추가되면 User로 교체
export type MeResponse = User & { photo?: boolean };

export interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type PasswordErrors = Partial<Record<keyof PasswordForm, string>>;
