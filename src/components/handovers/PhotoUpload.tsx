import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

interface PhotoUploadProps {
    files: File[];
    onChange: (files: File[]) => void;
}

const MAX_FILES = 3;
const MAX_SIZE = 5 * 1024 * 1024;

function PhotoUpload({
    files,
    onChange,
}: PhotoUploadProps) {
    const [error, setError] = useState("");
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const selected = Array.from(
            e.target.files ?? []
        );

        const oversized = selected.some(
            (file) => file.size > MAX_SIZE
        );

        if (oversized) {
            setError("사진은 한 장당 5MB까지 등록할 수 있습니다.");
            return;
        }

        const nextFiles = [...files, ...selected].slice(0, MAX_FILES);

        setError("");
        onChange(nextFiles);

        // 같은 파일 다시 선택 가능하게 초기화
        e.target.value = "";
    };

    const handleRemove = (file: File) => {
        onChange(
            files.filter((item) => item !== file)
        );
    };

    return (
        <div className="photo-upload">
            <div className="photo-upload__header">
                <h3>사진 첨부</h3>

                <Badge
                    variant={
                        files.length >= MAX_FILES ? "warning" : "neutral"
                    }
                    size="sm"
                >
                    {files.length}/{MAX_FILES}
                </Badge>
            </div>

            <Input 
                type="file"
                accept="image/*"
                label="인수인계 사진"
                multiple
                onChange={handleChange}
                disabled={files.length >= MAX_FILES}
                error={error}
                hint="최대3장, 장당 최대 5MB"
            />
            {files.map((file) => (
                <div
                    key={`${file.name}-${file.lastModified}`}
                    className="photo-upload__item"
                >
                    <span>{file.name}</span>
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRemove(file)}
                    >
                        삭제
                    </Button>
                </div>
            ))}
        </div>
    );
}

export default PhotoUpload;