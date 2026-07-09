import { useClientOrders } from "#hooks/useClient.js";

export default function ClientOrdersPage() {
    const { data: orders, isLoading } = useClientOrders();

    if (isLoading) {
        return <div className="p-4 font-body">Loading orders...</div>;
    }

    return (
        <div className="flex flex-col gap-6 w-full h-full p-2 font-body">
            <div>
                <h1 className="text-2xl md:text-3xl font-headline font-semibold text-[#0F1D29]">My Orders</h1>
                <p className="text-[#8D4A52] text-sm mt-1">
                    Track the status of your requested orders.
                </p>
            </div>

            <div className="overflow-x-auto w-full border border-gray-200 rounded-xl">
                <table className="w-full text-left text-sm text-gray-500 whitespace-nowrap">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Items</th>
                            <th className="px-6 py-4">Freelancer</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Total Amount</th>
                            <th className="px-6 py-4">Deadline</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders?.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center">No orders found.</td>
                            </tr>
                        )}
                        {orders?.map((order) => (
                            <tr key={order.order_id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    #{order.order_id}
                                </td>
                                <td className="px-6 py-4">
                                    {order.OrderItems && order.OrderItems.length > 0 ? (
                                        <div className="flex -space-x-2 overflow-hidden items-center group">
                                            {order.OrderItems.slice(0, 3).map((item, idx) => (
                                                item.Product?.image_url ? (
                                                    <img key={idx} className="inline-block h-8 w-8 sm:h-10 sm:w-10 rounded-full ring-2 ring-white object-cover group-hover:scale-105 transition-transform" src={item.Product.image_url} alt={item.Product?.product_name || "Product"} title={item.Product?.product_name} />
                                                ) : (
                                                    <div key={idx} className="inline-flex h-8 w-8 sm:h-10 sm:w-10 rounded-full ring-2 ring-white items-center justify-center bg-gray-200 text-xs font-medium text-gray-500 z-10" title={item.Product?.product_name}>
                                                        {item.Product?.product_name?.charAt(0) || "P"}
                                                    </div>
                                                )
                                            ))}
                                            {order.OrderItems.length > 3 && (
                                                <div className="inline-flex h-8 w-8 sm:h-10 sm:w-10 rounded-full ring-2 ring-white items-center justify-center bg-gray-100 text-xs font-medium text-gray-500 z-10">
                                                    +{order.OrderItems.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic">No items</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {order.User?.business_name || "Unknown"}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                        ${order.status === 'Done' || order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                            order.status === 'Awaiting Freelancer Confirmation' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-blue-100 text-blue-800'}`}
                                    >
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    ₱{Number(order.total_amount).toFixed(2)}
                                </td>
                                <td className="px-6 py-4">
                                    {order.deadline ? new Date(order.deadline).toLocaleDateString() : "-"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
