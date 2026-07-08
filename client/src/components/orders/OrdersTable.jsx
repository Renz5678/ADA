// src/components/orders/OrdersTable.jsx
import Badge from '../ui/Badge.jsx';
import { MdAssignment } from 'react-icons/md';
import Button from '../ui/Button.jsx';
import { STATUS_STYLES } from '../../constants/orderStatus';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });

const OrdersTable = ({ orders, isFetching, onOpen, onDelete, onMarkDone, onUpdateStatus }) => {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="text-5xl text-gray-400"><MdAssignment /></div>
        <p className="text-gray-500 font-body text-sm">No orders yet.</p>
        <p className="text-gray-400 text-xs">Create your first order using the button above.</p>
      </div>
    );
  }

  return (
    <div className={`flex-1 min-h-0 overflow-auto transition-opacity duration-150 ${isFetching ? 'opacity-60' : ''}`}>

      {/* ── Mobile card view (hidden md+) ── */}
      <div className="flex flex-col gap-3 md:hidden">
        {orders.map((order) => {
          const statusStyle = STATUS_STYLES[order.status] ?? STATUS_STYLES.Pending;
          return (
            <div key={order.order_id} className="bg-white rounded-xl border border-[#e8d5b5] p-4 flex flex-col gap-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-headline font-semibold text-[#0F1D29]">Order #{order.order_id}</span>
                  {order.customer_name && <span className="text-xs text-gray-500 font-body">{order.customer_name}</span>}
                </div>
                <Badge label={order.status} bgColor={statusStyle.bgColor} textColor={statusStyle.textColor} />
              </div>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <span className="text-gray-500">Date</span>
                <span className="text-right text-[#0F1D29]">{formatDate(order.order_date)}</span>
                <span className="text-gray-500">Total</span>
                <span className="text-right font-semibold text-[#8D4A52]">{formatCurrency(order.total_amount)}</span>
              </div>
              <div className="flex gap-2 pt-1 border-t border-[#f0f0f0]">
                {order.status === 'Awaiting Freelancer Confirmation' && (
                  <>
                    <Button variant="primary" onClick={() => onUpdateStatus(order.order_id, 'Pending')} className="flex-1">Confirm</Button>
                    <Button variant="danger" onClick={() => onUpdateStatus(order.order_id, 'Cancelled')} className="flex-1">Decline</Button>
                  </>
                )}
                {order.status !== 'Done' && order.status !== 'Delivered' && order.status !== 'Cancelled' && order.status !== 'Awaiting Freelancer Confirmation' && (
                  <Button variant="primary" onClick={() => onMarkDone(order.order_id)} className="flex-1">Mark Done</Button>
                )}
                <Button variant="secondary" onClick={() => onOpen(order.order_id)} className="flex-1">Open</Button>
                <Button variant="danger" onClick={() => onDelete(order)} className="flex-1">Delete</Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop table view (hidden below md) ── */}
      <div className="hidden md:block rounded-lg border border-[#c1c1c1] overflow-auto">
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
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-900">#{order.order_id}</span>
                      {order.customer_name && <span className="text-xs text-gray-400">{order.customer_name}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(order.order_date)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(order.total_amount)}</td>
                  <td className="px-4 py-3">
                    <Badge label={order.status} bgColor={statusStyle.bgColor} textColor={statusStyle.textColor} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-row gap-2 justify-end">
                      {order.status === 'Awaiting Freelancer Confirmation' && (
                        <>
                          <Button variant="primary" onClick={() => onUpdateStatus(order.order_id, 'Pending')}>Confirm</Button>
                          <Button variant="danger" onClick={() => onUpdateStatus(order.order_id, 'Cancelled')}>Decline</Button>
                        </>
                      )}
                      {order.status !== 'Done' && order.status !== 'Delivered' && order.status !== 'Cancelled' && order.status !== 'Awaiting Freelancer Confirmation' && (
                        <Button variant="primary" onClick={() => onMarkDone(order.order_id)}>Mark Done</Button>
                      )}
                      <Button variant="secondary" onClick={() => onOpen(order.order_id)}>Open</Button>
                      <Button variant="danger" onClick={() => onDelete(order)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;