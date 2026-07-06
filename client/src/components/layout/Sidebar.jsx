import Navitem from "./Navitem"
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MdOutlineDashboard, MdOutlineReceiptLong, MdOutlineCases, MdOutlineShoppingCart, MdMenu, MdClose, MdOutlineCalendarToday } from "react-icons/md";

const navItems = {
    "Dashboard": { name: "Dashboard", icon: MdOutlineDashboard, path: "/dashboard" },
    "Orders": { name: "Orders", icon: MdOutlineReceiptLong, path: "/orders" },
    "Products": { name: "Products", icon: MdOutlineCases, path: "/products" },
    "Expenses": { name: "Expenses", icon: MdOutlineShoppingCart, path: "/expenses" },
    "Schedule": { name: "Schedule", icon: MdOutlineCalendarToday, path: "/schedule" },
}

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Hamburger — only below lg */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 text-white bg-[#0F1D29] p-1.5 rounded-lg shadow-md"
            >
                <MdMenu size={22} />
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                />
            )}

            {/* Sidebar panel */}
            <div
                className={`flex flex-none flex-col h-full bg-[#0F1D29] p-4
                    fixed lg:static top-0 left-0 z-50 transition-transform duration-300
                    w-[75vw] max-w-[280px] lg:w-[220px]
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                <button
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden self-end text-white mb-2"
                >
                    <MdClose size={24} />
                </button>

                <div className="font-headline text-white font-semibold text-3xl lg:text-4xl text-left p-2">
                    ADA
                </div>
                <div className="font-body text-[#BAC8D8] font-medium px-2 text-xs lg:text-sm">
                    Create. Sell. Track
                </div>

                <div className="flex flex-col gap-2 mt-8">
                    {Object.values(navItems).map(({ name, icon, path }) => (
                        <Navitem
                            key={name}
                            navName={name}
                            isActive={location.pathname === path}
                            onClick={() => {
                                navigate(path);
                                setIsOpen(false);
                            }}
                            icon={icon}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}