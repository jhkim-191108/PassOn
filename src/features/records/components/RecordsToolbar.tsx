import type { RecordPeriod } from '../types';
import { PERIODS } from '../utils/record';
import '../../../css/RecordsToolbar.css';

interface Props {
  query: string;
  period: RecordPeriod;
  includeDeleted: boolean;
  onQueryChange: (value: string) => void;
  onPeriodChange: (value: RecordPeriod) => void;
  onIncludeDeletedChange: (value: boolean) => void;
}

export const RecordsToolbar = ({
  query,
  period,
  includeDeleted,
  onQueryChange,
  onPeriodChange,
  onIncludeDeletedChange,
}: Props) => (
  <div className="records-toolbar">
    <label className="records-toolbar__search">
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
      </svg>
      <input
        type="search"
        className="records-toolbar__input"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="제목, 내용, 작성자, 담당자 검색"
        aria-label="기록 검색"
      />
    </label>

    <div className="records-toolbar__filters">
      <div className="records-toolbar__periods" role="group" aria-label="기간">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            className={`records-toolbar__period${period === p.value ? ' records-toolbar__period--active' : ''}`}
            aria-pressed={period === p.value}
            onClick={() => onPeriodChange(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <label className="records-toolbar__toggle">
        <input
          type="checkbox"
          className="records-toolbar__toggle-input"
          checked={includeDeleted}
          onChange={(e) => onIncludeDeletedChange(e.target.checked)}
        />
        <span className="records-toolbar__switch" aria-hidden="true" />
        삭제된 항목 포함
      </label>
    </div>
  </div>
);