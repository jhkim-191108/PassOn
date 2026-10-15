import type { ButtonHTMLAttributes, ReactNode } from 'react';

// ButtonHTMLAttributes => 버튼요소가 가지는 모든 표준 HTML 속성과 이벤트 핸들러 타입을 제공하는 인터페이스
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: "sm" | "md";
}

function Button({ children, variant = 'primary', size = 'md', className="", ...props }: ButtonProps) {
    const buttonClassName = [
        "button",
        `button--${variant}`,
        `button--${size}`,
        className,
    ]
        .filter(Boolean)
        .join(" ");

        return (
            <button className={buttonClassName} {...props}>
                {children}
            </button>
        );
    }

    export default Button;