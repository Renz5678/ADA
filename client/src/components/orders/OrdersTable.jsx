// src/components/orders/OrdersTable.jsx
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import { STATUS_STYLES } from '../../constants/orderStatus';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });

const OrdersTable = ({ orders, isFetching, onOpen, onDelete, onMarkDone }) => {
  if (orders.length === 0) {
    return <div className="text-center py-10 text-gray-500">No orders found.</div>;
  }

  return (
    <div className={`flex-1 min-h-0 overflow-auto rounded-lg border border-[#c1c1c1] transition-opacity duration-150 ${isFetching ? 'opacity-60' : ''}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-[#F5F3F3] sticky top-0 z-10 shadow-[0_1px_0_0_#f0f0f0]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-[#0F1D29] uppercase font-label">Order ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[#0F1D29] uppercase font-label">Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[#0F1D29] uppercase font-label">Total</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[#0F1D29] uppercase font-label">Status</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-[#0F1D29] uppercase font-label">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {orders.map((order) => {
            const statusStyle = STATUS_STYLES[order.status] ?? STATUS_STYLES.Pending;
            return (
              <tr key={order.order_id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">#{order.order_id}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(order.order_date)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(order.total_amount)}</td>
                <td className="px-4 py-3">
                  <Badge label={order.status} bgColor={statusStyle.bgColor} textColor={statusStyle.textColor} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-row gap-2 justify-end">
                    {order.status !== 'Done' && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                        <Button variant="primary" onClick={() => onMarkDone(order.order_id)}>Mark Done</Button>
                    )}
                    <Button variant="secondary" onClick={() => onOpen(order.order_id)}>Edit</Button>
                    <Button variant="danger" onClick={() => onDelete(order)}>Delete</Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;