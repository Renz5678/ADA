import { IoSearch } from "react-icons/io5";
import { IoMdNotificationsOutline } from "react-icons/io";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { useCurrentUser } from "#hooks/useUser.js";
import GlobalSearch from "./GlobalSearch.jsx";

export default function Topbar() {
    const { data: user, isLoading } = useCurrentUser();

    return (
        <div className="flex flex-none w-full bg-[#FFFFFF] border-b-3 border-[#dddddd] h-[12%] items-center p-3 z-40">
            <div className="flex-none h-[100%] w-14" />
            <div className="flex-3 h-[100%] flex items-center justify-center">
                <GlobalSearch />
            </div>
            <div className="flex-2 flex h-[100%] items-center justify-end">
                <div className="flex h-[90%] w-[50%] items-center justify-center p-4 gap-10 border-r-1">
                    <IoMdNotificationsOutline size={24} />
                    <AiOutlineQuestionCircle size={22} />
                </div>
                <div className="flex flex-col h-full w-[50%] justify-center min-w-0">
                    <div className="text-right w-full font-headline font-medium text-base sm:text-lg lg:text-2xl truncate">
                        {isLoading ? "…" : user?.business_name}
                    </div>
                    <div className="text-right w-full font-body text-sm truncate hidden sm:block">
                        {isLoading ? "" : user?.username}
                    </div>
                </div>
            </div>
        </div>
    )
}