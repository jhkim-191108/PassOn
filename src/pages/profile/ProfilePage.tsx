import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { logout } from '@/api/auth';
import { ApiError } from '@/api/client';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ErrorState from '@/components/ui/ErrorState';
import Loading from '@/components/ui/Loading';
import {
  AccountInfoCard,
  EMPTY_PASSWORD_FORM,
  isPasswordTouched,
  PasswordChangeCard,
  ProfileAvatar,
  ProfileHeader,
  StoreMembershipList,
  useProfile,
  validateName,
  validatePassword,
  type PasswordErrors,
  type PasswordForm,
} from '@/features/profile';
import { PATHS } from '@/routes/paths';
import '../../css/ProfilePage.css';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { me, stores, isLoading, error, reload, updateName, changePassword, uploadPhoto } = useProfile();

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string>();
  const [passwordForm, setPasswordForm] = useState<PasswordForm>(EMPTY_PASSWORD_FORM);
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);

  // 내 정보를 받으면 이름 칸 채우기
  useEffect(() => {
    if (me) setName(me.name);
  }, [me]);

  // 앱 안에서 들어왔으면 이전 화면으로, 주소로 바로 들어왔으면 대시보드로
  const handleBack = () => {
    if (location.key !== 'default') navigate(-1);
    else navigate(PATHS.DASHBOARD);
  };

  const handlePasswordChange = (field: keyof PasswordForm, value: string) => {
    setPasswordForm((f) => ({ ...f, [field]: value }));
    setPasswordErrors((errs) => ({ ...errs, [field]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!me) return;
    setMessage(null);

    const trimmedName = name.trim();
    const nameChanged = trimmedName !== me.name;
    const passwordTouched = isPasswordTouched(passwordForm);

    const nextNameError = nameChanged ? (validateName(name) ?? undefined) : undefined;
    const nextPasswordErrors = passwordTouched ? validatePassword(passwordForm) : {};
    setNameError(nextNameError);
    setPasswordErrors(nextPasswordErrors);
    if (nextNameError || Object.keys(nextPasswordErrors).length > 0) return;

    if (!nameChanged && !passwordTouched) {
      setMessage({ type: 'success', text: '바뀐 내용이 없어요.' });
      return;
    }

    setIsSaving(true);
    try {
      if (nameChanged) await updateName(trimmedName);
      if (passwordTouched) {
        await changePassword(passwordForm);
        setPasswordForm(EMPTY_PASSWORD_FORM);
      }
      setMessage({ type: 'success', text: '저장했어요.' });
    } catch (err) {
      // 서버가 칸별 오류를 주면 해당 칸 아래에 표시
      if (err instanceof ApiError && err.fields) {
        if (err.fields.name) setNameError(err.fields.name);
        setPasswordErrors({ currentPassword: err.fields.currentPassword, newPassword: err.fields.newPassword });
      }
      setMessage({ type: 'error', text: err instanceof Error ? err.message : '저장하지 못했어요. 다시 시도해 주세요.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setLogoutOpen(false);
    await logout().catch(() => undefined); // 서버 요청이 실패해도 토큰은 지워지므로 로그인 화면으로 이동
    navigate(PATHS.LOGIN, { replace: true });
  };

  if (isLoading) {
    return (
      <div className="profile">
        <ProfileHeader onBack={handleBack} />
        <Loading text="내 정보를 불러오는 중이에요..." />
      </div>
    );
  }

  if (error || !me) {
    return (
      <div className="profile">
        <ProfileHeader onBack={handleBack} />
        <ErrorState title="내 정보를 불러오지 못했어요." description={error ?? undefined} onRetry={reload} />
      </div>
    );
  }

  return (
    <div className="profile">
      <ProfileHeader onBack={handleBack} />

      <ProfileAvatar name={me.name} onUpload={uploadPhoto} />

      {/* TODO: AuthContext가 생기면 현재 매장을 그쪽 값으로 (지금은 첫 번째 매장) */}
      {stores.length > 0 && <StoreMembershipList stores={stores} currentStoreId={stores[0].id} />}

      <form className="profile__form" onSubmit={handleSubmit} noValidate>
        <AccountInfoCard
          name={name}
          email={me.email}
          nameError={nameError}
          onNameChange={(value) => {
            setName(value);
            setNameError(undefined);
          }}
        />
        <PasswordChangeCard form={passwordForm} errors={passwordErrors} onChange={handlePasswordChange} />

        {message && (
          <p className={`profile__message profile__message--${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>
            {message.text}
          </p>
        )}

        <div className="profile__actions">
          <Button type="submit" className="profile__save" disabled={isSaving}>
            {isSaving ? '저장 중…' : '저장하기'}
          </Button>
          <button type="button" className="profile__logout" onClick={() => setLogoutOpen(true)}>
            로그아웃
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={logoutOpen}
        title="로그아웃"
        description="로그아웃 하시겠습니까?"
        confirmText="로그아웃"
        variant="danger"
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};
