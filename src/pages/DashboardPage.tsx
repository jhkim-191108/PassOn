import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Select from "../components/ui/Select";
import { useState } from "react";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Loading from "../components/ui/Loading";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";

function DashboardPage() {
    const [open, setOpen] = useState(false);
    const [confirm, setConfirm] = useState(false);
    return (
        <section className="dashboard">
            <p className="dashboard__date">10월02일</p>
            <h1 className="dashboard__title">수고하셨어요!</h1>
            <p className="dashboard__description">PassOn 메인 페이지</p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "24px" }}>
                <Button>인수인계 작성</Button>
                <Button variant="secondary">취소</Button>
                <Button variant="danger">삭제</Button>
                <Button disabled>비활성화</Button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "24px" }}>
                <Badge variant="neutral">일반</Badge>
                <Badge variant="warning">중요</Badge>
                <Badge variant="danger">긴급</Badge>
                <Badge variant="primary">진행 중</Badge>
                <Badge variant="success">완료</Badge>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "24px" }}>
                <Input label="이메일" type="email" placeholder="example@example.com" /><br/>
                <Input label="비밀번호" type="password" placeholder="비밀번호를 입력하세요" hint="8자 이상 입력해주세요." /><br/>
                <Input label="이름" value="전재형" disabled /><br/>
                <Input type="submit" value="보내기" />
            </div>
            <div style={{
                width: "100%",
                maxWidth: "600px",
                marginTop: "24px",
            }}>
                <Textarea
                    label="인수인계 내용"
                    placeholder="예) 원두가 거의 없습니다. 우유는 내일 아침 입고 예정이고 냉장고 아래칸 청소 부탁드립니다."
                    hint="근무 중 있었던 일을 자연스럽게 입력해주세요."
                    rows={6}
                />

                <Button type="submit" style={{ marginTop: "16px" }}>AI로 정리하기</Button>
            </div>

            <div style={{ width: "100%", maxWidth: "320px", marginTop: "24px" }}>
                <Select
                    label="매장 종류"
                    defaultValue=""
                    hint="운영 중인 매장 유형을 선택해주세요!"
                    >
                    <option value="" disabled>매장 종류 선택</option>
                    <option value="CAFE">카페</option>
                    <option value="CONVENINCE">편의점</option>
                    <option value="STUDY_CAFE">스터디 카페</option>
                    <option value="RESTAURANT">레스토랑</option>
                    <option value="OTHER">기타</option>
                </Select>

                <Select label="역할" defaultValue="STAFF" hint="관리자는 오너의 승인이 필요합니다!">
                    <option value="MANAGER">매니저(승인필요)</option>
                    <option value="STAFF">직원</option>
                </Select>
            </div>

            <Button onClick={() => setOpen(true)} style={{
                marginTop: "10px"
            }}>모달 열기</Button>

            <Modal
                open={open}
                title="인수인계 등록"
                onClose={() => setOpen(false)}>
                    <p>작성한 인수인계를 등록하시겠습니까?</p>
                    <div style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "8px",
                        marginTop: "20px",
                    }}
                    >
                        <Button variant="secondary" onClick={() => setOpen(false)}>
                            취소
                        </Button>

                        <Button>
                            등록
                        </Button>
                    </div>
                </Modal>
                <Button
                    variant="danger"
                    onClick={() => setConfirm(true)}
                >
                    삭제 테스트
                </Button>
                <ConfirmDialog
                    open={confirm}
                    title="인수인계를 삭제할까요?"
                    description="삭제한 인수인계는 제거됩니다."
                    confirmText="삭제"
                    variant="danger"
                    onClose={() => setConfirm(false)}
                    onConfirm={() => {
                            console.log("삭제 실행");
                            setConfirm(false);
                    }}
                />
                <Loading text="AI가 인수인계를 정리하고 있어요..." />
                <EmptyState
                    title="등록된 인수인계가 없습니다."
                    description="새로운 인수인계를 작성해봐요!"
                />
                <ErrorState
                    title="인수인계를 불러오지 못했습니다."
                    description="네트워크 상태를 확인해주세요."
                    onRetry={() => console.log("다시 시도")}
                />
        </section>
    );
}

export default DashboardPage;