import Button from './Button.jsx';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', isDestructive = true }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#0F1D29]/60 backdrop-blur-sm z-50 flex justify-center items-center animate-fadeIn">
            <div className="w-[90%] sm:w-full max-w-sm bg-[#FFF7E6] border border-[#e8d5b5] rounded-3xl p-7 flex flex-col gap-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] animate-zoomIn">
                <div className="flex flex-col gap-2">
                    <h3 className="font-headline text-lg font-bold text-[#0F1D29]">{title}</h3>
                    <p className="text-sm text-gray-600 font-body">{message}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <Button variant={isDestructive ? 'danger' : 'primary'} className="w-full" onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                    <Button variant="secondary" className="w-full" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}
