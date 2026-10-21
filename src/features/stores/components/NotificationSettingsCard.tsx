import type { NotificationSettings } from "@/types/api";

const TOGGLES: { key: keyof NotificationSettings; title: string; description: string }[] = [
    { key: "assignment", title: "업무 배정 알림", description: "내게 업무가 배정됐을 때" },
    { key: "urgent", title: "긴급 인수인계 알림", description: "긴급 업무가 등록됐을 때" },
    { key: "memo", title: "메모 알림", description: "내 업무에 메모가 추가됐을 때" },
    { key: "completed", title: "처리 완료 알림", description: "내가 작성한 업무가 완료됐을 때" },
];

interface NotificationSettingsCardProps {
    settings: NotificationSettings | null;
    pending: boolean;
    owner: boolean;
    onToggle: (key: keyof NotificationSettings) => void;
}

function NotificationSettingsCard({ settings, pending, owner, onToggle }: NotificationSettingsCardProps) {
    return (
        <article className="store-settings__card" style={{ order: owner ? 4 : 3 }}>
            <h2>알림 설정</h2>
            <ul className="store-settings__toggles">
                {TOGGLES.map((item) => {
                    const on = settings?.[item.key] ?? false;
                    return (
                        <li key={item.key}>
                            <div>
                                <strong>{item.title}</strong>
                                <p>{item.description}</p>
                            </div>
                            <button
                                type="button"
                                className={on ? "store-settings__switch store-settings__switch--on" : "store-settings__switch"}
                                role="switch"
                                aria-checked={on}
                                aria-label={item.title}
                                disabled={!settings || pending}
                                onClick={() => onToggle(item.key)}
                            >
                                <i />
                            </button>
                        </li>
                    );
                })}
            </ul>
        </article>
    );
}

export default NotificationSettingsCard;
