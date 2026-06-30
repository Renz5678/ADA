const navItems = [
    'Dashboard',
    'Orders',
    'Products',
    'Inventory'
]
import Navitem from "./Navitem"

export default function Sidebar() {
    return (
        <div className="flex flex-none flex-col w-[20%] h-full bg-[#0F1D29] p-4">
            <div className="font-headline text-white font-semibold text-4xl text-left p-2">
                ADA
            </div>
            <div className="font-body text-[#BAC8D8] font-medium px-2">
                Create. Sell. Track
            </div>

            <Navitem navName={'Dashboard'} />
        </div>
    )
}