// src/components/orders/OrdersTable.jsx
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import { STATUS_STYLES } from '../../constants/orderStatus';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });

const OrdersTable = ({ orders, isFetching, onView, onOpen, onDelete }) => {
  if (orders.length === 0) {
    return <div className="text-center py-10 text-gray-500">No orders found.</div>;
  }

  return (
    <div className={`overflow-x-auto rounded-lg border border-gray-200 ${isFetching ? 'opacity-60' : ''}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                <td className="px-4 py-3 text-right space-x-2">
                    <Button variant="primary" onClick={() => onView(order.order_id)}>View</Button>
                    <Button variant="secondary" onClick={() => onOpen(order.order_id)}>Edit</Button>
                    <Button variant="secondary" onClick={() => onDelete(order.order_id)}>Delete</Button>
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