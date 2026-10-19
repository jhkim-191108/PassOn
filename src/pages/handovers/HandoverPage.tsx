import { Link } from "react-router-dom";

function HandoverPage() {
    return (
        <section>
            <h1>인수인계</h1>

            <Link to="/app/handovers/new">
                새 인수인계 작성
            </Link>
        </section>
    );
}

export default HandoverPage;