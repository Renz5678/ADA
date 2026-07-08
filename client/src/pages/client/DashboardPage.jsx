import { useBusinesses, useCreateClientOrder } from "#hooks/useClient.js";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ClientDashboardPage() {
    const { data: businesses, isLoading } = useBusinesses();
    const createOrderMut = useCreateClientOrder();

    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [orderForm, setOrderForm] = useState({ total_amount: "", deadline: "" });
    const [isOrdering, setIsOrdering] = useState(false);

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
        <div className="flex flex-col gap-6 w-full h-full p-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-headline font-semibold text-[#0F1D29]">Business Directory</h1>
                    <p className="text-[#8D4A52] font-body text-sm mt-1">
                        Find freelancers and request orders directly.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 font-body">
                {businesses?.map(business => (
                    <div key={business.user_id} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition">
                        <div>
                            <h3 className="text-xl font-headline font-bold text-[#0F1D29]">{business.business_name}</h3>
                            <p className="text-gray-500 text-sm mt-1">{business.username}</p>
                            <p className="text-gray-500 text-sm">{business.email}</p>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedBusiness(business);
                                setIsOrdering(true);
                            }}
                            className="mt-6 bg-[#0F1D29] text-white py-2 rounded-lg font-medium hover:bg-[#8D4A52] transition"
                        >
                            Request Order
                        </button>
                    </div>
                ))}
            </div>

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
