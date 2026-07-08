import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdNotifications, MdNotificationsNone, MdCheck } from 'react-icons/md';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from '#hooks/useNotifications.js';
import Skeleton from '../ui/Skeleton.jsx';

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

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

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            markAsReadMut.mutate(notification.notification_id);
        }
        
        setIsOpen(false);
        
        if (notification.reference_type === 'ORDER' && notification.reference_id) {
            navigate(`/orders/${notification.reference_id}`);
        } else if (notification.reference_type === 'MATERIAL' && notification.reference_id) {
            navigate(`/expenses`); // Navigate to materials section
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition duration-150 text-[#0F1D29]"
            >
                {unreadCount > 0 ? (
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
                <div className="absolute right-[-10px] sm:right-0 mt-3 w-[90vw] max-w-[340px] sm:max-w-none sm:w-96 bg-white rounded-xl shadow-lg border border-[#f0f0f0] overflow-hidden z-50">
                    <div className="flex justify-between items-center p-4 border-b border-[#f0f0f0] bg-gray-50">
                        <h3 className="font-headline font-semibold text-[#0F1D29]">Notifications</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={() => markAllAsReadMut.mutate()}
                                className="text-xs font-medium text-[#8D4A52] hover:underline flex items-center gap-1"
                            >
                                <MdCheck size={14} /> Mark all read
                            </button>
                        )}
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto font-body">
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
                        ) : (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No notifications yet.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
