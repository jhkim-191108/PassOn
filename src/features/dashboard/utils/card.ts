import type { Member } from '@/features/employees';
import type { Notice } from '@/types/api';

import type { CardProgress, CardResponse, HandoffItem, HandoffStatus, Priority, Urgency } from '../types';

// 중요도: 당장(NOW)=긴급, 오늘 안(TODAY)=중요, 나중(LATER)=일반 (기록 조회와 같은 기준)
const URGENCY_TO_PRIORITY: Record<Urgency, Priority> = {
  NOW: 'urgent',
  TODAY: 'important',
  LATER: 'normal',
};

const PROGRESS_TO_STATUS: Record<CardProgress, HandoffStatus> = {
  OPEN: 'pending',
  IN_PROGRESS: 'in-progress',
  DONE: 'complete',
};

// 서버에 없는 값은 빈 값으로 채워서 화면 타입(HandoffItem)을 그대로 씀
const EMPTY_ITEM = {
  teamId: null,
  teamName: null,
  authorId: '',
  assigneeShift: null,
  tasks: [],
  photos: [],
  editHistory: [],
  memos: [],
  isDeleted: false,
  deletedById: null,
  deletedByName: null,
  deletedAt: null,
  carriedOverFrom: null,
  announcementEndDate: null,
} satisfies Partial<HandoffItem>;

/** 멤버 목록으로 id → 이름/user id 를 찾는 표 */
export const buildMemberMaps = (members: Member[]) => ({
  userIdByMemberId: new Map(members.map((m) => [m.id, m.userId])),
  nameByUserId: new Map(members.map((m) => [m.userId, m.name])),
});

type MemberMaps = ReturnType<typeof buildMemberMaps>;

/** 서버 카드 → 대시보드 카드 */
export const cardToHandoff = (card: CardResponse, storeId: string, maps: MemberMaps): HandoffItem => ({
  ...EMPTY_ITEM,
  id: card.id,
  handoffId: card.handoffId,
  storeId,
  title: card.title,
  content: card.body,
  priority: URGENCY_TO_PRIORITY[card.urgency],
  status: PROGRESS_TO_STATUS[card.progress],
  authorName: card.authorName ?? '알 수 없음',
  createdAt: card.createdAt,
  // 담당자는 StoreMember id로 오므로 로그인 사용자 id로 바꿔야 "내 담당" 비교가 됨
  assigneeId: card.assigneeMemberId ? (maps.userIdByMemberId.get(card.assigneeMemberId) ?? null) : null,
  assigneeName: card.assigneeName,
  confirmedById: card.acknowledgedBy,
  confirmedByName: card.acknowledgedByName,
  confirmedAt: card.acknowledgedAt,
  completedById: card.completedBy,
  completedByName: card.completedBy ? (maps.nameByUserId.get(card.completedBy) ?? null) : null,
  completedAt: card.completedAt,
  isEdited: card.edited,
  requiresOwnerReport: card.escalationStatus === 'PENDING',
  isAnnouncement: false,
  announcementPinned: false,
  sourceText: card.sourceQuote,
});

/** 공지 → 대시보드 공지 (고정 공지 영역에서 사용) */
export const noticeToHandoff = (notice: Notice): HandoffItem => ({
  ...EMPTY_ITEM,
  id: notice.id,
  handoffId: null,
  storeId: notice.storeId,
  title: notice.title,
  content: notice.body,
  priority: notice.priority === 'URGENT' ? 'urgent' : notice.priority === 'IMPORTANT' ? 'important' : 'normal',
  status: 'pending',
  authorId: notice.authorId,
  authorName: notice.authorName,
  createdAt: notice.createdAt,
  assigneeId: null,
  assigneeName: null,
  confirmedById: null,
  confirmedByName: null,
  confirmedAt: null,
  completedById: null,
  completedByName: null,
  completedAt: null,
  isEdited: false,
  requiresOwnerReport: false,
  isAnnouncement: true,
  announcementPinned: notice.pinned,
  sourceText: null,
});