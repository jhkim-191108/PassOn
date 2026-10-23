import iconMegaphone from '@/assets/Icon-megaphone.png';
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
            <img src={iconMegaphone} alt="" width={14} height={14} />
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
