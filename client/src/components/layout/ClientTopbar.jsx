import ClientNotificationDropdown from './ClientNotificationDropdown.jsx';

export default function ClientTopbar() {
    return (
        <div className="flex flex-none w-full bg-[#FFFFFF] border-b-3 border-[#dddddd] h-14 sm:h-16 md:h-[12%] items-center px-3 sm:px-4 justify-between z-40">
            <div className="flex-none w-8 lg:w-14 shrink-0" />
            <div className="flex items-center gap-4 shrink-0">
                <ClientNotificationDropdown />
                <div className="flex flex-col justify-center min-w-0 max-w-[150px] sm:max-w-[200px] lg:max-w-[250px] group relative">
                    <div className="text-right font-headline font-medium text-sm sm:text-base lg:text-xl truncate text-[#0F1D29]">
                        Client Dashboard
                    </div>
                </div>
            </div>
        </div>
    )
}
