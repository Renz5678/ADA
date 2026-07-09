import { useBusinesses, useCreateClientOrder } from "#hooks/useClient.js";
import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MdSearch, MdStorefront } from "react-icons/md";

export default function ClientDashboardPage() {
    const { data: businesses, isLoading } = useBusinesses();
    const createOrderMut = useCreateClientOrder();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [orderForm, setOrderForm] = useState({ total_amount: "", deadline: "" });
    const [isOrdering, setIsOrdering] = useState(false);

    const filteredBusinesses = useMemo(() => {
        if (!businesses) return [];
        if (!searchQuery.trim()) return businesses;
        const q = searchQuery.toLowerCase();
        return businesses.filter(b => 
            b.business_name.toLowerCase().includes(q) || 
            b.username.toLowerCase().includes(q)
        );
    }, [businesses, searchQuery]);

    const handleRequestOrder = async (e) => {
        e.preventDefault();
        try {
            await createOrderMut.mutateAsync({
                freelancer_id: selectedBusiness.user_id,
                total_amount: parseFloat(orderForm.total_amount),
                deadline: orderForm.deadline
            });
            toast.success("Order requested successfully!");
            setSelectedBusiness(null);
            setOrderForm({ total_amount: "", deadline: "" });
            setIsOrdering(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to request order");
        }
    };

    if (isLoading) {
        return <div className="p-4 font-body">Loading directory...</div>;
    }

    return (
        <div className="flex flex-col gap-8 w-full h-full p-4 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-headline font-bold text-[#0F1D29] tracking-tight">
                        Business Directory
                    </h1>
                    <p className="text-[#8D4A52] font-body text-base mt-2 max-w-xl">
                        Discover top freelancers, explore their product catalogs, and request orders directly with ease.
                    </p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <MdSearch size={24} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by business or username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8D4A52] focus:border-transparent transition-all duration-200 font-body text-sm"
                    />
                </div>
            </div>

            {filteredBusinesses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 font-body">
                    <MdStorefront size={64} className="text-gray-300 mb-4" />
                    <p className="text-lg">No businesses found matching "{searchQuery}"</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 font-body">
                    {filteredBusinesses.map((business, idx) => (
                        <motion.div 
                            key={business.user_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                        >
                            <Link to={`/client/business/${business.user_id}`} className="block h-full group">
                                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex flex-col justify-between h-full shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#CBA0AA] transition-all duration-300 relative overflow-hidden">
                                    {/* Subtle gradient background decoration */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FFF7E6] to-transparent opacity-50 rounded-bl-full pointer-events-none"></div>
                                    
                                    <div className="z-10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-[#0F1D29] text-white flex items-center justify-center font-bold text-lg">
                                                {business.business_name.charAt(0).toUpperCase()}
                                            </div>
                                            <h3 className="text-xl font-headline font-bold text-[#0F1D29] group-hover:text-[#8D4A52] transition-colors line-clamp-1">
                                                {business.business_name}
                                            </h3>
                                        </div>
                                        <p className="text-gray-500 text-sm mt-3 font-medium">@{business.username}</p>
                                        <p className="text-gray-400 text-xs mt-1">{business.email}</p>
                                    </div>
                                    
                                    <div className="mt-6 flex justify-between items-center z-10 pt-4 border-t border-gray-100">
                                        <span className="text-sm font-semibold text-[#8D4A52] group-hover:underline">View Catalog &rarr;</span>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault(); // Prevent navigating to the details page
                                                setSelectedBusiness(business);
                                                setIsOrdering(true);
                                            }}
                                            className="bg-[#0F1D29] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#8D4A52] transition-colors"
                                        >
                                            Quick Request
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Simple Modal for Requesting Order */}
            {isOrdering && selectedBusiness && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-body">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-[#0F1D29] mb-4">Request Order from {selectedBusiness.business_name}</h2>
                        <form onSubmit={handleRequestOrder} className="flex flex-col gap-4">
                            <label className="flex flex-col gap-1 text-sm font-medium">
                                Estimated Total Amount ($)
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    required
                                    value={orderForm.total_amount}
                                    onChange={e => setOrderForm(prev => ({ ...prev, total_amount: e.target.value }))}
                                    className="border rounded-md px-3 py-2 outline-none focus:border-[#CBA0AA]"
                                />
                            </label>
                            <label className="flex flex-col gap-1 text-sm font-medium">
                                Deadline (Optional)
                                <input
                                    type="date"
                                    value={orderForm.deadline}
                                    onChange={e => setOrderForm(prev => ({ ...prev, deadline: e.target.value }))}
                                    className="border rounded-md px-3 py-2 outline-none focus:border-[#CBA0AA]"
                                />
                            </label>
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setIsOrdering(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md">Cancel</button>
                                <button type="submit" disabled={createOrderMut.isPending} className="px-4 py-2 bg-[#8D4A52] text-white rounded-md hover:bg-[#0F1D29] transition">
                                    {createOrderMut.isPending ? "Submitting..." : "Submit Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
