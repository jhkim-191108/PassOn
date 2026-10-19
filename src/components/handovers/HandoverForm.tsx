import { useState } from "react";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";

interface HandoverFormProps {
    loading?: boolean;
    onSubmit: (rawText: string) => void;
}

function HandoverForm({
    loading = false,
    onSubmit,
}: HandoverFormProps) {
    const [rawText, setRawText] = useState("");
    const handleSubmit = (
        e: React.SubmitEvent<HTMLFormElement>
    ) => {
        e.preventDefault();
        const text = rawText.trim();
        if(!text) return;
        onSubmit(text);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Textarea
                label="인수인계 내용"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="말하듯 편하게 작성해주세요. AI가 업무별로 정리해드려요!"
            />
            <Button
                type="submit"
                disabled={loading || !rawText.trim()}
            >
                {loading ? "정리 중..." : "AI로 정리하기"}
            </Button>
        </form>
    );
}

export default HandoverForm;