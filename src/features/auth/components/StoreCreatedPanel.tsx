// TODO: 공통 컴포넌트 Export명·variant prop 확정 후 교체
import Button from './common/Button';

import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import '../../../css/StoreCreatedPanel.css';

interface Props {
  storeName: string;
  inviteCode: string;
  inviteLink: string;
  onStart: () => void;
}

// 매장 개설 완료 → 초대코드 / 초대 링크 공유
export const StoreCreatedPanel = ({ storeName, inviteCode, inviteLink, onStart }: Props) => {
  const { copiedKey, copy } = useCopyToClipboard<'code' | 'link'>();

  const copyButtonClass = (key: 'code' | 'link') =>
    `store-created__copy${copiedKey === key ? ' store-created__copy--done' : ''}`;

  return (
    <section className="store-created">
      <div className="store-created__check" aria-hidden="true">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="store-created__title">{storeName} 개설 완료!</h1>
      <p className="store-created__desc">오너로 등록됐어요. 이제 직원을 초대해보세요.</p>

      <div className="store-created__card">
        <p className="store-created__card-heading">직원 초대 방법</p>

        <div className="store-created__section">
          <p className="store-created__label">초대코드 공유</p>
          <div className="store-created__code-row">
            <span className="store-created__code">{inviteCode}</span>
            <button type="button" className={copyButtonClass('code')} onClick={() => copy('code', inviteCode)}>
              {copiedKey === 'code' ? '복사됨 ✓' : '복사'}
            </button>
          </div>
          <p className="store-created__hint">직원이 앱에서 이 코드를 입력하면 매장에 합류해요.</p>
        </div>

        <div className="store-created__section store-created__section--link">
          <p className="store-created__label">초대 링크 공유</p>
          <div className="store-created__link-row">
            <span className="store-created__link">{inviteLink}</span>
            <button
              type="button"
              className={`${copyButtonClass('link')} store-created__copy--link`}
              onClick={() => copy('link', inviteLink)}
            >
              {copiedKey === 'link' ? '복사됨 ✓' : '복사'}
            </button>
          </div>
        </div>

        {/* 복사 결과를 스크린리더에 알림 */}
        <span className="store-created__sr-only" aria-live="polite">
          {copiedKey ? '클립보드에 복사했어요.' : ''}
        </span>
      </div>

      <div className="store-created__notice">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>
          초대코드는 <strong>매장 설정</strong>에서 언제든 다시 확인할 수 있어요. 역할(매니저/직원)은
          직원이 합류한 후 직원 관리 페이지에서 지정하세요.
        </p>
      </div>

      <div className="store-created__start">
        <Button type="button" variant="primary" onClick={onStart}>
          시작하기
        </Button>
      </div>
      <p className="store-created__later">나중에 초대해도 괜찮아요.</p>
    </section>
  );
};
