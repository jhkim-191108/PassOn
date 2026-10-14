import { useCallback, useState, type ReactNode } from 'react';
import { generatePath, useLocation, useNavigate } from 'react-router-dom';

import logoSrc from '@/assets/logo.png';
import {
  StoreCreateForm,
  StoreCreatedPanel,
  StoreJoinForm,
  StoreSetupChoice,
  useStoreSetup,
  usePendingInvite,
  type CreateStoreResponse,
} from '@/features/auth';
import { PATHS } from '@/routes/paths';
import '../../css/StoreSetupPage.css';

type Step = 'choose' | 'create' | 'created' | 'join';

/** 회원가입·로그인에서 navigate state로 넘겨주는 값 */
interface StoreSetupLocationState {
  userName?: string;
}

const buildInviteLink = (token: string) =>
  `${window.location.origin}${generatePath(PATHS.INVITE_ACCEPT, { token })}`;

export const StoreSetupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // TODO: 로그인 상태 저장 위치 확정 후 현재 사용자 이름은 그쪽에서 가져오기
  const userName = (location.state as StoreSetupLocationState | null)?.userName;

 // 변경: 초대 링크(/invite/:token)로 들어왔으면 합류 단계부터 시작
  const { pendingInvite, clearPendingInvite } = usePendingInvite();
  const [step, setStep] = useState<Step>(pendingInvite ? 'join' : 'choose');
  const [created, setCreated] = useState<CreateStoreResponse | null>(null);

  const goToDashboard = useCallback(() => navigate(PATHS.DASHBOARD, { replace: true }), [navigate]);

  const handleCreated = useCallback(
    (response: CreateStoreResponse) => {
      clearPendingInvite();
      setCreated(response);
      setStep('created');
    },
    [clearPendingInvite],
  );

  const handleJoined = useCallback(() => {
    clearPendingInvite();
    goToDashboard();
  }, [clearPendingInvite, goToDashboard]);

  const { createStore, joinStore, isPending, error, clearError } = useStoreSetup({
    onCreated: handleCreated,
    onJoined: handleJoined,
  });
  const moveTo = (next: Step) => {
    clearError();
    setStep(next);
  };

  const handleBack = () => {
    if (step !== 'choose') {
      moveTo('choose');
      return;
    }
    // 앱 안에서 들어왔으면 이전 화면으로, 주소로 바로 들어왔으면 랜딩으로
    if (location.key !== 'default') navigate(-1);
    else navigate(PATHS.LANDING);
  };

  // 초대 링크를 붙여넣은 경우 초대 수락 페이지에서 매장 정보를 확인한 뒤 합류
  

  // ── 개설 완료 ─────────────────────────────────────────
  if (step === 'created' && created) {
    return (
      <main className="store-setup">
        <div className="store-setup__container">
          <StoreCreatedPanel
            storeName={created.storeName}
            inviteCode={created.inviteCode}
            inviteLink={buildInviteLink(created.inviteToken)}
            onStart={goToDashboard}
          />
        </div>
      </main>
    );
  }

  // ── 선택 / 매장 만들기 / 초대코드 합류 ────────────────
  const content: Record<Exclude<Step, 'created'>, { title: string; desc: ReactNode; body: ReactNode }> = {
    choose: {
      title: '어떻게 시작할까요?',
      desc: (
        <>
          {userName && (
            <>
              <strong className="store-setup__name">{userName}</strong>님,{' '}
            </>
          )}
          매장을 직접 만들거나 초대코드로 합류하세요.
        </>
      ),
      body: <StoreSetupChoice onCreate={() => moveTo('create')} onJoin={() => moveTo('join')} />,
    },
    create: {
      title: '매장 만들기',
      desc: '매장 정보를 입력하세요. 이 매장의 오너가 됩니다.',
      body: (
        <StoreCreateForm
          onSubmit={createStore}
          isPending={isPending}
          error={error}
          onChange={clearError}
        />
      ),
    },
    join: {
      title: '매장 합류하기',
      desc: '오너나 매니저에게 받은 초대코드를 입력하세요.',
      body: (
        <StoreJoinForm
          onSubmitCode={(inviteCode) => joinStore({ inviteCode })}
          onSubmitLink={(inviteToken) => joinStore({ inviteToken })}   // 변경
          isPending={isPending}
          error={error}
          onChange={clearError}
          initialCode={pendingInvite?.inviteCode}                         // 추가
          initialLink={pendingInvite?.inviteToken ? buildInviteLink(pendingInvite.inviteToken) : undefined} // 추가
        />
      ),
    },
  };

  const current = content[step === 'created' ? 'choose' : step];

  return (
    <main className="store-setup">
      <div className="store-setup__container">
        <button type="button" className="store-setup__back" onClick={handleBack}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          뒤로
        </button>

        <header className="store-setup__header">
          <img src={logoSrc} alt="PassOn" className="store-setup__logo" />
          <h1 className="store-setup__title">{current.title}</h1>
          <p className="store-setup__desc">{current.desc}</p>
        </header>

        {current.body}
      </div>
    </main>
  );
};
