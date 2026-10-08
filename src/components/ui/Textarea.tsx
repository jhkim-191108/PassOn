import type { TextareaHTMLAttributes } from "react";
import { useId } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

function Textarea({
    label,
    error,
    hint,
    id,
    className = "",
    ...props
}: TextareaProps) {
    const uid = useId();
    const textareaId = id ?? uid;

    return (
        <div className="textarea-field">
            {label && (
                <label className="textarea-field__label" htmlFor={textareaId}>
                    {label}
                </label>
            )}
            <textarea
                id={textareaId}
                className={[
                    "textarea",
                    error ? "textarea--error" : "",
                    className,
                ]
                .filter(Boolean)
                .join(" ")}
                aria-invalid={!!error}
                {...props}
                />
            {error ? (
                <span className="textarea-field__error">{error}</span>
            ) : (
                hint && (
                    <span className="textarea-field__hint">{hint}</span>
                )
            )}
        </div>
    );
}

export default Textarea;