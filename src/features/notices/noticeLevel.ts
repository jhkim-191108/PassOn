import type { NoticePriority } from "@/types/api";

const END_KEY = "passon.noticeEnds";

const LABEL: Record<NoticePriority, string> = {
    NORMAL: "일반",
    IMPORTANT: "중요",
    URGENT: "긴급",
};

export function noticeLevelLabel(priority: NoticePriority) {
    return LABEL[priority];
}

function readEnds(): Record<string, string> {
    try {
        const parsed = JSON.parse(localStorage.getItem(END_KEY) ?? "{}") as Record<string, string>;
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

export function noticeEndsOn(id: string) {
    return readEnds()[id] ?? "";
}

export function rememberNoticeEnds(id: string, endsOn: string) {
    const ends = readEnds();
    if (endsOn) ends[id] = endsOn;
    else delete ends[id];
    localStorage.setItem(END_KEY, JSON.stringify(ends));
}

export function formatNoticeEnd(endsOn: string) {
    const [, month, day] = endsOn.split("-");
    if (!month || !day) return "";
    return `~ ${month}/${day}`;
}
