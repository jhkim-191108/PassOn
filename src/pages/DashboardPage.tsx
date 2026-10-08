import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";

function DashboardPage() {
    return (
        <section className="dashboard">
            <p className="dashboard__date">10월02일</p>
            <h1 className="dashboard__title">수고하셨어요!</h1>
            <p className="dashboard__description">PassOn 메인 페이지</p>

            <div style={{ display: "flex", gap: "8px", marginTop: "24px" }}>
                <Button>인수인계 작성</Button>
                <Button variant="secondary">취소</Button>
                <Button variant="danger">삭제</Button>
                <Button disabled>비활성화</Button>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "24px" }}>
                <Badge variant="neutral">일반</Badge>
                <Badge variant="warning">중요</Badge>
                <Badge variant="danger">긴급</Badge>
                <Badge variant="primary">진행 중</Badge>
                <Badge variant="success">완료</Badge>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "24px" }}>
                <Input label="이메일" type="email" placeholder="example@example.com" /><br/>
                <Input label="비밀번호" type="password" placeholder="비밀번호를 입력하세요" hint="8자 이상 입력해주세요." /><br/>
                <Input label="이름" value="전재형" disabled /><br/>
                <Input type="submit" value="보내기" />
            </div>
            <div style={{
                width: "600px",
                margin: "24px",
            }}>
                <Textarea
                    label="인수인계 내용"
                    placeholder="예) 원두가 거의 없습니다. 우유는 내일 아침 입고 예정이고 냉장고 아래칸 청소 부탁드립니다."
                    hint="근무 중 있었던 일을 자연스럽게 입력해주세요."
                    rows={6}
                />
            </div>
        </section>
    );
}

export default DashboardPage;