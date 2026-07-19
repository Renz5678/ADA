import Navitem from "./Navitem"
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MdOutlineDashboard, MdOutlineReceiptLong, MdMenu, MdClose, MdLogout, MdChevronLeft, MdChevronRight } from "react-icons/md";
import Icon from "#components/ui/Icon.jsx";

const navItems = {
    "Dashboard": { name: "Dashboard", icon: MdOutlineDashboard, path: "/client/dashboard" },
    "Orders": { name: "Orders", icon: MdOutlineReceiptLong, path: "/client/orders" },
}

export default function ClientSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem("sidebarCollapsed");
        return saved === "true";
    });

    useEffect(() => {
        localStorage.setItem("sidebarCollapsed", isCollapsed);
    }, [isCollapsed]);

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    const handleLogout = () => {
        localStorage.removeItem("client_token");
        navigate("/");
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
                    fixed lg:static top-0 left-0 z-50 transition-all duration-300
                    w-[75vw] max-w-[280px] ${isCollapsed ? 'lg:w-[88px]' : 'lg:w-[220px]'}
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 overflow-x-hidden`}
            >
                <button
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden self-end text-white mb-2"
                >
                    <MdClose size={24} />
                </button>

                <div className={`font-headline text-white font-semibold text-3xl lg:text-4xl p-2 flex items-center gap-3 transition-all duration-300 ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}`}>
                    <div className="shrink-0">
                        <Icon height={2.5} width={2.5} variant="dark" />
                    </div>
                    <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'}`}>
                        ADA
                    </span>
                </div>
                <div className={`font-body text-[#BAC8D8] font-medium px-2 text-xs lg:text-sm transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'lg:h-0 lg:opacity-0' : 'h-auto opacity-100'}`}>
                    Client Portal
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
                            isCollapsed={isCollapsed}
                        />
                    ))}
                </div>

                <div className="mt-auto mb-4 border-t border-white/10 pt-4">
                    <button
                        onClick={handleLogout}
                        className={`w-full h-14 transition duration-300 ease-in items-center p-4 cursor-pointer font-body flex gap-2 text-[#E8F2FF] hover:bg-[#FFB2B9] hover:text-[#71333C] hover:scale-95 ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}`}
                    >
                        <MdLogout size={20} className="shrink-0" />
                        <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'}`}>
                            Logout
                        </span>
                    </button>
                    
                    <div className="hidden lg:flex justify-end pt-2 mt-2 border-t border-white/10">
                        <button 
                            onClick={toggleCollapse}
                            className={`p-2 text-gray-400 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/10 flex items-center justify-center ${isCollapsed ? 'w-full' : ''}`}
                        >
                            {isCollapsed ? <MdChevronRight size={24} /> : <MdChevronLeft size={24} />}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
