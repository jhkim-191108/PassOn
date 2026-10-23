import { noticeLevelLabel, noticePriority } from "@/features/notices/noticeLevel";
import type { NoticePriority } from "@/types/api";

interface NoticeLevelProps {
    priority: NoticePriority;
}

function NoticeLevel({ priority }: NoticeLevelProps) {
    const level = noticePriority(priority);
    return (
        <span className={`notices__level notices__level--${level.toLowerCase()}`}>
            <i />
            {noticeLevelLabel(level)}
        </span>
    );
}

export default NoticeLevel;
