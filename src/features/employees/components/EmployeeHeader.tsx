import Button from "@/components/ui/Button";

interface EmployeeHeaderProps {
    storeName: string;
    count: number;
    inviteCode: string | null;
    canEdit: boolean;
    onInvite: () => void;
}

// 상단 제목과 재직 인원, 초대 버튼.
// canEdit는 오너·매니저만 true. 직원 계정은 초대 코드와 버튼을 보지 못한다.
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
