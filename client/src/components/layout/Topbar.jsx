import { AiOutlineQuestionCircle } from "react-icons/ai";
import { useCurrentUser } from "#hooks/useUser.js";
import GlobalSearch from "./GlobalSearch.jsx";
import NotificationDropdown from "./NotificationDropdown.jsx";

export default function Topbar() {
    const { data: user, isLoading } = useCurrentUser();

    return (
        <div className="flex flex-none w-full bg-[#FFFFFF] border-b-3 border-[#dddddd] h-14 sm:h-16 md:h-[12%] items-center px-3 sm:px-4 gap-3 z-40">
            {/* Spacer for sidebar on desktop; hidden hamburger area on mobile (sidebar handles its own button) */}
            <div className="flex-none w-8 lg:w-14 shrink-0" />
            <div className="flex-1 h-[70%] flex items-center justify-center min-w-0">
                <GlobalSearch />
            </div>
            <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-4 pr-3 border-r border-[#e0e0e0]">
                    <NotificationDropdown />
                    <AiOutlineQuestionCircle size={20} className="cursor-pointer text-gray-600 hover:text-[#8D4A52] transition hidden sm:block" />
                </div>
                <div className="flex flex-col justify-center min-w-0 max-w-[120px] sm:max-w-[180px]">
                    <div className="text-right font-headline font-medium text-sm sm:text-base lg:text-xl truncate text-[#0F1D29]">
                        {isLoading ? "…" : user?.business_name}
                    </div>
                    <div className="text-right font-body text-xs text-gray-500 truncate hidden sm:block">
                        {isLoading ? "" : user?.username}
                    </div>
                </div>
            </div>
        </div>
    )
}