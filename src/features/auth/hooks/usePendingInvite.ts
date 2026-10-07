import { useCallback, useState } from 'react';

// 초대 링크로 들어온 정보를 로그인/회원가입을 거치는 동안 보관 (탭을 닫으면 사라짐)
const STORAGE_KEY = 'passon:pending-invite';

export interface PendingInvite {
  inviteToken?: string;
  inviteCode?: string;
}

export const savePendingInvite = (invite: PendingInvite) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(invite));
  } catch {
    // 저장소를 쓸 수 없는 환경이면 무시
  }
};

export const readPendingInvite = (): PendingInvite | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PendingInvite) : null;
  } catch {
    return null;
  }
};

export const clearPendingInvite = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // 무시
  }
};

export const usePendingInvite = () => {
  const [pendingInvite, setPendingInvite] = useState<PendingInvite | null>(readPendingInvite);

  const clear = useCallback(() => {
    clearPendingInvite();
    setPendingInvite(null);
  }, []);

  return { pendingInvite, clearPendingInvite: clear };
};