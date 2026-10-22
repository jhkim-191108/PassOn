// Figma types.ts의 인수인계 관련 타입과 동일한 형태
// TODO: 팀 공용 타입 위치가 정해지면 이동 (인수인계 목록/상세 담당과 공유)
import type { ShiftType } from '@/features/auth';

export type Priority = 'normal' | 'important' | 'urgent';
export type HandoffStatus = 'pending' | 'in-progress' | 'complete';

export interface Photo {
  id: string;
  url: string;
  thumbnail: string;
}

export interface Memo {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface EditRecord {
  id: string;
  editorId: string;
  editorName: string;
  editedAt: string;
  previousContent: string;
  newContent: string;
  previousPriority: Priority;
  newPriority: Priority;
}

export interface HandoffTask {
  id: string;
  category: string;
  content: string;
  isDone: boolean;
}

export interface HandoffItem {
  id: string;
  storeId: string;
  teamId: string | null;
  teamName: string | null;
  title: string;
  content: string;
  priority: Priority;
  status: HandoffStatus;

  authorId: string;
  authorName: string;
  createdAt: string;

  assigneeId: string | null;
  assigneeName: string | null;
  assigneeShift: ShiftType | null;

  confirmedById: string | null;
  confirmedByName: string | null;
  confirmedAt: string | null;

  completedById: string | null;
  completedByName: string | null;
  completedAt: string | null;

  tasks: HandoffTask[];
  photos: Photo[];
  isEdited: boolean;
  editHistory: EditRecord[];
  memos: Memo[];

  isDeleted: boolean;
  deletedById: string | null;
  deletedByName: string | null;
  deletedAt: string | null;

  requiresOwnerReport: boolean;
  carriedOverFrom: string | null;
  isAnnouncement: boolean;
  announcementPinned: boolean;
  announcementEndDate: string | null;
  sourceText: string | null;
}

/** 카드의 빠른 처리 버튼 */
export type QuickAction = 'confirm' | 'complete';

export interface UpdateHandoffRequest {
  id: string;
  action: QuickAction;
  /** 처리한 사람 */
  userId: string;
  userName: string;
}

// ── 서버 응답 (GET /api/stores/{id}/cards, open-cards, notices) ──
export type Urgency = 'NOW' | 'TODAY' | 'LATER';
export type CardProgress = 'OPEN' | 'IN_PROGRESS' | 'DONE';

/** 서버 CardView 중 대시보드에서 쓰는 필드 */
export interface CardResponse {
  id: string;
  handoffId: string;
  title: string;
  body: string;
  urgency: Urgency;
  sourceQuote: string | null;
  completedAt: string | null;
  /** 완료한 사람의 user id (이름은 멤버 목록에서 찾음) */
  completedBy: string | null;
  createdAt: string;
  authorName: string | null;
  escalationStatus: 'PENDING' | 'RESOLVED' | null;
  /** StoreMember id (user id 아님) */
  assigneeMemberId: string | null;
  assigneeName: string | null;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
  acknowledgedByName: string | null;
  progress: CardProgress;
  edited: boolean;
}

export interface NoticeResponse {
  id: string;
  storeId: string;
  authorId: string;
  authorName: string;
  title: string;
  body: string;
  pinned: boolean;
  important: boolean;
  createdAt: string;
  updatedAt: string;
}