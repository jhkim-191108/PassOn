import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { savePendingInvite } from '@/features/auth';
import { PATHS } from '@/routes/paths';

// 별도 화면 없이 초대 정보를 보관한 뒤 매장 설정의 "매장 합류하기" 단계로 이동
// 비로그인 상태면 PrivateRoute가 로그인으로 보내고, 로그인/가입 후 다시 합류 단계로 돌아옴
export const InviteAcceptPage = () => {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const inviteCode = searchParams.get('code')?.toUpperCase() || undefined;
    if (!token && !inviteCode) {
      navigate(PATHS.LANDING, { replace: true });
      return;
    }
    savePendingInvite({ inviteToken: token, inviteCode });
    navigate(PATHS.STORE_SETUP, { replace: true });
  }, [token, searchParams, navigate]);

  return null;
};