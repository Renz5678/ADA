import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MdCheckCircle, MdCancel,
    MdShoppingBag, MdPerson, MdCalendarToday,
    MdAttachMoney, MdInventory
} from 'react-icons/md';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { approvePendingOrder, declinePendingOrder } from '#api/pendingOrders.js';

/**
 * IncomingOrderModal
 *
 * Renders a queue of incoming pending order requests received via SSE.
 * Shows one modal at a time (the oldest pending request).
 * The freelancer can Approve or Decline each one.
 *
 * Props:
 *   pendingQueue: Array<PendingOrder>  — queue managed by AppLayout via SSE
 *   onDismiss: (pendingId) => void     — called after approve or decline
 */
export default function IncomingOrderModal({ pendingQueue, onDismiss }) {
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    // Show the first item in queue
    const order = pendingQueue?.[0];

    const handleApprove = async () => {
        if (!order || loading) return;
        setLoading(true);
        try {
            await approvePendingOrder(order.pending_id);
            toast.success(`Order from ${order.client_name} approved! ✓`);
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['orderStats'] });
            onDismiss(order.pending_id);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to approve order.');
        } finally {
            setLoading(false);
        }
    };

    const handleDecline = async () => {
        if (!order || loading) return;
        setLoading(true);
        try {
            await declinePendingOrder(order.pending_id);
            toast('Order request declined.', { icon: '✗' });
            onDismiss(order.pending_id);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to decline order.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {order && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
                    />

                    {/* Modal */}
                    <motion.div
                        key={`modal-${order.pending_id}`}
                        initial={{ opacity: 0, scale: 0.92, y: 32 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 32 }}
                        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    >
                        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-[#8D4A52] to-[#AB626A] px-6 py-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-white/20 rounded-2xl flex items-center justify-center">
                                        <MdShoppingBag size={22} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white/70 text-xs font-medium uppercase tracking-wider">New Order Request</p>
                                        <h2 className="text-white font-bold text-lg leading-tight">
                                            Approval Required
                                        </h2>
                                    </div>
                                </div>
                                {pendingQueue.length > 1 && (
                                    <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        {pendingQueue.length} pending
                                    </span>
                                )}
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-4">
                                {/* Meta */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-[#FFF7E6] rounded-2xl p-3 flex items-center gap-2">
                                        <MdPerson size={18} className="text-[#8D4A52] shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase font-semibold">Client</p>
                                            <p className="text-sm font-bold text-[#0F1D29] truncate">{order.client_name}</p>
                                        </div>
                                    </div>
                                    <div className="bg-[#FFF7E6] rounded-2xl p-3 flex items-center gap-2">
                                        <MdAttachMoney size={18} className="text-[#8D4A52] shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase font-semibold">Total</p>
                                            <p className="text-sm font-bold text-[#8D4A52]">
                                                ₱{Number(order.total_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>
                                    {order.deadline && (
                                        <div className="bg-[#FFF7E6] rounded-2xl p-3 flex items-center gap-2 col-span-2">
                                            <MdCalendarToday size={18} className="text-[#8D4A52] shrink-0" />
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-semibold">Requested Deadline</p>
                                                <p className="text-sm font-bold text-[#0F1D29]">
                                                    {new Date(order.deadline).toLocaleDateString('en-PH', {
                                                        year: 'numeric', month: 'long', day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Items */}
                                {order.items && order.items.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <MdInventory size={15} className="text-gray-400" />
                                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Order Items</p>
                                        </div>
                                        <div className="rounded-2xl border border-gray-100 overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b border-gray-100">
                                                        <th className="text-left px-4 py-2 text-xs text-gray-500 font-semibold">Product</th>
                                                        <th className="text-center px-4 py-2 text-xs text-gray-500 font-semibold">Qty</th>
                                                        <th className="text-right px-4 py-2 text-xs text-gray-500 font-semibold">Subtotal</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {order.items.map((item, i) => (
                                                        <tr key={i} className="border-b border-gray-50 last:border-0">
                                                            <td className="px-4 py-2.5 text-[#0F1D29] font-medium">{item.product_name}</td>
                                                            <td className="px-4 py-2.5 text-center text-gray-600">×{item.quantity}</td>
                                                            <td className="px-4 py-2.5 text-right text-[#8D4A52] font-semibold">
                                                                ₱{Number(item.subtotal).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="px-6 pb-6 flex gap-3">
                                <button
                                    onClick={handleDecline}
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
                                >
                                    <MdCancel size={18} />
                                    Decline
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={loading}
                                    className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#8D4A52] text-white font-semibold hover:bg-[#7a3f47] hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
                                >
                                    <MdCheckCircle size={18} />
                                    {loading ? 'Processing…' : 'Approve Order'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
