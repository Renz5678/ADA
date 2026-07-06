import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrders, useOrderStats } from '#hooks/useOrders.js';
import { deleteOrder } from '#api/orders.js';
import OrdersTable from '#components/orders/OrdersTable.jsx';
import Button from '#components/ui/Button.jsx';
import { STATUS_STYLES } from '../../constants/orderStatus';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

export default function OrdersPage() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const limit = 10;
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: stats } = useOrderStats();
    const { data, isLoading, isError, error, isFetching } = useOrders(page, limit, statusFilter, searchQuery);

    const handleOpenOrder = (id) => navigate(`/orders/${id}`);

    const deleteMutation = useMutation({
        mutationFn: deleteOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
    });

    const handleDelete = (order) => {
        const confirmed = window.confirm(`Delete order #${order.order_id}? This can't be undone.`);
        if (confirmed) {
            deleteMutation.mutate(order.order_id);
        }
    };

    if (isLoading) return <div>Loading orders...</div>;
    if (isError) return <div>Error: {error.message}</div>;

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
        setPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    return (
        <div className="p-6 flex flex-col gap-6 animate-fadeIn w-full">
            <div className="w-full flex items-center justify-between">
                <h1 className="text-2xl font-semibold font-headline text-[#0F1D29]">Orders</h1>
                <Button variant="primary" onClick={() => navigate('/orders/new')}>+ New Order</Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0] flex flex-col gap-2">
                    <span className="text-sm font-label uppercase text-gray-500">Total Revenue (Active)</span>
                    <span className="text-2xl font-headline font-semibold text-[#8D4A52]">
                        {stats ? formatCurrency(stats.totalRevenue) : '...'}
                    </span>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0] flex flex-col gap-2">
                    <span className="text-sm font-label uppercase text-gray-500">Active Orders</span>
                    <span className="text-2xl font-headline font-semibold text-[#0F1D29]">
                        {stats ? stats.activeOrdersCount : '...'}
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0] flex flex-col gap-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="w-full sm:w-1/3">
                        <input
                            type="text"
                            placeholder="Search Order ID..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="border border-[#c1c1c1] rounded-lg px-3 py-2 w-full text-sm font-body"
                        />
                    </div>
                    <div className="w-full sm:w-1/4">
                        <select
                            value={statusFilter}
                            onChange={handleStatusChange}
                            className="border border-[#c1c1c1] rounded-lg px-3 py-2 w-full text-sm font-body bg-white"
                        >
                            <option value="">All Statuses</option>
                            {Object.keys(STATUS_STYLES).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
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
                        <span className="text-sm text-gray-600 font-body">
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
        </div>
    );
}