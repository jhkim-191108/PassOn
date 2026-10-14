import Button from "./Button";

interface ErrorStateProps {
    title?: string;
    description?: string;
    onRetry: () => void;
}

function ErrorState({
    title = "문제가 발생했습니다.",
    description = "잠시 후 다시 시도해주세요.",
    onRetry,
}: ErrorStateProps) {
    return (
        <div className="state">
            <div className="state__icon state__icon--error">
                !
            </div>

            <strong className="state__title">
                {title}
            </strong>

            <p className="state__description">
                {description}
            </p>

            {onRetry && (
                <Button
                    variant="secondary"
                    onClick={onRetry}
                >
                    다시시도
                </Button>
            )}
        </div>
    );
}

export default ErrorState;