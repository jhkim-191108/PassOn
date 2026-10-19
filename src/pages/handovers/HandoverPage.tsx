import { useNavigate  } from "react-router-dom";
import Button from "@/components/ui/Button";

function HandoverPage() {
    const navigate = useNavigate();
    return (
        <section className="handover-page">
            <h1>인수인계</h1>

            <Button type="button" onClick={() => navigate("/app/handovers/new")}>
                새 인수인계 작성
            </Button>
        </section>
    );
}

export default HandoverPage;