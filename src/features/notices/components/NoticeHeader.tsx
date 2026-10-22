import Button from "@/components/ui/Button";

interface NoticeHeaderProps {
    storeName: string;
    canEdit: boolean;
    onCreate: () => void;
}

function NoticeHeader({ storeName, canEdit, onCreate }: NoticeHeaderProps) {
    return (
        <header className="notices__header">
            <div>
                <h1 className="notices__title">공지사항</h1>
                <p className="notices__subtitle">{storeName}의 공지를 확인하세요.</p>
            </div>
            {canEdit && (
                <Button type="button" className="notices__create" onClick={onCreate}>
                    + 공지 작성
                </Button>
            )}
        </header>
    );
}

export default NoticeHeader;
