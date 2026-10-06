import { useId, useState, type FormEvent } from 'react';

// TODO: 공통 컴포넌트 Export명·variant prop 확정 후 교체
import { Button } from './common/Button'

import '../../../css/authInput.css';
import '../../../css/StoreJoinForm.css';

const INVITE_CODE_MAX_LENGTH = 8;

/** 초대 링크(.../invite/:token)에서 토큰 추출 */
export const extractInviteToken = (link: string): string | null => {
  const match = link.trim().match(/\/invite\/([^/?#\s]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

interface Props {
  /** 초대코드로 합류 */
  onSubmitCode: (inviteCode: string) => void;
  /** 초대 링크로 합류 (링크에서 추출한 토큰 전달) */
  onSubmitLink: (inviteToken: string) => void;
  isPending?: boolean;
  /** 서버 에러 (예: 존재하지 않는 초대코드) */
  error?: string | null;
  onChange?: () => void;
  /** 초대 링크로 들어온 경우 미리 채워둘 값 */
  initialCode?: string;
  initialLink?: string;
}

export const StoreJoinForm = ({
  onSubmitCode,
  onSubmitLink,
  isPending = false,
  error,
  onChange,
  initialCode = '',
  initialLink = '',
}: Props) => {
  const [code, setCode] = useState(initialCode);
  const [link, setLink] = useState(initialLink);
  const [linkError, setLinkError] = useState<string | null>(null);

  const codeId = useId();
  const codeErrorId = useId();
  const linkId = useId();
  const linkErrorId = useId();

  const handleCodeSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!code.trim() || isPending) return;
    onSubmitCode(code.trim());
  };

  const handleLinkSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!link.trim() || isPending) return;
    const token = extractInviteToken(link);
    if (!token) {
      setLinkError('올바른 초대 링크가 아니에요. 받은 링크 전체를 붙여넣어 주세요.');
      return;
    }
    onSubmitLink(token);
  };

  return (
    <div className="store-join">
      <form onSubmit={handleCodeSubmit} noValidate>
        <label htmlFor={codeId} className="store-join__label">
          초대코드
        </label>
        <div className="store-join__row">
          <input
            id={codeId}
            type="text"
            className={`auth-input store-join__code${error ? ' auth-input--error' : ''}`}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              onChange?.();
            }}
            placeholder="예: MORNING7"
            maxLength={INVITE_CODE_MAX_LENGTH}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-invalid={!!error}
            aria-describedby={error ? codeErrorId : undefined}
          />
          <Button type="submit" variant="primary" disabled={!code.trim() || isPending}>
            합류
          </Button>
        </div>
        {error && (
          <p id={codeErrorId} className="store-join__error" role="alert">
            {error}
          </p>
        )}
      </form>

      <div className="store-join__divider">
        <span>또는</span>
      </div>

      <form onSubmit={handleLinkSubmit} noValidate>
        <label htmlFor={linkId} className="store-join__label">
          초대 링크로 합류
        </label>
        <div className="store-join__row">
          <input
            id={linkId}
            type="url"
            className={`auth-input${linkError ? ' auth-input--error' : ''}`}
            value={link}
            onChange={(e) => {
              setLink(e.target.value);
              setLinkError(null);
            }}
            placeholder="https://passon.kr/invite/..."
            autoComplete="off"
            spellCheck={false}
            aria-invalid={!!linkError}
            aria-describedby={linkError ? linkErrorId : undefined}
          />
          {/* TODO: Figma에서는 파란색 버튼 — 공통 Button에 해당 variant가 생기면 교체 */}
          <Button type="submit" variant="primary" disabled={!link.trim() || isPending}>
            합류
          </Button>
        </div>
        {linkError && (
          <p id={linkErrorId} className="store-join__error" role="alert">
            {linkError}
          </p>
        )}
      </form>

      <div className="store-join__info">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>합류 후 역할(매니저/직원)은 매장 오너가 직원 관리 페이지에서 지정해요.</p>
      </div>
    </div>
  );
};
