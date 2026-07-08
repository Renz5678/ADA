import { AiOutlineQuestionCircle } from "react-icons/ai";
import { useCurrentUser, useUpdateBusinessName } from "#hooks/useUser.js";
import GlobalSearch from "./GlobalSearch.jsx";
import NotificationDropdown from "./NotificationDropdown.jsx";
import { useState, useRef, useEffect } from "react";
import { MdEdit, MdCheck, MdClose } from "react-icons/md";

export default function Topbar() {
    const { data: user, isLoading } = useCurrentUser();
    const updateBusinessNameMut = useUpdateBusinessName();
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleEditClick = () => {
        setNewName(user?.business_name || "");
        setIsEditing(true);
    };

    const handleSave = () => {
        if (newName.trim() && newName !== user?.business_name) {
            updateBusinessNameMut.mutate({ business_name: newName });
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') handleCancel();
    };

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
                <div className="flex flex-col justify-center min-w-0 max-w-[150px] sm:max-w-[200px] lg:max-w-[250px] group relative">
                    {isEditing ? (
                        <div className="flex items-center gap-1">
                            <input 
                                ref={inputRef}
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full text-right font-headline font-medium text-sm sm:text-base lg:text-xl text-[#0F1D29] bg-gray-50 border border-[#8D4A52] rounded px-1 outline-none"
                            />
                            <button onClick={handleSave} className="text-green-600 hover:bg-green-50 p-1 rounded"><MdCheck size={16} /></button>
                            <button onClick={handleCancel} className="text-red-500 hover:bg-red-50 p-1 rounded"><MdClose size={16} /></button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-end gap-2">
                            <button 
                                onClick={handleEditClick}
                                className="hidden group-hover:block text-gray-400 hover:text-[#8D4A52] transition shrink-0"
                                title="Edit Business Name"
                            >
                                <MdEdit size={16} />
                            </button>
                            <div className="text-right font-headline font-medium text-sm sm:text-base lg:text-xl truncate text-[#0F1D29]">
                                {isLoading ? "…" : user?.business_name}
                            </div>
                        </div>
                    )}
                    <div className="text-right font-body text-xs text-gray-500 truncate hidden sm:block">
                        {isLoading ? "" : user?.username}
                    </div>
                </div>
            </div>
        </div>
    )
}