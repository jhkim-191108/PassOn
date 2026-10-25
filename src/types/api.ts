export interface User {
    id: string;
    email: string;
    name: string;
    photo?: boolean;
}

export interface AuthResponse {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    user: User;
}

export type StoreType =
    | "CAFE"
    | "CONVENIENCE"
    | "STUDY_CAFE"
    | "RESTAURANT"
    | "OTHER";

export type StoreRole =
    | "OWNER"
    | "MANAGER"
    | "STAFF";

export interface Store {
    id: string;
    name: string;
    type: StoreType;
    myRole: StoreRole;
    inviteCode: string | null;
    invitePath?: string | null;
    createdAt: string;
}

export interface NotificationSettings {
    assignment: boolean;
    urgent: boolean;
    memo: boolean;
    completed: boolean;
}

export interface ApiErrorBody {
    status: number;
    code: string;
    message: string;
    fields?: Record<string, string>;
}

export type NotificationType =
    | "ASSIGNMENT"
    | "URGENT"
    | "MEMO"
    | "COMPLETED";

export interface Notification {
    id: string;
    storeId: string;
    type: NotificationType;
    handoffId: string | null;
    cardId: string | null;
    title: string;
    body: string;
    read: boolean;
    createdAt: string;
}

export type HandoffStatus =
    | "DRAFT"
    | "ANALYZING"
    | "ANALYZED"
    | "FAILED"
    | "CONFIRMED";

export interface Handoff {
    id: string;
    storeId: string;
    authorId: string;
    authorName: string;
    rawText: string;
    status: HandoffStatus;
    analyzeError: string | null;
    analyzedAt: string | null;
    confirmedAt: string | null;
    confirmedBy: string | null;
    createdAt: string;
    updatedAt: string;
    read: boolean;
    cardCount: number;
    openCardCount: number;
}

export type CardType =
    | "STOCK"
    | "TASK"
    | "GUEST"
    | "NOTICE";

export type Urgency =
    | "NOW"
    | "TODAY"
    | "LATER";

export type CardProgress =
    | "OPEN"
    | "IN_PROGRESS"
    | "DONE";

export interface Card {
    id: string;
    handoffId: string;
    type: CardType;
    title: string;
    body: string;
    urgency: Urgency;
    needsReview: boolean;
    sourceQuote: string;
    position: number;
    completedAt: string | null;
    completedBy: string | null;
    authorName: string;
    escalationStatus: string | null;
    escalationPriority: string | null;
    assigneeMemberId: string | null;
    assigneeName: string | null;
    acknowledgedAt: string | null;
    progress: CardProgress;
    edited: boolean;
    createdAt: string;
}

export type EscalationPriority = "IMPORTANT" | "URGENT";

export type EscalationStatus = "PENDING" | "RESOLVED";

export interface Escalation {
    id: string;
    storeId: string;
    cardId: string;
    title: string;
    body: string;
    authorName: string;
    requestedBy: string;
    requestedByName: string;
    priority: EscalationPriority;
    status: EscalationStatus;
    createdAt: string;
    resolvedAt: string | null;
}

export type NoticePriority = "NORMAL" | "IMPORTANT" | "URGENT";

export interface Notice {
    id: string;
    storeId: string;
    authorId: string;
    authorName: string;
    title: string;
    body: string;
    pinned: boolean;
    priority: NoticePriority;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateCardRequest {
    type: CardType;
    title: string;
    body: string;
    urgency: Urgency;
    needsReview: boolean;
}

export type RecordAction = "CREATED" | "UPDATED" | "COMPLETED" | "DELETED";

// 기록 한 건
export interface RecordEntry{
    action: RecordAction;
    id: string;
    storeId: string;
    handoffId: string | null;
    cardId: string | null;
    title: string;
    actorName: string;
    at: string;
}

// 인수인계 사진
export interface Photo {
    id: string;
    handoffId: string;
    originalName: string;
    contentType: string;
    sizeBytes: number;
    position: number;
    path: string;
    createdAt: string;
}

// 휴지통
export interface TrashItem {
    kind: "CARD" | "HANDOFF";
    id: string;
    storeId: string;
    handoffId: string;
    title: string;
    deletedBy: string;
    deletedByName: string;
    deletedAt: string;
    restoreUntil: string;
    kept: boolean;
}

export interface MemoView {
    id: string;
    cardId: string;
    authorId: string;
    authorName: string;
    body: string;
    createdAt: string;
}