import { useParams, Link } from "react-router-dom";
import { useBusinessDetails, useCreateClientOrder } from "#hooks/useClient.js";
import { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { MdArrowBack, MdOutlineLocalOffer } from "react-icons/md";

export default function BusinessDetailsPage() {
    const { id } = useParams();
    const { data: business, isLoading } = useBusinessDetails(id);
    const createOrderMut = useCreateClientOrder();

    const [orderForm, setOrderForm] = useState({ total_amount: "", deadline: "" });
    const [isOrdering, setIsOrdering] = useState(false);

    const handleRequestOrder = async (e) => {
        e.preventDefault();
        try {
            await createOrderMut.mutateAsync({
                freelancer_id: id,
                total_amount: parseFloat(orderForm.total_amount),
                deadline: orderForm.deadline
            });
            toast.success("Order requested successfully!");
            setOrderForm({ total_amount: "", deadline: "" });
            setIsOrdering(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to request order");
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center p-4 font-body">
                <div className="animate-pulse text-gray-500">Loading business details...</div>
            </div>
        );
    }

    if (!business) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 font-body gap-4">
                <p className="text-gray-500 text-lg">Business not found</p>
                <Link to="/client/dashboard" className="text-[#8D4A52] hover:underline flex items-center gap-2">
                    <MdArrowBack /> Back to Directory
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-full p-4 lg:p-8 overflow-y-auto">
            {/* Header / Profile Section */}
            <div className="bg-white rounded-3xl p-8 border border-[#E5E7EB] shadow-sm relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#FFF7E6] to-transparent opacity-60 rounded-bl-full pointer-events-none"></div>
                
                <Link to="/client/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#8D4A52] transition-colors font-body text-sm mb-6 z-10 relative">
                    <MdArrowBack /> Back to Directory
                </Link>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 z-10 relative">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-2xl bg-[#0F1D29] text-white flex items-center justify-center font-headline font-bold text-4xl shadow-md">
                            {business.business_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl font-headline font-bold text-[#0F1D29]">{business.business_name}</h1>
                            <p className="text-gray-500 font-body mt-1">@{business.username} • {business.email}</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => setIsOrdering(true)}
                        className="bg-[#8D4A52] text-white px-8 py-3 rounded-full font-medium hover:bg-[#0F1D29] transition-colors shadow-md"
                    >
                        Request Order
                    </button>
                </div>
            </div>

            {/* Products Catalog */}
            <div className="mb-6">
                <h2 className="text-2xl font-headline font-semibold text-[#0F1D29] mb-2">Product Catalog</h2>
                <p className="text-gray-500 font-body text-sm">Browse the items offered by this business.</p>
            </div>

            {business.Products && business.Products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 font-body">
                    {business.Products.map((product, idx) => (
                        <motion.div 
                            key={product.product_id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#CBA0AA] transition-all duration-300 flex flex-col"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#FFF7E6] text-[#8D4A52] flex items-center justify-center mb-4">
                                <MdOutlineLocalOffer size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-[#0F1D29] mb-1 line-clamp-2">{product.product_name}</h3>
                            
                            <div className="mt-auto pt-4 flex items-center justify-between">
                                <span className="text-gray-500 text-sm">Price</span>
                                <span className="text-xl font-bold text-[#8D4A52]">₱{parseFloat(product.price).toFixed(2)}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-50 rounded-2xl p-12 flex flex-col items-center justify-center text-center border border-gray-100 border-dashed">
                    <MdOutlineLocalOffer size={48} className="text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-[#0F1D29] mb-1">No products found</h3>
                    <p className="text-gray-500 font-body max-w-sm">This business hasn't listed any products in their catalog yet.</p>
                </div>
            )}

            {/* Order Modal */}
            {isOrdering && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-body backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
                    >
                        <h2 className="text-2xl font-bold text-[#0F1D29] mb-2">Request Order</h2>
                        <p className="text-gray-500 text-sm mb-6">Send an order request to {business.business_name}.</p>
                        
                        <form onSubmit={handleRequestOrder} className="flex flex-col gap-5">
                            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                                Estimated Total Amount (₱)
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    required
                                    value={orderForm.total_amount}
                                    onChange={e => setOrderForm(prev => ({ ...prev, total_amount: e.target.value }))}
                                    className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#8D4A52] focus:ring-1 focus:ring-[#8D4A52] transition-all"
                                    placeholder="e.g. 150.00"
                                />
                            </label>
                            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                                Deadline (Optional)
                                <input
                                    type="date"
                                    value={orderForm.deadline}
                                    onChange={e => setOrderForm(prev => ({ ...prev, deadline: e.target.value }))}
                                    className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#8D4A52] focus:ring-1 focus:ring-[#8D4A52] transition-all"
                                />
                            </label>
                            <div className="flex gap-3 mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setIsOrdering(false)} 
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={createOrderMut.isPending} 
                                    className="flex-1 px-4 py-3 bg-[#0F1D29] text-white font-medium rounded-xl hover:bg-[#8D4A52] transition-colors disabled:opacity-70"
                                >
                                    {createOrderMut.isPending ? "Sending..." : "Send Request"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
