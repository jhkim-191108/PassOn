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
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M10 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M13 8l4 4-4 4M8 12h9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                매장 폐쇄
            </Button>
        </article>
    );
}

export default DangerZone;
