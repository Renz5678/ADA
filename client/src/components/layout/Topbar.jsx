import { AiOutlineQuestionCircle } from "react-icons/ai";
import { useCurrentUser } from "#hooks/useUser.js";
import GlobalSearch from "./GlobalSearch.jsx";
import NotificationDropdown from "./NotificationDropdown.jsx";
import { useState, useRef, useEffect } from "react";
import { MdOutlinePersonOutline, MdOutlineCalendarToday, MdLogout } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";

export default function Topbar({ pendingQueue = [], onDismiss }) {
    const { data: user, isLoading } = useCurrentUser();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex flex-none w-full bg-[#FFFFFF] border-b-3 border-[#dddddd] h-14 sm:h-16 md:h-[12%] items-center px-3 sm:px-4 gap-3 z-40 relative">
            {/* Spacer for sidebar on desktop; hidden hamburger area on mobile (sidebar handles its own button) */}
            <div className="flex-none w-8 lg:w-14 shrink-0" />
            <div className="flex-1 h-[70%] flex items-center justify-center min-w-0">
                <GlobalSearch />
            </div>
            <div className="flex items-center gap-3 shrink-0 relative" ref={dropdownRef}>
                <div className="flex items-center gap-4 pr-3 border-r border-[#e0e0e0]">
                    <Link to="/marketplace" className="hidden sm:flex items-center px-3 py-1.5 bg-[#8D4A52] text-white text-sm font-medium rounded-md hover:bg-[#7a3e45] transition-colors">
                        View Marketplace
                    </Link>
                    <NotificationDropdown pendingQueue={pendingQueue} onDismiss={onDismiss} />
                    <AiOutlineQuestionCircle size={20} className="cursor-pointer text-gray-600 hover:text-[#8D4A52] transition hidden sm:block" />
                </div>

                <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="w-10 h-10 rounded-full bg-[#0F1D29] text-white flex items-center justify-center font-headline font-bold text-lg shadow-sm hover:scale-105 transition-transform shrink-0"
                >
                    {!isLoading && user?.business_name ? user.business_name.charAt(0).toUpperCase() : <MdOutlinePersonOutline size={20} />}
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                    <div className="absolute right-0 top-12 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-2 border-b border-gray-100 mb-2">
                            <p className="text-sm font-bold text-[#0F1D29] truncate">{user?.business_name}</p>
                            <p className="text-xs text-gray-500 truncate">@{user?.username}</p>
                        </div>
                        <Link
                            to="/profile"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#FFF7E6] hover:text-[#8D4A52] transition-colors"
                        >
                            <MdOutlinePersonOutline size={18} /> Profile Settings
                        </Link>
                        <Link
                            to="/schedule"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#FFF7E6] hover:text-[#8D4A52] transition-colors"
                        >
                            <MdOutlineCalendarToday size={18} /> Schedule
                        </Link>
                        <div className="border-t border-gray-100 mt-2 pt-2">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <MdLogout size={18} /> Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}