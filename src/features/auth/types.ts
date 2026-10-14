// Figma types.ts의 사용자/매장 소속 타입과 동일한 형태
// TODO: 팀 공용 타입 위치가 정해지면 UserRole · ShiftType · AppUser 이동
export type UserRole = 'owner' | 'manager' | 'staff';
export type ShiftType = '오전' | '오후' | '마감' | '풀타임' | '홀' | '주방';

export interface StoreMembership {
  storeId: string;
  storeName: string;
  role: UserRole;
  shifts: ShiftType[];
  isActive: boolean;
  joinedAt: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  currentStoreId: string;
  memberships: StoreMembership[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AppUser;
  accessToken: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

// 가입 직후 자동 로그인 → 매장 생성/합류로 이동하므로 로그인 응답과 같은 형태
export type SignupResponse = LoginResponse;

// ── 매장 생성 / 합류 ───────────────────────────────────
export type StoreType = 'cafe' | 'convenience' | 'study-cafe' | 'restaurant' | 'other';

export interface CreateStoreRequest {
  name: string;
  type: StoreType;
}

export interface CreateStoreResponse {
  storeId: string;
  storeName: string;
  /** 직원이 직접 입력하는 초대코드 */
  inviteCode: string;
  /** 초대 링크(/invite/:token)에 들어가는 토큰 */
  inviteToken: string;
}

export type JoinStoreRequest = { inviteCode: string } | { inviteToken: string };

export interface JoinStoreResponse {
  storeId: string;
  storeName: string;
}
