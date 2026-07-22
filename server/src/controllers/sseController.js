/**
 * SSE (Server-Sent Events) Controller
 *
 * Manages persistent SSE connections for freelancers.
 * Each authenticated user gets one active SSE connection stored in app.locals.sseClients.
 * Other controllers can push events to a user via sendToUser().
 */
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

/**
 * GET /sse
 * Opens a persistent SSE stream for the authenticated freelancer.
 * Reads the HttpOnly token cookie. SseController handles its own JWT validation.
 */
export const connectSse = (req, res) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: token required' });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    if (decoded.role === 'client') {
        return res.status(403).json({ message: 'Forbidden: freelancer access only' });
    }

    const userId = decoded.id;

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.flushHeaders();

    // Register client
    if (!req.app.locals.sseClients) req.app.locals.sseClients = new Map();
    req.app.locals.sseClients.set(userId, res);

    // Send an initial connected event
    res.write(`event: connected\ndata: ${JSON.stringify({ message: 'SSE connection established' })}\n\n`);

    // Heartbeat every 30s to keep connection alive
    const heartbeat = setInterval(() => {
        res.write(`event: heartbeat\ndata: ${JSON.stringify({ ts: Date.now() })}\n\n`);
    }, 30_000);

    // Cleanup on disconnect
    req.on('close', () => {
        clearInterval(heartbeat);
        if (req.app.locals.sseClients) {
            req.app.locals.sseClients.delete(userId);
        }
    });
};

/**
 * Push a named SSE event to a specific user.
 * Safe to call even if the user is not currently connected (no-op).
 *
 * @param {object} app - Express app instance (for app.locals.sseClients)
 * @param {number} userId - Target user ID
 * @param {string} eventName - SSE event name
 * @param {object} data - JSON-serializable payload
 */
export const sendToUser = (app, userId, eventName, data) => {
    const clients = app.locals.sseClients;
    if (!clients) return;

    const res = clients.get(userId);
    if (res) {
        try {
            res.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
        } catch (err) {
            console.error(`[SSE] Failed to send event "${eventName}" to user ${userId}:`, err.message);
            clients.delete(userId);
        }
    }
};
