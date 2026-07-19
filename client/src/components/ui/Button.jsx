const variantStyles = {
    primary: "bg-[#8D4A52] text-white hover:bg-[#0F1D29] disabled:opacity-50 disabled:hover:bg-[#8D4A52] disabled:cursor-not-allowed",
    secondary: "border border-[#c1c1c1] text-[#0F1D29] hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent disabled:cursor-not-allowed",
    danger: "bg-[#AB626A] text-white hover:bg-[#7a444a] disabled:opacity-50 disabled:hover:bg-[#AB626A] disabled:cursor-not-allowed",
    "outline-primary": "border border-[#8D4A52] text-[#8D4A52] hover:bg-[#FFF7E6] hover:text-[#8D4A52] disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#8D4A52] disabled:cursor-not-allowed"
};

export default function Button({ variant = "primary", icon: Icon, children, className = "", ...props }) {
    return (
        <button
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-body font-medium text-sm transition duration-150 ${variantStyles[variant] ?? variantStyles.primary} ${className}`}
            {...props}
        >
            {Icon && <Icon size={18} />}
            {children}
        </button>
    );
}
