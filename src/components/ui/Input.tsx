import { useId } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    // 원래 input이 갖고 있는 기능을 모두 상속받기 위해 InputHTMLAttributes를 상속받음
    label?: string;
    error?: string;
    hint?: string;
}

function Input({
    label,
    error,
    hint,
    id,
    className="",
    ...props
}: InputProps) {
    const uid = useId();
    const inputId = id ?? uid;
    // label과 input을 연결하기 위한 고유 ID를 React가 자동으로 만들어주는 useId 훅을 사용하여 inputId를 생성. 만약 id가 props로 전달되면 그 값을 사용하고, 그렇지 않으면 uid를 사용.

    return (
        <div className="input-field">
            {label && (
                <label className="input-field__label" htmlFor={inputId}>
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={[
                    "input", error ? "input--error" : "", className,
                ]
                .filter(Boolean)
                .join(" ")}
                aria-invalid={!!error}  // 입력값에 에러가 있는지 여부를 Boolean 값으로 변환하여 전달
                {...props}
            />
            {error ? (
                <span className="input-field__error">{error}</span>
            ) : (
                hint && <span className="input-field__hint">{hint}</span>
            )}
        </div>
    );
}

export default Input;