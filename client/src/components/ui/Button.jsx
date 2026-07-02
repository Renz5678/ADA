const variantStyles = {
    primary: "bg-[#8D4A52] text-white hover:bg-[#0F1D29]",
    secondary: "border border-[#c1c1c1] text-[#0F1D29] hover:bg-gray-50",
    danger: "bg-[#AB626A] text-white hover:bg-[#7a444a]"
};

export default function Button({ variant = "primary", icon: Icon, children, ...props }) {
    return (
        <button
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-body font-medium text-sm transition duration-150
                ${variantStyles[variant] ?? variantStyles.primary}`}
            {...props}
        >
            {Icon && <Icon size={18} />}
            {children}
        </button>
    );
}
