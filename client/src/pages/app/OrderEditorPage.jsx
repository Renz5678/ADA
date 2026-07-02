import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrderById, getOrderItemsByOrder, createOrder, createOrderItem, updateOrderItem, deleteOrderItem, updateOrder } from '#api/orders.js';
import { useProducts } from '#hooks/useProducts.js';
import Button from '#components/ui/Button.jsx';
import Badge from '#components/ui/Badge.jsx';
import ProductSearchInput from '#components/orders/ProductSearchInput.jsx';
import { STATUS_STYLES } from '#constants/orderStatus.js';

const todayISO = () => new Date().toISOString().split('T')[0];

export default function OrderEditorPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isNew = orderId === undefined;

    // Local state — only meaningful while isNew (before the order exists in the DB)
    const [localDate, setLocalDate] = useState(todayISO());
    const [localStatus, setLocalStatus] = useState('Pending');

    // Add-item mini-form state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const { data: products } = useProducts();

    const { data: order } = useQuery({
        queryKey: ['order', orderId],
        queryFn: () => getOrderById(orderId),
        enabled: !isNew
    });

    const { data: items } = useQuery({
        queryKey: ['order-items', orderId],
        queryFn: () => getOrderItemsByOrder(orderId),
        enabled: !isNew
    });

    // What the date/status inputs actually display: local state when new, server data once it exists
    const displayDate = isNew ? localDate : (order?.order_date ?? '');
    const displayStatus = isNew ? localStatus : (order?.status ?? 'Pending');

    const invalidateOrderQueries = (id) => {
        queryClient.invalidateQueries({ queryKey: ['order', id] });
        queryClient.invalidateQueries({ queryKey: ['order-items', id] });
        queryClient.invalidateQueries({ queryKey: ['orders'] }); // so the list page total/status refreshes too
    };

    const addItemMutation = useMutation({
        mutationFn: async () => {
            let currentOrderId = orderId;

            if (isNew) {
                const newOrder = await createOrder({ order_date: localDate, status: localStatus });
                currentOrderId = newOrder.order_id;
            }

            await createOrderItem({
                order_id: currentOrderId,
                product_id: selectedProduct.product_id,
                quantity: Number(quantity)
            });

            return currentOrderId;
        },
        onSuccess: (currentOrderId) => {
            invalidateOrderQueries(currentOrderId);
            setSelectedProduct(null);
            setQuantity(1);

            if (isNew) {
                navigate(`/orders/${currentOrderId}`, { replace: true });
            }
        }
    });

    const updateItemMutation = useMutation({
        mutationFn: ({ itemId, quantity }) => updateOrderItem(itemId, { quantity: Number(quantity) }),
        onSuccess: () => invalidateOrderQueries(orderId)
    });

    const deleteItemMutation = useMutation({
        mutationFn: (itemId) => deleteOrderItem(itemId),
        onSuccess: () => invalidateOrderQueries(orderId)
    });

    const updateDetailsMutation = useMutation({
        mutationFn: (updates) => updateOrder(orderId, updates),
        onSuccess: () => invalidateOrderQueries(orderId)
    });

    const statusStyle = STATUS_STYLES[displayStatus] ?? STATUS_STYLES.Pending;

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold">{isNew ? 'New Order' : `Order #${orderId}`}</h1>
                <Badge label={displayStatus} bgColor={statusStyle.bgColor} textColor={statusStyle.textColor} />
            </div>

            {/* Order details */}
            <div className="bg-white rounded-2xl p-6 mb-4 flex gap-6">
                <div className="flex-1">
                    <label className="block text-sm mb-1">Order Date</label>
                    <input
                        type="date"
                        value={displayDate}
                        onChange={(e) => {
                            if (isNew) {
                                setLocalDate(e.target.value);
                            } else {
                                updateDetailsMutation.mutate({ order_date: e.target.value });
                            }
                        }}
                        className="border rounded-lg px-3 py-2 w-full"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm mb-1">Order Status</label>
                    <select
                        value={displayStatus}
                        onChange={(e) => {
                            if (isNew) {
                                setLocalStatus(e.target.value);
                            } else {
                                updateDetailsMutation.mutate({ status: e.target.value });
                            }
                        }}
                        className="border rounded-lg px-3 py-2 w-full"
                    >
                        {Object.keys(STATUS_STYLES).map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Add items */}
            <div className="bg-white rounded-2xl p-6 mb-4">
                <h2 className="font-medium mb-3">Add Items</h2>
                <div className="flex gap-3 items-end">
                    <div className="flex-1">
                        <label className="block text-sm mb-1">Product Search</label>
                        <ProductSearchInput
                            products={products ?? []}
                            value={selectedProduct}
                            onChange={setSelectedProduct}
                        />
                    </div>
                    <div className="w-24">
                        <label className="block text-sm mb-1">Quantity</label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="border rounded-lg px-3 py-2 w-full"
                        />
                    </div>
                    <Button
                        variant="primary"
                        disabled={!selectedProduct || addItemMutation.isPending}
                        onClick={() => addItemMutation.mutate()}
                    >
                        + Add Item
                    </Button>
                </div>
            </div>

            {/* Line items */}
            <div className="bg-white rounded-2xl p-6 mb-4">
                {(!items || items.length === 0) ? (
                    <p className="text-center text-gray-500 py-10">
                        No items added yet — search a product code above to get started
                    </p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs text-gray-500 uppercase">
                                <th className="pb-2">Product Name</th>
                                <th className="pb-2">Qty</th>
                                <th className="pb-2">Subtotal</th>
                                <th className="pb-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.order_item_id} className="border-t">
                                    <td className="py-2">{item.Product?.product_name ?? `#${item.product_id}`}</td>
                                    <td className="py-2">
                                        <input
                                            type="number"
                                            min="1"
                                            defaultValue={item.quantity}
                                            onBlur={(e) => {
                                                if (Number(e.target.value) !== item.quantity) {
                                                    updateItemMutation.mutate({ itemId: item.order_item_id, quantity: e.target.value });
                                                }
                                            }}
                                            className="border rounded-lg px-2 py-1 w-16"
                                        />
                                    </td>
                                    <td className="py-2">₱{Number(item.subtotal).toFixed(2)}</td>
                                    <td className="py-2 text-right">
                                        <button
                                            onClick={() => deleteItemMutation.mutate(item.order_item_id)}
                                            className="text-[#AB626A] hover:underline"
                                        >
                                            ✕
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <div className="flex justify-end mt-4 pt-4 border-t">
                    <div className="text-right">
                        <div className="text-xs uppercase text-gray-500">Total Amount</div>
                        <div className="text-2xl font-headline font-semibold text-[#8D4A52]">
                            ₱{Number(order?.total_amount ?? 0).toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => navigate('/orders')}>
                    {isNew ? 'Cancel' : 'Back to Orders'}
                </Button>
            </div>
        </div>
    );
}