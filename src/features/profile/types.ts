import type { Store, StoreRole, User } from '@/types/api';

export type { Store, StoreRole };

// TODO: 공용 타입(User)에 photo가 추가되면 User로 교체
export type MeResponse = User & { photo?: boolean };

export interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type PasswordErrors = Partial<Record<keyof PasswordForm, string>>;
