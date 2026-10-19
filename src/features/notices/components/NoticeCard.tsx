import NoticeLevel from "@/features/notices/components/NoticeLevel";
import { formatNoticeEnd, noticeEndsOn, noticePriority } from "@/features/notices/noticeLevel";
import type { Notice } from "@/types/api";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface NoticeCardProps {
    notice: Notice;
    onOpen: (noticeId: string) => void;
}

function formatNoticeDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`;
}

function NoticeCard({ notice, onOpen }: NoticeCardProps) {
    const level = noticePriority(notice.priority);
    const endsOn = noticeEndsOn(notice.id);
    return (
        <li className={`notices__card notices__card--${level.toLowerCase()}`} onClick={() => onOpen(notice.id)}>
            <div className="notices__card-head">
                <h2>{notice.title}</h2>
                <NoticeLevel priority={level} />
            </div>
            <p className="notices__body">{notice.body}</p>
            <div className="notices__meta">
                <span className="notices__author">
                    <span className="notices__avatar">{(notice.authorName || "?").slice(0, 1)}</span>
                    {notice.authorName}
                </span>
                <span className="notices__date">
                    {endsOn && <em>{formatNoticeEnd(endsOn)}</em>}
                    {formatNoticeDate(notice.createdAt)}
                </span>
            </div>
        </li>
    );
}

export default NoticeCard;
