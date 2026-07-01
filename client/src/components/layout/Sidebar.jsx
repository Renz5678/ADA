import Navitem from "./Navitem"
import { useState } from "react";
import { MdOutlineDashboard, MdOutlineReceiptLong, MdOutlineCases, MdOutlineShoppingCart } from "react-icons/md";

const navItems = {
    "Dashboard": {
        "name": "Dashboard",
        "icon": MdOutlineDashboard
    },
    "Orders": {
        "name": "Orders",
        "icon": MdOutlineReceiptLong
    },
    "Products": {
        "name": "Products",
        "icon": MdOutlineCases
    },
    "Expenses":
    {
        "name": "Expenses",
        "icon": MdOutlineShoppingCart
    },
}

export default function Sidebar() {
    const [activeNav, setActiveNav] = useState("Dashboard");

    return (
        <div className="flex flex-none flex-col w-[20%] h-full bg-[#0F1D29] p-4">
            <div className="font-headline text-white font-semibold text-4xl text-left p-2">
                ADA
            </div>
            <div className="font-body text-[#BAC8D8] font-medium px-2">
                Create. Sell. Track
            </div>

            <div className="flex flex-col gap-2 mt-8">
                {Object.values(navItems).map(({ name, icon }) => (
                    <Navitem
                        key={name}
                        navName={name}
                        isActive={activeNav === name}
                        onClick={() => setActiveNav(name)
                        }
                        icon={icon}
                    />
                ))}
            </div>
        </div>
    )
}