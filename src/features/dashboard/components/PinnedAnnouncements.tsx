import type { HandoffItem } from '../types';
import '../../../css/PinnedAnnouncements.css';

interface Props {
  announcements: HandoffItem[];
  onViewItem: (id: string) => void;
}

/** "2026-10-05" → "10/05" */
const formatEndDate = (date: string) => date.slice(5, 10).replace('-', '/');

// 고정된 공지
export const PinnedAnnouncements = ({ announcements, onViewItem }: Props) => {
  if (announcements.length === 0) return null;

  return (
    <section className="pinned-announcements" aria-label="고정 공지">
      {announcements.map((a) => (
        <button key={a.id} type="button" className="pinned-announcements__item" onClick={() => onViewItem(a.id)}>
          <span className="pinned-announcements__head">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <span className="pinned-announcements__label">공지</span>
            {a.announcementEndDate && (
              <span className="pinned-announcements__until">~ {formatEndDate(a.announcementEndDate)}</span>
            )}
          </span>
          <span className="pinned-announcements__title">{a.title}</span>
        </button>
      ))}
    </section>
  );
};
