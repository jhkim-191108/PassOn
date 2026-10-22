import { useEffect, useEffectEvent, useRef, useState } from "react";

type DropdownName = "noti" | "profile" | "store";

function useDropdown<T extends HTMLElement = HTMLDivElement>() {
    const [open, setOpen] = useState<DropdownName | null>(null);
    const ref = useRef<T>(null);
    const handleOutside = useEffectEvent(
        (e: MouseEvent) => {
            if (
                ref.current &&
                !ref.current.contains(e.target as Node)
            ) {
                setOpen(null);
            }
        }
    );

    const handleEsc = useEffectEvent(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setOpen(null);
            }
        }
    );

    useEffect(() => {
        document.addEventListener("mousedown", handleOutside);
        document.addEventListener("keydown", handleEsc);

        return () => {
            document.removeEventListener("mousedown", handleOutside);
            document.removeEventListener("keydown", handleEsc);
        };
    }, []);

    const toggle = (name: DropdownName) => {
        setOpen((prev) => prev === name ? null : name);
    };

    const close = () => {
        setOpen(null);
    };

    return {
        open,
        ref,
        toggle,
        close,
    };
}

export default useDropdown;