import Button from "../ui/Button";

interface EmployeeHeaderProps {
    storeName: string;
    count: number;
    inviteCode: string | null;
    canEdit: boolean;
    onInvite: () => void;
}

// 제목, 인원 수, 초대 버튼. 직원은 초대 코드를 받지 못하므로 버튼도 숨긴다.
function EmployeeHeader({ storeName, count, inviteCode, canEdit, onInvite }: EmployeeHeaderProps) {
    return (
        <header className="employees__header">
            <div>
                <h1 className="employees__title">직원 관리</h1>
                <p className="employees__subtitle">{storeName} · {count}명</p>
                {inviteCode && <p className="employees__code">초대 코드 {inviteCode}</p>}
            </div>
            {canEdit && (
                <Button type="button" onClick={onInvite}>+ 직원 초대</Button>
            )}
        </header>
    );
}

export default EmployeeHeader;
