import { useNavigate } from 'react-router-dom';

// TODO: 공통 컴포넌트 Export명·variant prop 확정 후 교체
import Button from '../../features/auth/components/common/Button';

import logoSrc from '@/assets/logo.png';
import { PATHS } from '@/routes/paths';
import '../../css/LandingPage.css';

type ExampleCardType = 'stock' | 'customer' | 'notice';

const EXAMPLE_CARDS: { type: ExampleCardType; label: string; title: string }[] = [
  { type: 'stock', label: '재고', title: '원두가 거의 없음' },
  { type: 'customer', label: '손님', title: '2번 테이블 단골은 디카페인' },
  { type: 'notice', label: '공지', title: '우유는 내일 아침 입고' },
];

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <header className="landing__header">
        <img src={logoSrc} alt="PassOn" className="landing__logo" />
        <Button variant="secondary" size="sm" onClick={() => navigate(PATHS.LOGIN)}>
          로그인
        </Button>
      </header>

      <main className="landing__main">
        {/* 왼쪽: 헤드라인 + CTA */}
        <section className="landing__hero">
          <h1 className="landing__title">
            퇴근 전 한마디가
            <br />
            다음 근무의
            <br />
            체크리스트가 됩니다.
          </h1>
          <p className="landing__lead">
            짧은 메모를 남기면 AI가 다음 근무자가 바로 확인할 수 있는 카드로 정리해드려요.
          </p>
          <div className="landing__actions">
            <Button variant="primary" onClick={() => navigate(PATHS.SIGNUP)}>
              시작하기
            </Button>
            {/* 데모 계정 선택은 로그인 페이지에서 처리 */}
            <Button variant="secondary" onClick={() => navigate(PATHS.LOGIN)}>
              데모 체험
            </Button>
          </div>
          <p className="landing__caption">카페 · 편의점 · 스터디카페</p>
        </section>

        {/* 오른쪽: 메모 → AI 분류 카드 예시 */}
        <section className="landing__demo" aria-label="인수인계 정리 예시">
          <div className="landing__memo">
            <div className="landing__memo-header">
              <span className="landing__memo-dot" aria-hidden="true" />
              <span className="landing__memo-label">마감자 메모</span>
            </div>
            <p className="landing__memo-text">
              "원두 거의 없음. 2번 테이블 단골은 디카페인. 우유는 내일 아침 입고."
            </p>
          </div>

          <div className="landing__divider" aria-hidden="true">
            <span className="landing__divider-line" />
            <span className="landing__divider-chip">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI 분류
            </span>
            <span className="landing__divider-line" />
          </div>

          <ul className="landing__cards">
            {EXAMPLE_CARDS.map((card) => (
              <li key={card.type} className="landing__card">
                <span className={`landing__card-badge landing__card-badge--${card.type}`}>
                  {card.label}
                </span>
                <span className="landing__card-title">{card.title}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="landing__footer">
        <p>카페 모닝 · PassOn으로 인수인계를 더 쉽게</p>
      </footer>
    </div>
  );
};
