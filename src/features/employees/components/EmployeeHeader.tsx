import Button from "@/components/ui/Button";

interface EmployeeHeaderProps {
    storeName: string;
    count: number;
    canEdit: boolean;
    onInvite: () => void;
}

// 상단 제목과 재직 인원, 초대 버튼.
// canEdit는 오너·매니저만 true. 초대 코드는 초대 창에서 본다.
function EmployeeHeader({ storeName, count, canEdit, onInvite }: EmployeeHeaderProps) {
    return (
        <header className="employees__header">
            <div>
                <h1 className="employees__title">직원 관리</h1>
                <p className="employees__subtitle">{storeName} · {count}명</p>
            </div>
            {canEdit && (
                <Button type="button" className="employees__invite" onClick={onInvite}>+ 직원 초대</Button>
            )}
        </header>
    );
}

export default EmployeeHeader;
