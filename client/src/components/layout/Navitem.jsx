import { useState } from "react";

export default function Navitem({ navName, isActive, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`w-full h-14 transition-all items-center p-4 cursor-pointer font-body
                ${isActive
                    ? "bg-[#FFB2B9] text-[#71333C] scale-95 rounded-r-4xl border-l-6 border-[#71333C]"
                    : "text-[#E8F2FF] hover:bg-[#FFB2B9] hover:text-[#71333C] hover:scale-95 "
                }`}
        >
            {navName}
        </div>
    );
}