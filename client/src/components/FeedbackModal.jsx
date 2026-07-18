import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitFeedback } from '#api/feedback.js';
import toast from 'react-hot-toast';
import { MdClose, MdFeedback } from 'react-icons/md';

export default function FeedbackModal({ isOpen, onClose }) {
    const [type, setType] = useState('bug');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await submitFeedback({ type, title, description });
            toast.success('Feedback submitted successfully!');
            setTitle('');
            setDescription('');
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to submit feedback.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-[#1a2332] border border-gray-700/50 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-5 border-b border-gray-700/50 bg-[#0f1623]">
                            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                                <MdFeedback className="text-[#38bdf8]" />
                                Report / Feedback
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                            >
                                <MdClose size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="type" 
                                            value="bug" 
                                            checked={type === 'bug'} 
                                            onChange={() => setType('bug')}
                                            className="text-[#38bdf8] focus:ring-[#38bdf8] bg-gray-800 border-gray-700"
                                        />
                                        <span className="text-gray-200">Bug Report</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="type" 
                                            value="feature" 
                                            checked={type === 'feature'} 
                                            onChange={() => setType('feature')}
                                            className="text-[#38bdf8] focus:ring-[#38bdf8] bg-gray-800 border-gray-700"
                                        />
                                        <span className="text-gray-200">Feature Request</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-[#0f1623] border border-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] transition-all"
                                    placeholder="Brief summary..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-[#0f1623] border border-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] transition-all resize-none"
                                    placeholder="Please provide details..."
                                />
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-[#38bdf8] text-[#0f1623] font-bold rounded-lg hover:bg-[#7dd3fc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
