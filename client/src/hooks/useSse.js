import { useEffect, useRef } from 'react';
import { useAuth } from "#contexts/AuthContext.jsx";

const MAX_RETRY_DELAY = 30_000; // 30 seconds

/**
 * useSse — opens a persistent Server-Sent Events connection to /api/sse.
 *
 * @param {Function} onEvent - callback(eventName: string, data: object)
 *   Called every time a named SSE event is received (excluding heartbeat/connected).
 */
export default function useSse(onEvent) {
    const { user } = useAuth();
    const esRef = useRef(null);
    const retryDelayRef = useRef(1_000);
    const onEventRef = useRef(onEvent);

    // Keep onEvent ref fresh so we don't need to re-subscribe on every render
    useEffect(() => {
        onEventRef.current = onEvent;
    }, [onEvent]);

    useEffect(() => {
        let destroyed = false;

        const connect = () => {
            if (destroyed) return;
            if (!user) return; // Not logged in — skip

            const url = '/api/sse';
            const es = new EventSource(url, { withCredentials: true });
            esRef.current = es;

            // Generic message (un-named events — rarely used)
            es.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data);
                    onEventRef.current?.('message', data);
                } catch { /* ignore */ }
            };

            // Named events we care about
            const namedEvents = ['new_order_request', 'order_approved', 'order_declined', 'connected'];
            namedEvents.forEach(eventName => {
                es.addEventListener(eventName, (e) => {
                    if (eventName === 'connected') return; // skip informational event
                    try {
                        const data = JSON.parse(e.data);
                        onEventRef.current?.(eventName, data);
                    } catch { /* ignore */ }
                });
            });

            // Heartbeat — just reset retry delay on success
            es.addEventListener('heartbeat', () => {
                retryDelayRef.current = 1_000;
            });

            es.onerror = () => {
                es.close();
                if (!destroyed) {
                    // Exponential backoff
                    const delay = retryDelayRef.current;
                    retryDelayRef.current = Math.min(delay * 2, MAX_RETRY_DELAY);
                    setTimeout(connect, delay);
                }
            };
        };

        connect();

        return () => {
            destroyed = true;
            esRef.current?.close();
        };
    }, [user]); // re-run if user changes
}
