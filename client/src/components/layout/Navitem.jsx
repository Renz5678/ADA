export default function Navitem({ navName, isActive, onClick, icon: Icon, isCollapsed }) {
    return (
        <div
            title={isCollapsed ? navName : undefined}
            onClick={onClick}
            className={`w-full h-14 transition-all duration-300 ease-in items-center p-4 cursor-pointer font-body flex gap-3
                ${isActive
                    ? "bg-[#FFB2B9] text-[#71333C] scale-95 rounded-r-4xl border-l-6 border-[#71333C]"
                    : "text-[#E8F2FF] hover:bg-[#FFB2B9] hover:text-[#71333C] hover:scale-95 "
                } ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}`}
        >
            <Icon size={20} className="shrink-0" />
            <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'}`}>
                {navName}
            </span>
        </div>
    );
}