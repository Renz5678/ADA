import { models } from '../models/index.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Op } from 'sequelize';

export const getChatHistory = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.approval_status !== 'approved') {
            return res.status(403).json({ error: 'Chatbot access is restricted to approved users and admins.' });
        }
        
        const userId = req.user.id;
        const chatHistory = await models.ChatHistory.findOne({ where: { user_id: userId } });
        
        if (!chatHistory) {
            return res.status(200).json({ messages: [] });
        }
        
        res.status(200).json({ messages: chatHistory.messages });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
};

export const clearChatHistory = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.approval_status !== 'approved') {
            return res.status(403).json({ error: 'Chatbot access is restricted to approved users and admins.' });
        }

        const userId = req.user.id;
        const chatHistory = await models.ChatHistory.findOne({ where: { user_id: userId } });
        
        if (chatHistory) {
            await chatHistory.update({ messages: [] });
        }
        
        res.status(200).json({ message: 'Chat cleared successfully' });
    } catch (error) {
        console.error('Error clearing chat:', error);
        res.status(500).json({ error: 'Failed to clear chat' });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { message } = req.body;

        if (req.user.role !== 'admin' && req.user.approval_status !== 'approved') {
            return res.status(403).json({ error: 'Chatbot access is restricted to approved users and admins.' });
        }

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'AI service is currently unavailable.' });
        }

        let contextPrompt = '';

        if (req.user.role === 'admin') {
            const allUsers = await models.Users.findAll({
                attributes: ['username', 'business_name', 'email', 'approval_status']
            });
            
            const allOrders = await models.Orders.findAll({
                attributes: ['status', 'total_amount']
            });

            const totalRevenue = allOrders.reduce((sum, order) => {
                if (order.status === 'Delivered' || order.status === 'Done') {
                    return sum + parseFloat(order.total_amount);
                }
                return sum;
            }, 0);

            const userList = allUsers.map(u => `- ${u.business_name || u.username} (${u.email}) [Status: ${u.approval_status}]`).join('\n');

            contextPrompt = `You are a helpful AI assistant for the ADA platform Administrator.
Here is the global platform data as of today:
- Total Platform Revenue: ${totalRevenue} PHP
- Total Orders Processed: ${allOrders.length}
- Total Registered Users: ${allUsers.length}
- User Directory:
${userList}

IMPORTANT INSTRUCTIONS:
1. You are strictly an assistant for the ADA platform admin, helping them monitor platform growth, revenue, and check on users' statuses.
2. If the admin asks a question completely unrelated to ADA, sales, orders, or users, you MUST refuse to answer. 
3. If refusing, reply exactly or similarly to: "I am specifically meant to assist you with insights regarding the ADA platform, sales, and user management. How can I help you today?"
4. Be friendly, concise, and helpful. Limit responses to 2-3 short paragraphs maximum.
5. Do not explicitly mention that you were given this hidden context directly, just use it to inform your answers.`;

        } else {
            const user = await models.Users.findByPk(userId);
            
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const orders = await models.Orders.findAll({
                where: { user_id: userId, order_date: { [Op.gte]: thirtyDaysAgo } }
            });
            
            const totalRevenue = orders.reduce((sum, order) => {
                if (order.status === 'Delivered' || order.status === 'Done') {
                    return sum + parseFloat(order.total_amount);
                }
                return sum;
            }, 0);

            const orderStatuses = orders.reduce((acc, order) => {
                acc[order.status] = (acc[order.status] || 0) + 1;
                return acc;
            }, {});
            
            const productCount = await models.Product.count({ where: { user_id: userId } });

            contextPrompt = `You are a helpful AI assistant for a freelancer (Name: ${user.business_name || user.username}) using the ADA platform. 
Here is their business data for the last 30 days:
- Total Completed Revenue: ${totalRevenue} PHP
- Order Statuses: ${JSON.stringify(orderStatuses)}
- Total Products Listed: ${productCount}

IMPORTANT INSTRUCTIONS:
1. You are strictly an assistant for the ADA platform, helping the user with sales, orders, revenue, products, and business analytics.
2. If the user asks a question completely unrelated to ADA, sales, orders, or their business (e.g., general trivia, coding help, or casual off-topic chatter), you MUST refuse to answer. 
3. If refusing, reply exactly or similarly to: "I am specifically meant to assist you with insights regarding your ADA platform, sales, and orders. How can I help you with your business today?"
4. Be friendly, concise, and helpful for on-topic questions. Limit responses to 2-3 short paragraphs maximum.
5. Do not explicitly mention that you were given this hidden context directly, just use it to inform your answers.`;
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-flash-latest",
            systemInstruction: contextPrompt
        });

        let chatHistory = await models.ChatHistory.findOne({ where: { user_id: userId } });
        if (!chatHistory) {
            chatHistory = await models.ChatHistory.create({ user_id: userId, messages: [] });
        }

        const formattedHistory = chatHistory.messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        const chat = model.startChat({
            history: formattedHistory,
        });

        const result = await chat.sendMessage(message);
        const aiResponse = result.response.text();

        const newMessages = [
            ...chatHistory.messages,
            { sender: 'user', text: message, timestamp: new Date() },
            { sender: 'ai', text: aiResponse.trim(), timestamp: new Date() }
        ];

        // Keep last 50 messages to save space
        const truncatedMessages = newMessages.slice(-50);

        await chatHistory.update({ messages: truncatedMessages });

        res.status(200).json({ 
            response: aiResponse.trim(),
            messages: truncatedMessages
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
};
