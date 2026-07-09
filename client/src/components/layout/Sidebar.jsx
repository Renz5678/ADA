import Navitem from "./Navitem"
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MdOutlineDashboard, MdOutlineReceiptLong, MdOutlineCases, MdOutlineShoppingCart, MdOutlineInventory, MdOutlineChecklist, MdMenu, MdClose, MdLogout } from "react-icons/md";
import Icon from "#components/ui/Icon.jsx";

const navItems = {
    "Dashboard": { name: "Dashboard", icon: MdOutlineDashboard, path: "/dashboard" },
    "Tasks": { name: "Tasks", icon: MdOutlineChecklist, path: "/tasks" },
    "Orders": { name: "Orders", icon: MdOutlineReceiptLong, path: "/orders" },
    "Products": { name: "Products", icon: MdOutlineCases, path: "/products" },
    "Materials": { name: "Materials", icon: MdOutlineInventory, path: "/materials" },
    "Expenses": { name: "Expenses", icon: MdOutlineShoppingCart, path: "/expenses" }
}

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <>
            {/* Hamburger — only below lg */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed top-0 left-4 h-14 sm:h-16 z-50 flex items-center text-[#0F1D29]"
            >
                <MdMenu size={26} />
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

                <div className="font-headline text-white font-semibold text-3xl lg:text-4xl text-left p-2 flex items-center gap-3">
                    <Icon height={2.5} width={2.5} variant="dark" />
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
                            isActive={location.pathname.startsWith(path)}
                            onClick={() => {
                                navigate(path);
                                setIsOpen(false);
                            }}
                            icon={icon}
                        />
                    ))}
                </div>

                <div className="mt-auto mb-4">
                    <button
                        onClick={handleLogout}
                        className="w-full h-14 transition duration-300 ease-in items-center p-4 cursor-pointer font-body flex gap-2 text-[#E8F2FF] hover:bg-[#FFB2B9] hover:text-[#71333C] hover:scale-95"
                    >
                        <MdLogout size={20} />
                        Logout
                    </button>
                </div>
            </div>
        </>
    )
}