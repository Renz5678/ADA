import { useState, useRef, useEffect } from 'react';
import { MdNotifications, MdNotificationsNone, MdCheck, MdShoppingBag } from 'react-icons/md';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from '#hooks/useNotifications.js';
import { approvePendingOrder, declinePendingOrder } from '#api/pendingOrders.js';
import Skeleton from '../ui/Skeleton.jsx';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function NotificationDropdown({ pendingQueue = [], onDismiss }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const queryClient = useQueryClient();

    const { data: notifications, isLoading } = useNotifications();
    const { data: unreadCount } = useUnreadCount();
    const markAsReadMut = useMarkAsRead();
    const markAllAsReadMut = useMarkAllAsRead();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Always mark as read when clicking a notification
    const handleNotificationClick = (notification) => {
        markAsReadMut.mutate(notification.notification_id);
        setIsOpen(false);
    };

    const totalBadge = (unreadCount || 0) + pendingQueue.length;

    const handleApprove = async (pendingId, clientName) => {
        try {
            await approvePendingOrder(pendingId);
            toast.success(`Order from ${clientName} approved! ✓`);
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['orderStats'] });
            onDismiss?.(pendingId);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to approve order.');
        }
    };

    const handleDecline = async (pendingId) => {
        try {
            await declinePendingOrder(pendingId);
            toast('Order request declined.', { icon: '✗' });
            onDismiss?.(pendingId);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to decline order.');
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition duration-150 text-[#0F1D29]"
            >
                {totalBadge > 0 ? (
                    <>
                        <MdNotifications size={24} />
                        <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                    </>
                ) : (
                    <MdNotificationsNone size={24} />
                )}
            </button>

            {isOpen && (
                <div className="fixed top-14 left-1/2 -translate-x-1/2 w-[95vw] sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:-translate-x-0 mt-2 sm:w-96 bg-white rounded-xl shadow-lg border border-[#f0f0f0] overflow-hidden z-50">
                    <div className="flex justify-between items-center p-4 border-b border-[#f0f0f0] bg-gray-50">
                        <h3 className="font-headline font-semibold text-[#0F1D29]">Notifications</h3>
                        {(unreadCount || 0) > 0 && (
                            <button
                                onClick={() => markAllAsReadMut.mutate()}
                                className="text-xs font-medium text-[#8D4A52] hover:underline flex items-center gap-1"
                            >
                                <MdCheck size={14} /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto font-body">
                        {/* ── Pending Approvals section ── */}
                        {pendingQueue.length > 0 && (
                            <div>
                                <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-[#8D4A52] uppercase tracking-widest">
                                    Pending Approvals
                                </p>
                                {pendingQueue.map(order => (
                                    <div
                                        key={order.pending_id}
                                        className="px-4 py-3 border-b border-[#f0f0f0] bg-[#FFF7E6]/60"
                                    >
                                        <div className="flex items-start gap-2 mb-2">
                                            <div className="h-7 w-7 rounded-full bg-[#8D4A52]/10 flex items-center justify-center shrink-0 mt-0.5">
                                                <MdShoppingBag size={14} className="text-[#8D4A52]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-[#0F1D29] truncate">
                                                    Order from {order.client_name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Total: ₱{Number(order.total_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                    {order.deadline && ` · Due ${new Date(order.deadline).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-1">
                                            <button
                                                onClick={() => handleDecline(order.pending_id)}
                                                className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                                            >
                                                Decline
                                            </button>
                                            <button
                                                onClick={() => handleApprove(order.pending_id, order.client_name)}
                                                className="flex-[2] py-1.5 text-xs font-semibold rounded-lg bg-[#8D4A52] text-white hover:bg-[#7a3f47] transition-colors"
                                            >
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── Regular notifications ── */}
                        {notifications && notifications.length > 0 && pendingQueue.length > 0 && (
                            <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Recent
                            </p>
                        )}

                        {isLoading ? (
                            <div className="p-4 flex flex-col gap-3">
                                <Skeleton className="h-12 w-full rounded" />
                                <Skeleton className="h-12 w-full rounded" />
                            </div>
                        ) : notifications && notifications.length > 0 ? (
                            notifications.map(notif => (
                                <div
                                    key={notif.notification_id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`p-4 border-b border-[#f0f0f0] cursor-pointer hover:bg-gray-50 transition duration-150 ${!notif.is_read ? 'bg-[#FFF7E6]/30' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-sm ${!notif.is_read ? 'font-semibold text-[#0F1D29]' : 'font-medium text-gray-700'}`}>
                                            {notif.title}
                                        </h4>
                                        {!notif.is_read && (
                                            <span className="h-2 w-2 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                                        )}
                                    </div>
                                    <p className={`text-xs ${!notif.is_read ? 'text-gray-700' : 'text-gray-500'}`}>
                                        {notif.message}
                                    </p>
                                    <span className="text-[10px] text-gray-400 mt-2 block">
                                        {new Date(notif.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))
                        ) : pendingQueue.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No notifications yet.
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
