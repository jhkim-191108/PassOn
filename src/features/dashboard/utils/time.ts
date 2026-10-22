/** "방금" / "n분 전" / "n시간 전" / "n일 전" */
export const formatRelativeTime = (iso: string, now: number = Date.now()): string => {
  const mins = Math.floor((now - new Date(iso).getTime()) / 60000);
  if (mins < 1) return '방금';
  if (mins < 60) return `${mins}분 전`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}시간 전`;
  return `${Math.floor(hrs / 24)}일 전`;
};

/** 시간대별 인사말 */
export const getGreeting = (date: Date = new Date()): string => {
  const h = date.getHours();
  if (h < 12) return '좋은 아침이에요';
  if (h < 17) return '안녕하세요';
  return '수고하셨어요';
};

/** 예: "10월 8일 (목)" */
export const formatDateLabel = (date: Date = new Date()): string =>
  date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });

/** 현재 근무 시간대 (Figma 기준: 14시 전 오전 / 20시 전 오후 / 그 이후 마감) */
export const getCurrentShiftLabel = (date: Date = new Date()): '오전' | '오후' | '마감' => {
  const h = date.getHours();
  if (h < 14) return '오전';
  if (h < 20) return '오후';
  return '마감';
};
