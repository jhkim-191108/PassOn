import { useId, type SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    hint?: string;
}

function Select({
    label,
    error,
    hint,
    id,
    className = "",
    children,
    ...props
}: SelectProps) {
    const uid = useId();
    const selectId = id ?? uid;

    return (
        <div className="select-field">
            {label && (
                <label className="select-field__label" htmlFor={selectId}>
                    {label}
                </label>
            )}
            <select
                id={selectId}
                className={[
                    "select",
                    error ? "select--error" : "",
                    className,
                ]
                .filter(Boolean)
                .join(" ")}
                aria-invalid={!!error}
                {...props}
                >{children}
            </select>

            {error ? (
                <span className="select-field__error">{error}</span>
            ) : (
                hint && (
                    <span className="select-field__hint">{hint}</span>
                )
            )}
        </div>
    );
}


export default Select;