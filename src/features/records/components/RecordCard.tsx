import Badge from '@/components/ui/Badge';

import type { RecordHistory, RecordItem } from '../types';
import { PROGRESS_BADGE, URGENCY_BADGE, formatRecordTime } from '../utils/record';
import '../../../css/RecordCard.css';

const HISTORY_LABEL: Record<RecordHistory['type'], string> = {
  acknowledged: '확인',
  completed: '처리완료',
  deleted: '삭제',
};

interface Props {
  record: RecordItem;
}

export const RecordCard = ({ record }: Props) => {
  const urgency = record.urgency ? URGENCY_BADGE[record.urgency] : null;
  const progress = record.progress ? PROGRESS_BADGE[record.progress] : null;

  return (
    <article className={`record-card${record.isDeleted ? ' record-card--deleted' : ''}`}>
      <div className="record-card__head">
        <h3 className="record-card__title">{record.title}</h3>
        <div className="record-card__badges">
          {urgency && (
            <Badge size="sm" variant={urgency.variant} className="record-card__urgency">
              {urgency.label}
            </Badge>
          )}
          {progress && (
            <Badge size="sm" variant={progress.variant} className="record-card__progress">
              {progress.label}
            </Badge>
          )}
          {record.isDeleted && (
            <Badge size="sm" variant="neutral">
              삭제됨
            </Badge>
          )}
        </div>
      </div>

      {record.authorName && (
        <div className="record-card__author">
          <span className="record-card__avatar" aria-hidden="true">
            {record.authorName.slice(0, 1)}
          </span>
          <span>
            {record.authorName}님 작성 · {formatRecordTime(record.createdAt)}
          </span>
        </div>
      )}

      {record.history.length > 0 && (
        <ul className="record-card__history">
          {record.history.map((h) => (
            <li key={h.type} className={`record-card__event record-card__event--${h.type}`}>
              <span className="record-card__check" aria-hidden="true">
                {h.type === 'deleted' ? '✕' : '✓'}
              </span>
              {h.actorName} {HISTORY_LABEL[h.type]} · {formatRecordTime(h.at)}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
};