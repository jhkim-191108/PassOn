interface LoadingProps{
    text?: string;
}

function Loading({
    text = "불러오는 중입니다...",
}: LoadingProps) {
    return (
        <div
            className="loading"
            role="status"
            aria-live="polite"
        >
            <span className="loading__spinner"/>
            <span className="loading__text">
                {text}
            </span>
        </div>
    );
}

export default Loading;