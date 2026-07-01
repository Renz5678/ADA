import { IoSearch } from "react-icons/io5";
import { IoMdNotificationsOutline } from "react-icons/io";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { useCurrentUser } from "#hooks/useUser.js";

export default function Topbar() {
    const { data: user, isLoading, isError, error } = useCurrentUser();
    console.log({ user, isLoading, isError, error });

    return (
        <div className="flex flex-none w-full bg-[#FFFFFF] border-b-3 border-[#dddddd] h-[12%] items-center p-3">
            <div className="flex-none h-[100%] w-14" />
            <div className="flex-3 h-[100%] flex items-center justify-center">
                <div className="relative w-[100%] h-[85%]">
                    <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AEAE]" size={24} />
                    <input type="text"
                        className="w-full h-full bg-[#F5F3F3] rounded-4xl p-4 pl-11 focus:outline-[#FFECED] font-body font-medium"
                        placeholder="Search orders, products, expenses" />
                </div>
            </div>
            <div className="flex-2 flex h-[100%] items-center justify-items-end">
                <div className="flex h-[90%] w-[50%] items-center justify-center p-4 gap-10 border-r-1">
                    <IoMdNotificationsOutline size={24} />
                    <AiOutlineQuestionCircle size={22} />
                </div>
                <div className="flex flex-col h-full w-[50%] justify-center">
                    <div className="text-right w-full font-headline font-medium text-2xl">
                        {isLoading ? "…" : user?.business_name}
                    </div>
                    <div className="text-right w-full font-body text-sm">
                        {isLoading ? "" : user?.username}
                    </div>
                </div>
            </div>
        </div>
    )
}