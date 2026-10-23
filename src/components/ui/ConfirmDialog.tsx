import Button from "./Button";
import Modal from "./Modal";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "primary" | "danger";
    onConfirm: () => void;
    onClose: () => void;
}

function ConfirmDialog({
    open,
    title,
    description,
    confirmText = "확인",
    cancelText = "취소",
    variant = "primary",
    onConfirm,
    onClose,
}: ConfirmDialogProps) {
    return (
        <Modal
            open={open}
            title={title}
            onClose={onClose}
        >
            {description && (
                <p className="confirm-dialog__description">
                    {description}
                </p>
            )}

            <div className="confirm-dialog__actions">
                <Button
                    variant="secondary"
                    onClick={onClose}
                >
                    {cancelText}
                </Button>
                <Button
                    variant={variant}
                    onClick={onConfirm}
                >
                    {confirmText}
                </Button>
            </div>
        </Modal>
    );
}

export default ConfirmDialog;