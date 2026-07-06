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
            {/* Toggle button, only visible below md breakpoint */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed top-5 left-4 z-50 text-[#3A0812]"
            >
                <MdMenu size={28} />
            </button>

            {/* Backdrop, only shown on mobile when sidebar is open */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                />
            )}

            <div
                className={`flex flex-none flex-col w-[30%] lg:w-[20%] h-full bg-[#0F1D29] p-4
                    fixed lg:static top-0 left-0 z-50 transition-transform duration-300
                    ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
            >
                <button
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden self-end text-white mb-2"
                >
                    <MdClose size={24} />
                </button>

                <div className="font-headline text-white font-semibold text-4xl text-left p-2">
                    ADA
                </div>
                <div className="font-body text-[#BAC8D8] font-medium px-2">
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