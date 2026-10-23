import Button from "@/components/ui/Button";

interface DangerZoneProps {
    pending: boolean;
    onDelete: () => void;
}

function DangerZone({ pending, onDelete }: DangerZoneProps) {
    return (
        <article className="store-settings__danger" style={{ order: 6 }}>
            <h2>위험 구역</h2>
            <p>아래 작업은 되돌릴 수 없어요. 신중하게 진행하세요.</p>
            <Button type="button" variant="danger" className="store-settings__close" onClick={onDelete} disabled={pending}>
                매장 폐쇄
            </Button>
        </article>
    );
}

export default DangerZone;
