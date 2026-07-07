import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getOrderById, getOrderItemsByOrder, createOrder, createOrderItem, updateOrderItem, deleteOrderItem, updateOrder } from '#api/orders.js';
import { useProducts } from '#hooks/useProducts.js';
import Button from '#components/ui/Button.jsx';
import Badge from '#components/ui/Badge.jsx';
import Skeleton from '#components/ui/Skeleton.jsx';
import ProductSearchInput from '#components/orders/ProductSearchInput.jsx';
import { STATUS_STYLES } from '#constants/orderStatus.js';
import { MdClose, MdWarning } from 'react-icons/md';

const todayISO = () => new Date().toISOString().split('T')[0];

const OrderItemRow = ({ item, onUpdate, onDelete }) => {
    const price = Number(item.Product?.price ?? 0);
    
    return (
        <tr className="border-t">
            <td className="py-2">{item.Product?.product_name ?? `#${item.product_id}`}</td>
            <td className="py-2">
                <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                        const newQty = Number(e.target.value);
                        if (newQty >= 1) {
                            onUpdate(item, newQty);
                        }
                    }}
                    className="border rounded-lg px-2 py-1 w-16"
                />
            </td>
            <td className="py-2">₱{(price * item.quantity).toFixed(2)}</td>
            <td className="py-2 text-right">
                <button
                    onClick={() => onDelete(item)}
                    className="text-[#AB626A] hover:text-[#7a3e46]"
                >
                    <MdClose />
                </button>
            </td>
        </tr>
    );
};

export default function OrderEditorPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const isNew = orderId === undefined;
    const isDraft = isNew || location.state?.newlyCreated;

    // Local state — only meaningful while isNew (before the order exists in the DB)
    const [localDate, setLocalDate] = useState(todayISO());
    const [localDeadline, setLocalDeadline] = useState('');
    const [localStatus, setLocalStatus] = useState('Pending');
    const [localCustomerName, setLocalCustomerName] = useState('');

    // Add-item mini-form state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    
    const [localItems, setLocalItems] = useState([]);

    const { data: products, isError: isProductsError } = useProducts();

    const { data: order, isError: isOrderError, error: orderError } = useQuery({
        queryKey: ['order', orderId],
        queryFn: () => getOrderById(orderId),
        enabled: !isNew
    });

    const { data: items, isError: isItemsError } = useQuery({
        queryKey: ['order-items', orderId],
        queryFn: () => getOrderItemsByOrder(orderId),
        enabled: !isNew
    });

    // What the date/status inputs actually display: local state when new, server data once it exists
    const displayDate = isNew ? localDate : (order?.order_date ?? '');
    const displayDeadline = isNew ? localDeadline : (order?.deadline ?? '');
    const displayStatus = isNew ? localStatus : (order?.status ?? 'Pending');
    
    const displayItems = isNew ? localItems : (items ?? []);
    
    // Dirty check for useBlocker and beforeunload
    const isDirty = isNew && (localItems.length > 0 || localDate !== todayISO() || localDeadline !== '' || localStatus !== 'Pending');

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // Navigation blocking within the app is not supported without a data router,
    // so we rely solely on the beforeunload event for browser-level warnings.

    const invalidateOrderQueries = (id) => {
        queryClient.invalidateQueries({ queryKey: ['order', id] });
        queryClient.invalidateQueries({ queryKey: ['order-items', id] });
        queryClient.invalidateQueries({ queryKey: ['orders'] }); // so the list page total/status refreshes too
        queryClient.invalidateQueries({ queryKey: ['materials'] });
    };

    const addItemMutation = useMutation({
        mutationFn: async () => {
            await createOrderItem({
                order_id: orderId,
                product_id: selectedProduct.product_id,
                quantity: Number(quantity)
            });
        },
        onSuccess: () => {
            invalidateOrderQueries(orderId);
            setSelectedProduct(null);
            setQuantity(1);
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

    const handleUpdateItem = (item, newQty) => {
        if (isNew) {
            setLocalItems(prev => prev.map(i => i.order_item_id === item.order_item_id ? { ...i, quantity: newQty } : i));
        } else {
            updateItemMutation.mutate({ itemId: item.order_item_id, quantity: newQty });
        }
    };

    const handleDeleteItem = (item) => {
        if (isNew) {
            setLocalItems(prev => prev.filter(i => i.order_item_id !== item.order_item_id));
        } else {
            deleteItemMutation.mutate(item.order_item_id);
        }
    };

    const createOrderOnlyMutation = useMutation({
        mutationFn: async () => {
            const newOrder = await createOrder({ order_date: localDate, deadline: localDeadline || null, status: localStatus, customer_name: localCustomerName || null });
            for (const item of localItems) {
                await createOrderItem({
                    order_id: newOrder.order_id,
                    product_id: item.product_id,
                    quantity: item.quantity
                });
            }
            return newOrder.order_id;
        },
        onSuccess: (newOrderId) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['materials'] });
            toast.success(`Order #${newOrderId} created successfully!`);
            navigate('/orders/' + newOrderId);
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to create order.')
    });

    const updateDetailsMutation = useMutation({
        mutationFn: (updates) => updateOrder(orderId, updates),
        onSuccess: () => {
            invalidateOrderQueries(orderId);
            toast.success('Order updated!');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to update order.')
    });

    const statusStyle = STATUS_STYLES[displayStatus] ?? STATUS_STYLES.Pending;
    const computedTotal = isNew 
        ? localItems.reduce((acc, item) => acc + (item.quantity * item.price), 0)
        : Number(order?.total_amount ?? 0);

    if (!isNew && (isOrderError || isItemsError || isProductsError)) return (
        <div className="w-full text-center py-20 text-red-600">
            Error loading order or products: {orderError?.message || 'Unknown error occurred.'}
        </div>
    );

    if (!isNew && !order) return (
        <div className="w-full flex flex-col gap-4">
            <Skeleton className="h-10 w-48 mb-4" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
    );

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-lg sm:text-xl font-semibold">{isNew ? 'New Order' : `Order #${orderId}`}</h1>
                <Badge label={displayStatus} bgColor={statusStyle.bgColor} textColor={statusStyle.textColor} />
            </div>

            {/* Order details */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 mb-4 flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex-1">
                    <label className="block text-sm mb-1">Customer Name <span className="text-gray-400 text-xs">(optional)</span></label>
                    <input
                        type="text"
                        value={isNew ? localCustomerName : (order?.customer_name ?? '')}
                        onChange={(e) => {
                            if (isNew) setLocalCustomerName(e.target.value);
                            else updateDetailsMutation.mutate({ customer_name: e.target.value || null });
                        }}
                        placeholder="e.g. Maria Santos"
                        className="border rounded-lg px-3 py-2 w-full"
                    />
                </div>
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
                <div className="flex-1">
                    <label className="block text-sm mb-1">Deadline (Optional)</label>
                    <input
                        type="date"
                        value={displayDeadline}
                        onChange={(e) => {
                            if (isNew) {
                                setLocalDeadline(e.target.value);
                            } else {
                                updateDetailsMutation.mutate({ deadline: e.target.value || null });
                            }
                        }}
                        className="border rounded-lg px-3 py-2 w-full"
                    />
                </div>
            </div>

            {/* Add items */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 mb-4">
                <h2 className="font-medium mb-3">Add Items</h2>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
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
                        disabled={!selectedProduct || addItemMutation.isPending || updateItemMutation.isPending}
                        onClick={() => {
                            if (isNew) {
                                const existingItem = localItems.find(i => i.product_id === selectedProduct.product_id);
                                if (existingItem) {
                                    const confirmUpdate = window.confirm(`"${selectedProduct.product_name}" is already on the list. Do you want to add ${quantity} more to its quantity?`);
                                    if (confirmUpdate) {
                                        setLocalItems(prev => prev.map(i => i.product_id === selectedProduct.product_id 
                                            ? { ...i, quantity: Number(i.quantity) + Number(quantity) } 
                                            : i));
                                        setSelectedProduct(null);
                                        setQuantity(1);
                                    }
                                } else {
                                    setLocalItems(prev => [...prev, {
                                        order_item_id: `local-${Date.now()}`,
                                        product_id: selectedProduct.product_id,
                                        quantity: Number(quantity),
                                        price: Number(selectedProduct.price),
                                        Product: selectedProduct
                                    }]);
                                    setSelectedProduct(null);
                                    setQuantity(1);
                                }
                            } else {
                                const existingItem = items?.find(i => i.product_id === selectedProduct.product_id);
                                if (existingItem) {
                                    const confirmUpdate = window.confirm(`"${selectedProduct.product_name}" is already on the list. Do you want to add ${quantity} more to its quantity?`);
                                    if (confirmUpdate) {
                                        const newQty = Number(existingItem.quantity) + Number(quantity);
                                        updateItemMutation.mutate(
                                            { itemId: existingItem.order_item_id, quantity: newQty },
                                            {
                                                onSuccess: () => {
                                                    setSelectedProduct(null);
                                                    setQuantity(1);
                                                }
                                            }
                                        );
                                    }
                                    return; 
                                }
                                addItemMutation.mutate();
                            }
                        }}
                    >
                        + Add Item
                    </Button>
                </div>
            </div>

            {/* Line items */}
            <div className="bg-white rounded-2xl p-6 mb-4">
                {(!displayItems || displayItems.length === 0) ? (
                    <p className="text-center text-gray-500 py-10">
                        No items added yet — search a product code above to get started
                    </p>
                ) : (
                    <>
                    {isNew && (
                        <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-lg flex items-center gap-1">
                            <MdWarning /> Stock will be checked when you click &ldquo;Add Order&rdquo;. Ensure materials are stocked.
                        </div>
                    )}
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
                            {displayItems.map((item) => (
                                <OrderItemRow 
                                    key={item.order_item_id} 
                                    item={item} 
                                    onUpdate={handleUpdateItem} 
                                    onDelete={handleDeleteItem} 
                                />
                            ))}
                        </tbody>
                    </table>
                    </>
                )}

                <div className="flex justify-end mt-4 pt-4 border-t">
                    <div className="text-right">
                        <div className="text-xs uppercase text-gray-500">Total Amount</div>
                        <div className="text-2xl font-headline font-semibold text-[#8D4A52]">
                            ₱{computedTotal.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => navigate('/orders')}>
                    {isDraft ? 'Cancel' : 'Back to Orders'}
                </Button>
                <Button 
                    variant="primary" 
                    disabled={createOrderOnlyMutation.isPending} 
                    onClick={() => {
                        if (isNew) {
                            if (localItems.length === 0) {
                                if(!window.confirm("You haven't added any items. Are you sure you want to create an empty order?")) return;
                            }
                            createOrderOnlyMutation.mutate();
                        } else {
                            toast.success(`Order #${orderId} saved!`);
                            navigate('/orders');
                        }
                    }}
                >
                    {createOrderOnlyMutation.isPending ? 'Saving...' : (isDraft ? 'Add Order' : 'Save Order')}
                </Button>
            </div>
        </div>
    );
}