import type { HTMLAttributes, ReactNode } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    children: ReactNode;
    variant?: "primary" | "success" | "warning" | "danger" | "neutral";
    size?: "sm" | "md";
}

function Badge({ children, variant = "neutral", size = "md", className = "", ...props }: BadgeProps) {
    const badgeClassName = [
        "badge",
        `badge--${variant}`,
        `badge--${size}`,
        className,
    ]
        .filter(Boolean)
        .join(" ");

        return (
            <span className={badgeClassName} {...props}>
                {children}
            </span>
        );
    }

    export default Badge;