import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MdOutlineWorkOutline } from "react-icons/md";
import Icon from "#components/ui/Icon.jsx";

export default function RoleSelectionPage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-screen h-screen bg-[#FFF7E6] flex justify-center items-center"
        >
            <div className="w-[80%] lg:w-[40%] flex flex-col gap-8 items-center">
                {/* Brand */}
                <div className="text-center">
                    <div className="font-headline text-5xl text-[#0F1D29] font-semibold flex items-center justify-center gap-4">
                        <Icon height={4} width={4} />
                        ADA
                    </div>
                    <p className="font-label text-[#551E26] mt-2">Welcome to ADA. Please select how you want to log in.</p>
                </div>

                {/* Cards Container */}
                <div className="w-full flex flex-col md:flex-row gap-6 font-body">
                    {/* Freelancer Card */}
                    <Link to="/login-freelancer" className="flex-1 bg-white rounded-3xl p-8 flex flex-col items-center hover:shadow-lg transition-all duration-300 border border-transparent hover:border-[#8D4A52] group">
                        <div className="h-16 w-16 bg-[#FDF0D5] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="text-[#8D4A52] text-2xl font-bold">F</span>
                        </div>
                        <h3 className="text-xl font-bold text-[#0F1D29] mb-2">Freelancer</h3>
                        <p className="text-sm text-gray-500 text-center mb-6">Log in to manage your products, orders, and business details.</p>
                        <span className="mt-auto px-6 py-2 bg-[#8D4A52] text-white rounded-full font-medium group-hover:bg-[#0F1D29] transition w-full text-center">
                            Login as Freelancer
                        </span>
                    </Link>

                    {/* Client Card */}
                    <Link to="/login-client" className="flex-1 bg-white rounded-3xl p-8 flex flex-col items-center hover:shadow-lg transition-all duration-300 border border-transparent hover:border-[#0F1D29] group">
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="text-[#0F1D29] text-2xl font-bold">C</span>
                        </div>
                        <h3 className="text-xl font-bold text-[#0F1D29] mb-2">Client</h3>
                        <p className="text-sm text-gray-500 text-center mb-6">Log in to browse the directory, request orders, and manage purchases.</p>
                        <span className="mt-auto px-6 py-2 bg-[#0F1D29] text-white rounded-full font-medium group-hover:bg-[#8D4A52] transition w-full text-center">
                            Login as Client
                        </span>
                    </Link>
                </div>

                {/* Marketplace Option */}
                <div className="w-full text-center mt-4">
                    <p className="text-gray-500 font-body mb-3">Just looking around?</p>
                    <Link to="/marketplace" className="inline-flex items-center gap-2 px-8 py-3 bg-[#E57A44] hover:bg-[#D46933] text-white rounded-full font-bold transition font-headline shadow-sm hover:shadow-md hover:-translate-y-0.5">
                        <MdOutlineWorkOutline size={20} />
                        Explore Marketplace
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
