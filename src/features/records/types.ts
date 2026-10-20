// 기록 조회 화면 타입
// TODO: 팀 공용 타입(src/types/api.ts)에 CardView · TrashItemView가 추가되면 그쪽으로 교체
import type { Member } from '@/features/employees';

export type { Member };

export type Urgency = 'NOW' | 'TODAY' | 'LATER';
export type CardProgress = 'OPEN' | 'IN_PROGRESS' | 'DONE';

/** 서버 카드 응답 (GET /api/stores/{storeId}/cards) — 이 화면에서 쓰는 필드만 */
export interface CardResponse {
  id: string;
  handoffId: string;
  title: string;
  urgency: Urgency;
  progress: CardProgress;
  authorName: string | null;
  createdAt: string;
  acknowledgedAt: string | null;
  acknowledgedByName: string | null;
  completedAt: string | null;
  /** 처리한 사람의 user id (이름은 멤버 목록에서 찾음) */
  completedBy: string | null;
}

/** 서버 휴지통 응답 (GET /api/stores/{storeId}/trash) — 최근 2주 삭제 항목 */
export interface TrashItemResponse {
  kind: 'HANDOFF' | 'CARD';
  id: string;
  storeId: string;
  handoffId: string | null;
  title: string;
  deletedBy: string | null;
  deletedByName: string | null;
  deletedAt: string;
  restoreUntil: string;
  kept: boolean;
}

/** 조회 기간 버튼 */
export type RecordPeriod = 'today' | 'week' | 'month' | 'all';

/** 처리 이력 한 줄 (확인 · 처리완료 · 삭제) */
export interface RecordHistory {
  type: 'acknowledged' | 'completed' | 'deleted';
  actorName: string;
  at: string;
}

/** 화면에 그리는 기록 카드 한 장 */
export interface RecordItem {
  id: string;
  title: string;
  /** 삭제된 항목은 중요도 · 상태가 없음 */
  urgency: Urgency | null;
  progress: CardProgress | null;
  isDeleted: boolean;
  authorName: string | null;
  /** 정렬 기준 시각 (작성 시각, 삭제 항목은 삭제 시각) */
  createdAt: string;
  history: RecordHistory[];
}