import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
    open: boolean;
    title: string;
    children: ReactNode;
    onClose: () => void;
}

function Modal ({
    open,
    title,
    children,
    onClose,
}: ModalProps) {
    useEffect(() => {
        if (!open) return;

        const esc = (e: KeyboardEvent) => {
            if(e.key === "Escape") {
                onClose();
            }
        };
        document.addEventListener("keydown", esc);

        return () => {
            document.removeEventListener("keydown", esc);
        }
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div 
            className="modal-backdrop"
            onMouseDown={onClose}
        >
            <div 
                className="modal"
                role="dialog"
                aria-modal="true"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="modal__header">
                    {title && <h2>{title}</h2>}
                    <button 
                        type="button"
                        className="modal__close"
                        onClick={onClose}
                        aria-label="닫기"
                    >
                        ×
                    </button>
                </div>
                <div className="modal__content">
                    {children}
                </div>
            </div>
        </div>,
        document.body,
    );
}

export default Modal;