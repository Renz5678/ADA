import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MdOutlineWorkOutline, MdOutlinePersonOutline } from "react-icons/md";
import Icon from "#components/ui/Icon.jsx";

export default function LandingPage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-screen h-screen bg-[#FFF7E6] flex justify-center items-center overflow-y-auto py-10"
        >
            <div className="w-[90%] md:w-[60%] lg:w-[40%] flex flex-col gap-6 items-center">

                {/* Brand */}
                <div className="text-center mb-4">
                    <div className="font-headline text-5xl text-[#0F1D29] font-semibold flex items-center justify-center gap-4">
                        <Icon height={4} width={4} />
                        ADA
                    </div>
                    <p className="font-label text-[#551E26] mt-3">Welcome to ADA. Are you a freelancer or a client?</p>
                </div>

                {/* Card */}
                <div className="w-full bg-white rounded-3xl flex flex-col md:flex-row items-stretch overflow-hidden shadow-sm font-body border border-[#e8d5b5]">
                    {/* Freelancer Option */}
                    <div className="flex-1 flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-[#e8d5b5] hover:bg-gray-50 transition">
                        <div className="bg-[#FFF7E6] p-4 rounded-full mb-4">
                            <MdOutlineWorkOutline size={40} className="text-[#8D4A52]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#0F1D29] mb-2">Freelancer</h2>
                        <p className="text-sm text-center text-gray-500 mb-6">Manage your orders, inventory, and clients all in one place.</p>
                        <Link to="/login" className="mt-auto px-6 py-2 bg-[#8D4A52] text-white rounded-full font-medium hover:bg-[#0F1D29] transition w-full text-center">
                            Login as Freelancer
                        </Link>
                    </div>

                    {/* Client Option */}
                    <div className="flex-1 flex flex-col items-center justify-center p-8 hover:bg-gray-50 transition">
                        <div className="bg-[#FFF7E6] p-4 rounded-full mb-4">
                            <MdOutlinePersonOutline size={40} className="text-[#8D4A52]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#0F1D29] mb-2">Client</h2>
                        <p className="text-sm text-center text-gray-500 mb-6">Track your orders and discover top-rated freelancers.</p>
                        <Link to="/login-client" className="mt-auto px-6 py-2 bg-[#0F1D29] text-white rounded-full font-medium hover:bg-[#8D4A52] transition w-full text-center">
                            Login as Client
                        </Link>
                    </div>
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
