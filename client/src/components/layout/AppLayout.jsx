import { Outlet, useLocation } from "react-router-dom";
import { useState, useCallback } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { AnimatePresence, motion } from "framer-motion";
import useSse from "#hooks/useSse.js";
import IncomingOrderModal from "#components/orders/IncomingOrderModal.jsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPendingOrders } from "#api/pendingOrders.js";
import FloatingChatbot from "#components/chat/FloatingChatbot.jsx";

export default function AppLayout() {
    const location = useLocation();
    const queryClient = useQueryClient();
    const [pendingQueue, setPendingQueue] = useState([]);

    // Check if user is allowed to use chatbot
    let isChatAllowed = false;
    try {
        const token = localStorage.getItem('token');
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            isChatAllowed = payload.role === 'admin' || payload.approval_status === 'approved';
        }
    } catch (e) {
        console.error('Failed to parse token for chat permissions', e);
    }

    // Load any pending orders that arrived while the freelancer was offline
    useQuery({
        queryKey: ['pendingOrders'],
        queryFn: getPendingOrders,
        staleTime: 0,
        onSuccess: (data) => {
            if (data && data.length > 0) {
                // Normalise server response shape to match SSE event shape
                setPendingQueue(data.map(p => ({
                    pending_id: p.pending_id,
                    client_name: p.customer_name,
                    total_amount: p.total_amount,
                    deadline: p.deadline,
                    items: p.items_snapshot || []
                })));
            }
        }
    });

    // Handle real-time SSE events
    const handleSseEvent = useCallback((eventName, data) => {
        if (eventName === 'new_order_request') {
            setPendingQueue(prev => {
                // Deduplicate by pending_id
                const exists = prev.some(p => p.pending_id === data.pending_id);
                if (exists) return prev;
                return [...prev, {
                    pending_id: data.pending_id,
                    client_name: data.client_name,
                    total_amount: data.total_amount,
                    deadline: data.deadline,
                    items: data.items || []
                }];
            });
            // Invalidate notifications so the bell badge updates
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount'] });
        }
    }, [queryClient]);

    useSse(handleSseEvent);

    // Remove a handled order from the queue
    const handleDismiss = useCallback((pendingId) => {
        setPendingQueue(prev => prev.filter(p => p.pending_id !== pendingId));
        queryClient.invalidateQueries({ queryKey: ['pendingOrders'] });
    }, [queryClient]);

    return (
        <div className="w-screen h-screen flex overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden min-w-0">
                <Topbar pendingQueue={pendingQueue} onDismiss={handleDismiss} />
                <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 flex flex-col">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="w-full h-full flex flex-col flex-1"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Real-time incoming order approval modal */}
            <IncomingOrderModal
                pendingQueue={pendingQueue}
                onDismiss={handleDismiss}
            />

            {/* AI Assistant Chatbot */}
            {isChatAllowed && <FloatingChatbot />}
        </div>
    );
}