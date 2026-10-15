// 날짜는 모두 로컬 시간 기준 "YYYY-MM-DD" 문자열로 다룸 (UTC 변환으로 하루 밀리는 문제 방지)

export const toISODate = (year: number, month: number, day: number): string =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

export const dateToISO = (date: Date): string =>
  toISODate(date.getFullYear(), date.getMonth() + 1, date.getDate());

/** "YYYY-MM-DD" → 로컬 자정 Date */
export const isoToDate = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const todayISO = (): string => dateToISO(new Date());

export const addDays = (iso: string, days: number): string => {
  const date = isoToDate(iso);
  date.setDate(date.getDate() + days);
  return dateToISO(date);
};

/** 두 날짜 사이의 일수 (b - a) */
export const diffDays = (a: string, b: string): number =>
  Math.round((isoToDate(b).getTime() - isoToDate(a).getTime()) / 86_400_000);

export interface YearMonth {
  year: number;
  month: number; // 1~12
}

export const addMonths = ({ year, month }: YearMonth, delta: number): YearMonth => {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
};

export interface CalendarCell {
  iso: string;
  day: number;
  /** 보고 있는 달의 날짜인지 (앞뒤 달 날짜는 false) */
  current: boolean;
  /** 0=일 ~ 6=토 */
  weekday: number;
}

/** 6주(42칸) 달력 (Figma와 동일) */
export const getMonthCells = ({ year, month }: YearMonth): CalendarCell[] => {
  const first = new Date(year, month - 1, 1);
  const start = addDays(dateToISO(first), -first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const iso = addDays(start, i);
    const date = isoToDate(iso);
    return { iso, day: date.getDate(), current: date.getMonth() + 1 === month, weekday: i % 7 };
  });
};

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

/** 예: "10월 12일 월요일" */
export const formatLongDate = (iso: string): string =>
  isoToDate(iso).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });
