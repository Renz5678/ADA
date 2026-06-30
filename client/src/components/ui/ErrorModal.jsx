export default function ErrorModal({ errorModal, setErrorModal }) {
    if (!errorModal) return null;

    const { title, message, actions } = errorModal;

    return (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex justify-center items-center">
            <div className="w-[90%] max-w-sm bg-white rounded-2xl p-6 flex flex-col gap-4 shadow-lg">

                {/* Icon + Title */}
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#8D4A52]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                    </div>
                    <h3 className="font-headline text-lg font-semibold text-[#0F1D29]">{title}</h3>
                    <p className="text-sm text-[#AB626A] leading-relaxed">{message}</p>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-[#f0f0f0]" />

                {/* Actions */}
                <div className="flex flex-col gap-2">
                    {actions.map(({ label, onClick, variant }) => (
                        <button
                            key={label}
                            type="button"
                            onClick={() => {
                                setErrorModal(null);
                                onClick?.();
                            }}
                            className={`w-full h-9 rounded-full text-sm font-medium transition duration-150
                ${variant === "primary"
                                    ? "bg-[#8D4A52] text-white hover:bg-[#0F1D29]"
                                    : "border border-[#c1c1c1] text-[#0F1D29] hover:bg-gray-50"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}