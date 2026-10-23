import { useEffect, useState } from "react";
import { ApiError } from "@/api/client";
import { listRecords } from "@/api/records";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Loading from "@/components/ui/Loading";
import { useAppSession } from "@/layouts/appSession";
import type { RecordAction, RecordEntry } from "@/types/api";
import "../../css/records.css";

type RangeKey = "today" | "week" | "month" | "all";

const RANGES: { key: RangeKey; label: string }[] = [
    { key: "today", label: "오늘" },
    { key: "week", label: "이번 주" },
    { key: "month", label: "이번 달" },
    { key: "all", label: "전체" },
];

const ACTION_LABEL: Record<RecordAction, string> = {
    CREATED: "작성",
    UPDATED: "수정",
    COMPLETED: "처리",
    DELETED: "삭제",
};

// 서울 기준 날짜
function seoulDate(date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        weekday: "short",
    }).formatToParts(date);
    const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
    return {
        year: Number(pick("year")),
        month: Number(pick("month")),
        day: Number(pick("day")),
        weekday: pick("weekday"),
    };
}

function iso(year: number, month: number, day: number) {
    const date = new Date(Date.UTC(year, month - 1, day));
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

// 오늘, 이번 주, 이번 달
function rangeOf(key: RangeKey) {
    if (key === "all") return {};
    const today = seoulDate();
    const end = iso(today.year, today.month, today.day);
    if (key === "today") return { from: end, to: end };
    if (key === "month") {
        return { from: iso(today.year, today.month, 1), to: end };
    }
    const weekIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(today.weekday);
    const mondayOffset = weekIndex <= 0 ? -6 : 1 - weekIndex;
    return { from: iso(today.year, today.month, today.day + mondayOffset), to: end };
}

function formatAt(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h12",
    }).format(date);
}

// 같은 인수인계끼리 묶기
function groupRecords(records: RecordEntry[], includeDeleted: boolean) {
    // 삭제된 기록은 체크가 꺼져 있으면 빼기
    const visible = includeDeleted ? records : records.filter((record) => record.action !== "DELETED");
    const groups = new Map<string, RecordEntry[]>();
    for (const record of visible) {
        const key = record.cardId ?? record.handoffId ?? record.id;
        const list = groups.get(key);
        if (list) list.push(record);
        else groups.set(key, [record]);
    }
    return [...groups.entries()]
        .map(([key, events]) => {
            const ordered = [...events].sort((left, right) => left.at.localeCompare(right.at));
            const title = ordered.find((event) => event.action === "CREATED")?.title ?? ordered[0].title;
            return { key, title, events: ordered, latest: ordered[ordered.length - 1].at };
        })
        .sort((left, right) => right.latest.localeCompare(left.latest));
}

// 기록 조회
function RecordsPage() {
    const { currentStore } = useAppSession();
    const storeId = currentStore?.id;
    const [keyword, setKeyword] = useState("");
    const [query, setQuery] = useState("");
    const [range, setRange] = useState<RangeKey>("all");
    const [includeDeleted, setIncludeDeleted] = useState(true);
    const [records, setRecords] = useState<RecordEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        // 검색은 입력이 끝난 뒤에
        const timer = window.setTimeout(() => setQuery(keyword.trim()), 300);
        return () => window.clearTimeout(timer);
    }, [keyword]);

    useEffect(() => {
        // 매장, 검색어, 기간이 바뀌면 다시 불러오기
        if (!storeId) {
            setRecords([]);
            setLoading(false);
            return;
        }
        const requestedId = storeId;
        let cancelled = false;

        async function load() {
            setLoading(true);
            setMessage("");
            try {
                const items = await listRecords(requestedId, { q: query, ...rangeOf(range) });
                if (!cancelled) setRecords(items);
            } catch (error) {
                if (!cancelled) {
                    setRecords([]);
                    setMessage(error instanceof ApiError ? error.message : "기록을 불러오지 못했습니다.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void load();
        return () => {
            cancelled = true;
        };
    }, [storeId, query, range]);

    if (!currentStore) {
        return <ErrorState title="소속된 매장이 없어요." description="매장에 들어간 뒤 기록을 볼 수 있습니다." />;
    }

    const groups = groupRecords(records, includeDeleted);

    return (
        <section className="records">
            <header className="records__header">
                <h1>기록 조회</h1>
                <p>작성·수정·처리·삭제 기록을 모두 확인할 수 있어요.</p>
            </header>

            <input
                className="records__search"
                value={keyword}
                placeholder="제목, 작성자 검색"
                onChange={(event) => setKeyword(event.target.value)}
            />

            <div className="records__filters">
                {RANGES.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        className={range === item.key ? "records__range records__range--active" : "records__range"}
                        onClick={() => setRange(item.key)}
                    >
                        {item.label}
                    </button>
                ))}
                <label className="records__deleted">
                    <input
                        type="checkbox"
                        checked={includeDeleted}
                        onChange={(event) => setIncludeDeleted(event.target.checked)}
                    />
                    삭제된 항목 포함
                </label>
            </div>

            {loading ? <Loading text="기록을 불러오는 중입니다..." /> : null}
            {!loading && message ? <p className="records__message">{message}</p> : null}
            {!loading && !message && groups.length === 0 ? <EmptyState title="기록이 없어요." /> : null}

            {!loading && !message && groups.length > 0 ? (
                <>
                    <p className="records__count">{groups.length}건</p>
                    <ul className="records__list">
                        {groups.map((group) => (
                            <li key={group.key} className="records__card">
                                <strong>{group.title}</strong>
                                <ul>
                                    {group.events.map((event) => (
                                        <li key={`${event.action}-${event.id}`}>
                                            <span className={`records__mark records__mark--${event.action}`}>
                                                {event.actorName.charAt(0)}
                                            </span>
                                            <span>
                                                {event.actorName}님 {ACTION_LABEL[event.action]} · {formatAt(event.at)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </>
            ) : null}
        </section>
    );
}

export default RecordsPage;
