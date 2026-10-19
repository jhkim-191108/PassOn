import NoticeCard from "@/features/notices/components/NoticeCard";
import type { Notice } from "@/types/api";

interface NoticeListProps {
    notices: Notice[];
    onOpen: (noticeId: string) => void;
}

function NoticeList({ notices, onOpen }: NoticeListProps) {
    const pinned = notices.filter((notice) => notice.pinned);
    const others = notices.filter((notice) => !notice.pinned);

    if (notices.length === 0) {
        return <p className="notices__empty">등록된 공지가 없습니다.</p>;
    }

    return (
        <div className="notices__groups">
            {pinned.length > 0 && (
                <section>
                    <p className="notices__pin-label">
                        <span aria-hidden="true">📌</span>
                        상단 고정
                    </p>
                    <ul className="notices__list">
                        {pinned.map((notice) => (
                            <NoticeCard key={notice.id} notice={notice} onOpen={onOpen} />
                        ))}
                    </ul>
                </section>
            )}
            {others.length > 0 && (
                <section>
                    <p className="notices__group-label">전체 공지</p>
                    <ul className="notices__list">
                        {others.map((notice) => (
                            <NoticeCard key={notice.id} notice={notice} onOpen={onOpen} />
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}

export default NoticeList;
