interface EmptyStateProps {
    title?: string;
    description?: string;
}

function EmptyState({
    title = "표시할 내용이 없습니다.",
    description,
}: EmptyStateProps) {
    return (
        <div className="state">
            <div className="state__icon">○</div>

            <strong className="state__title">
            {title}
            </strong>

            {description && (
                <p className="state__description">
                    {description}
                </p>
            )}
            </div>
    );
}

export default EmptyState;