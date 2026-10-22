import type { ComponentProps, MouseEvent } from 'react';

// TODO: 공통 컴포넌트 위치(components/common) 확정 후 경로 교체
import { Avatar } from '@/features/auth/components/common/Avatar';
import Badge from '@/components/ui/Badge';

import type { HandoffItem, HandoffStatus, HandoffTask, Priority, QuickAction } from '../types';
import { formatRelativeTime } from '../utils/time';
import '../../../css/HandoffListCard.css';

// TODO: 인수인계 목록 담당과 공유하는 임시 카드 — 정식 컴포넌트가 생기면 교체
type BadgeVariant = ComponentProps<typeof Badge>['variant'];

const PRIORITY_BADGE: Record<Priority, { label: string; variant: BadgeVariant }> = {
  urgent: { label: '긴급', variant: 'danger' },
  important: { label: '중요', variant: 'warning' },
  normal: { label: '일반', variant: 'neutral' },
};

const STATUS_BADGE: Record<HandoffStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: '미처리', variant: 'warning' },
  'in-progress': { label: '처리중', variant: 'primary' },
  complete: { label: '완료', variant: 'success' },
};

interface Props {
  item: HandoffItem;
  currentUserId: string;
  onClick: () => void;
  /** 넘기면 데스크톱(1280px 이상)에서 확인하기/완료처리 버튼 표시 */
  onQuickAction?: (action: QuickAction) => void;
  /** 빠른 처리 요청 중 */
  isPending?: boolean;
}

// 같은 카테고리의 할 일을 ", "로 합침
const groupTasks = (tasks: HandoffTask[]) => {
  const map = new Map<string, { contents: string[]; done: boolean[] }>();
  for (const t of tasks) {
    const group = map.get(t.category) ?? { contents: [], done: [] };
    group.contents.push(t.content);
    group.done.push(t.isDone);
    map.set(t.category, group);
  }
  return Array.from(map, ([category, { contents, done }]) => ({
    category,
    content: contents.join(', '),
    allDone: done.every(Boolean),
  }));
};

const TaskRows = ({ tasks }: { tasks: HandoffTask[] }) => {
  const grouped = groupTasks(tasks);
  const hidden = Math.max(0, grouped.length - 3);
  return (
    <div className="handoff-card__tasks">
      {grouped.slice(0, 3).map((g) => (
        <p key={g.category} className={`handoff-card__task${g.allDone ? ' handoff-card__task--done' : ''}`}>
          <span className="handoff-card__task-category">{g.category}</span>
          <span className="handoff-card__task-dash">—</span>
          <span className="handoff-card__task-content">{g.content}</span>
        </p>
      ))}
      {hidden > 0 && <p className="handoff-card__task-more">외 {hidden}개 항목</p>}
    </div>
  );
};

const PriorityIcon = ({ priority }: { priority: Priority }) => (
  <span className="handoff-card__icon" aria-hidden="true">
    {priority === 'urgent' ? (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ) : priority === 'important' ? (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ) : (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )}
  </span>
);

const TitleSuffix = ({ item }: { item: HandoffItem }) => (
  <>
    {item.carriedOverFrom && <span className="handoff-card__suffix handoff-card__suffix--carried">(이월)</span>}
    {item.isEdited && <span className="handoff-card__suffix">(수정됨)</span>}
  </>
);

export const HandoffListCard = ({ item, currentUserId, onClick, onQuickAction, isPending = false }: Props) => {
  const isMine = item.assigneeId === currentUserId;
  const isDone = item.status === 'complete';
  const priority = PRIORITY_BADGE[item.priority];
  const status = STATUS_BADGE[item.status];
  const time = formatRelativeTime(item.createdAt);
  const hasTasks = item.tasks.length > 0;

  // 카드 안의 버튼은 카드 클릭(상세 이동)으로 번지지 않게
  const stop = (e: MouseEvent) => e.stopPropagation();
  // 제목 버튼: 키보드(Tab → Enter)로도 상세 이동 가능
  const handleTitleClick = (e: MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  const className = [
    'handoff-card',
    `handoff-card--${item.priority}`,
    isDone && 'handoff-card--done',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={className} onClick={onClick}>
      {/* ── 모바일 · 태블릿 ───────────────────────────── */}
      <div className="handoff-card__compact">
        <div className="handoff-card__bar" />
        <div className="handoff-card__compact-body">
          <div className="handoff-card__title-row">
            <span className="handoff-card__dot" aria-hidden="true" />
            <h3 className="handoff-card__title">
              <button type="button" className="handoff-card__link" onClick={handleTitleClick}>
                {item.title}
              </button>
              <TitleSuffix item={item} />
            </h3>
            <Badge variant={status.variant} size="sm">
              {status.label}
            </Badge>
          </div>

          <div className="handoff-card__indent">
            {hasTasks ? <TaskRows tasks={item.tasks} /> : <p className="handoff-card__content">{item.content}</p>}

            <div className="handoff-card__footer">
              <div className="handoff-card__footer-left">
                <Badge variant={priority.variant} size="sm">
                  {priority.label}
                </Badge>
                {item.assigneeName && (
                  <span className={`handoff-card__assignee-chip${isMine ? ' handoff-card__assignee-chip--mine' : ''}`}>
                    <Avatar name={item.assigneeName} size="sm" />
                    {isMine ? '내 담당' : item.assigneeName}
                  </span>
                )}
              </div>
              <div className="handoff-card__meta">
                {item.photos.length > 0 && <span>📸{item.photos.length}</span>}
                {item.memos.length > 0 && <span>💬{item.memos.length}</span>}
                {item.requiresOwnerReport && (
                  <svg className="handoff-card__owner-icon" width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-label="오너 보고 필요">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                )}
                <span>{time}</span>
                <span className="handoff-card__author">
                  <Avatar name={item.authorName} size="sm" />
                  {item.authorName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 데스크톱 (1280px 이상) ────────────────────── */}
      <div className="handoff-card__wide">
        <PriorityIcon priority={item.priority} />

        <div className="handoff-card__main">
          <div className="handoff-card__wide-title-row">
            <h3 className="handoff-card__wide-title">
              <button type="button" className="handoff-card__link" onClick={handleTitleClick}>
                {item.title}
              </button>
              <TitleSuffix item={item} />
            </h3>
            <div className="handoff-card__badges">
              <Badge variant={priority.variant} size="sm">
                {priority.label}
              </Badge>
              <Badge variant={status.variant} size="sm">
                {status.label}
              </Badge>
              {item.requiresOwnerReport && (
                <Badge variant="primary" size="sm">
                  Owner
                </Badge>
              )}
            </div>
          </div>

          {hasTasks ? (
            <div className="handoff-card__wide-tasks">
              <TaskRows tasks={item.tasks} />
            </div>
          ) : (
            <p className="handoff-card__wide-content">{item.content}</p>
          )}

          <div className="handoff-card__wide-footer">
            {item.assigneeName && (
              <span className={`handoff-card__assignee${isMine ? ' handoff-card__assignee--mine' : ''}`}>
                <Avatar name={item.assigneeName} size="sm" />
                {isMine ? '내 담당 (나)' : item.assigneeName}
                {item.assigneeShift && <span className="handoff-card__shift">· {item.assigneeShift}</span>}
              </span>
            )}
            <span className="handoff-card__author">
              <Avatar name={item.authorName} size="sm" />
              {item.authorName} · {time}
            </span>
            {item.photos.length > 0 && <span>사진 {item.photos.length}</span>}
            {item.memos.length > 0 && <span>메모 {item.memos.length}</span>}
            {item.confirmedByName && <span className="handoff-card__confirmed">✓ {item.confirmedByName} 확인</span>}
          </div>
        </div>

        {onQuickAction && !isDone && (
          <div className="handoff-card__actions" onClick={stop}>
            {item.status === 'pending' && (
              <button
                type="button"
                className="handoff-card__action handoff-card__action--confirm"
                onClick={() => onQuickAction('confirm')}
                disabled={isPending}
              >
                확인하기
              </button>
            )}
            <button
              type="button"
              className="handoff-card__action handoff-card__action--complete"
              onClick={() => onQuickAction('complete')}
              disabled={isPending}
            >
              완료처리
            </button>
          </div>
        )}

        {isDone && (
          <span className="handoff-card__done-mark" aria-label="완료됨">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        )}
      </div>
    </article>
  );
};
