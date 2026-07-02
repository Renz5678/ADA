import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '#hooks/useOrders.js';
import OrdersTable from '#components/orders/OrdersTable.jsx';
import Button from '#components/ui/Button.jsx';

export default function OrdersPage() {
    const [page, setPage] = useState(1);
    const limit = 10;
    const navigate = useNavigate();

    const { data, isLoading, isError, error, isFetching } = useOrders(page, limit);

    const handleOpenOrder = (id) => navigate(`/orders/${id}`);

    const handleDelete = (id) => {
        // TODO: confirm() + call deleteOrder(id) from api/orders.js, then invalidate the 'orders' query
    };

    if (isLoading) return <div>Loading orders...</div>;
    if (isError) return <div>Error: {error.message}</div>;

    return (
        <div className="p-6">
            <div className="w-full flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold">Orders</h1>
                <Button variant="primary" onClick={() => navigate('/orders/new')}>New Order</Button>
            </div>

            <OrdersTable
                orders={data.orders}
                isFetching={isFetching}
                onOpen={handleOpenOrder}
                onDelete={handleDelete}
            />

            {data.totalCount > 0 && (
                <div className="flex items-center justify-between mt-4">
                    <Button
                        variant="secondary"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                        Page {data.currentPage} of {data.totalPages}
                    </span>
                    <Button
                        variant="secondary"
                        disabled={page === data.totalPages}
                        onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}