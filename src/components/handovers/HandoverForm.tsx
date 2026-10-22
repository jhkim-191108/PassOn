import { useState } from "react";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";
import PhotoUpload from "./PhotoUpload";

interface HandoverFormProps {
    loading?: boolean;
    photos: File[];
    onPhotosChange: (files: File[]) => void;
    onSubmit: (rawText: string) => void;
}

function HandoverForm({
    loading = false,
    photos,
    onPhotosChange,
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

            <PhotoUpload
                files={photos}
                onChange={onPhotosChange}
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