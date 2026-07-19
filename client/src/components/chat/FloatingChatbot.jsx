import { useState, useRef, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, X, Send, Trash2, Info, Loader2, Sparkles } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChatHistory, sendChatMessage, clearChatHistory } from '#api/chat.js';

export default function FloatingChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['chatHistory'],
        queryFn: getChatHistory,
        enabled: isOpen,
    });

    const messages = useMemo(() => data?.messages || [], [data?.messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const sendMutation = useMutation({
        mutationFn: sendChatMessage,
        onMutate: async (newMessage) => {
            await queryClient.cancelQueries({ queryKey: ['chatHistory'] });
            const previousData = queryClient.getQueryData(['chatHistory']);
            queryClient.setQueryData(['chatHistory'], old => {
                const msgs = old?.messages || [];
                return { messages: [...msgs, { sender: 'user', text: newMessage, timestamp: new Date() }] };
            });
            return { previousData };
        },
        onError: (err, newMessage, context) => {
            queryClient.setQueryData(['chatHistory'], context.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['chatHistory'] });
        },
    });

    const clearMutation = useMutation({
        mutationFn: clearChatHistory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chatHistory'] });
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || sendMutation.isPending) return;
        
        sendMutation.mutate(input);
        setInput('');
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-20 right-4 sm:right-6 w-[90vw] sm:w-[400px] h-[600px] max-h-[80vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 backdrop-blur-xl bg-opacity-95"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                                    <Sparkles className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-200">ADA Assistant</h3>
                                    <p className="text-xs text-slate-400">Powered by Gemini</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => clearMutation.mutate()}
                                    title="Clear Chat"
                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div className="bg-amber-500/10 border-b border-amber-500/20 p-3 flex items-start gap-2">
                            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-200/80 leading-relaxed">
                                <span className="font-semibold text-amber-500">Disclaimer:</span> AI insights are generated based on your business data but may not always be 100% accurate. Please double-check important metrics. <span className="opacity-75">Limit: 10 queries per hour.</span>
                            </p>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 && !isLoading && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
                                        <Bot className="w-8 h-8 text-indigo-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-medium text-slate-200">How can I help?</h4>
                                        <p className="text-sm text-slate-400">Ask me about your sales, pending orders, or business performance.</p>
                                    </div>
                                </div>
                            )}

                            {messages.map((msg, idx) => (
                                <div 
                                    key={idx} 
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div 
                                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                                            msg.sender === 'user' 
                                                ? 'bg-indigo-600 text-white rounded-br-sm' 
                                                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-sm'
                                        }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                    </div>
                                </div>
                            ))}

                            {sendMutation.isPending && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                                        <span className="text-sm text-slate-400">Thinking...</span>
                                    </div>
                                </div>
                            )}

                            {sendMutation.isError && (
                                <div className="flex justify-center my-2">
                                    <span className="text-xs text-red-400 bg-red-400/10 px-3 py-1 rounded-full border border-red-400/20">
                                        {sendMutation.error?.response?.data?.message || 'Failed to send message. You may have hit the rate limit.'}
                                    </span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-slate-900 border-t border-slate-800">
                            <form 
                                onSubmit={handleSubmit}
                                className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-1.5 py-1.5 focus-within:border-indigo-500/50 transition-colors"
                            >
                                <input 
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about your business..."
                                    className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 outline-none"
                                    disabled={sendMutation.isPending}
                                />
                                <button 
                                    type="submit"
                                    disabled={!input.trim() || sendMutation.isPending}
                                    className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-colors flex items-center justify-center"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-50 transition-colors duration-300 ${
                    isOpen 
                        ? 'bg-slate-800 border-2 border-slate-700 text-slate-400 hover:bg-slate-700' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25'
                }`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
            </motion.button>
        </>
    );
}
