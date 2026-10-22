import type { Member } from "../types";

// 멤버 상태를 여기서만 나눈다.
// presentMembers: 재직 목록. ACTIVE와 정지(SUSPENDED). 퇴사만 뺀다.
// activeMembers: 팀 카드와 수정 가능 여부. ACTIVE만.
// leftMembers: 아래 퇴사 기록.
export function isActiveMember(member: Member) {
    return member.status === "ACTIVE";
}

export function groupMembers(members: Member[]) {
    const presentMembers: Member[] = [];
    const activeMembers: Member[] = [];
    const leftMembers: Member[] = [];

    for (const member of members) {
        if (member.status === "LEFT") {
            leftMembers.push(member);
            continue;
        }

        presentMembers.push(member);
        if (isActiveMember(member)) {
            activeMembers.push(member);
        }
    }

    return { presentMembers, activeMembers, leftMembers };
}
