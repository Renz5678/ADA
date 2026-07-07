import { useState, useEffect } from 'react';
import Button from '../ui/Button.jsx';

export default function ExpenseModal({ isOpen, onClose, onSave, isSaving, initialExpense }) {
    const isEditing = Boolean(initialExpense);

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Operations');
    const [amount, setAmount] = useState('');
    const [expenseDate, setExpenseDate] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTitle(initialExpense?.title ?? '');
            setCategory(initialExpense?.category ?? 'Operations');
            setAmount(initialExpense?.amount ?? '');
            setExpenseDate(initialExpense?.expense_date ?? new Date().toISOString().split('T')[0]);
        }
    }, [isOpen, initialExpense]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            title,
            category,
            amount: Number(amount),
            expense_date: expenseDate
        });
    };

    return (
        <div className="fixed inset-0 bg-[#0F1D29]/60 backdrop-blur-sm z-50 flex justify-center items-center animate-fadeIn">
            <div className="w-[90%] sm:w-full max-w-sm bg-[#FFF7E6] border border-[#e8d5b5] rounded-3xl p-7 flex flex-col gap-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] animate-zoomIn">
                <h3 className="font-headline text-xl font-bold text-[#8D4A52] text-center border-b border-[#e8d5b5] pb-4">
                    {isEditing ? 'Edit Expense' : 'New Expense'}
                </h3>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div>
                        <label className="block text-sm mb-1 font-label text-[#0F1D29]">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Office Supplies"
                            required
                            className="border border-[#e8d5b5] bg-white rounded-xl px-4 py-2.5 w-full text-sm font-body shadow-sm focus:border-[#8D4A52] focus:ring-1 focus:ring-[#8D4A52] outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 font-label text-[#0F1D29]">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                            className="border border-[#e8d5b5] bg-white rounded-xl px-4 py-2.5 w-full text-sm font-body shadow-sm focus:border-[#8D4A52] focus:ring-1 focus:ring-[#8D4A52] outline-none transition appearance-none"
                        >
                            <option value="Materials">Materials</option>
                            <option value="Operations">Operations</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Software">Software</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm mb-1 font-label text-[#0F1D29]">Amount</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            required
                            className="border border-[#e8d5b5] bg-white rounded-xl px-4 py-2.5 w-full text-sm font-body shadow-sm focus:border-[#8D4A52] focus:ring-1 focus:ring-[#8D4A52] outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 font-label text-[#0F1D29]">Date</label>
                        <input
                            type="date"
                            value={expenseDate}
                            onChange={(e) => setExpenseDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            required
                            className="border border-[#e8d5b5] bg-white rounded-xl px-4 py-2.5 w-full text-sm font-body shadow-sm focus:border-[#8D4A52] focus:ring-1 focus:ring-[#8D4A52] outline-none transition"
                        />
                    </div>

                    <div className="w-full h-px bg-[#e8d5b5] my-2" />

                    <div className="flex flex-col gap-2">
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={isSaving}
                            className="w-full"
                        >
                            {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Expense'}
                        </Button>
                        <Button
                            variant="secondary"
                            type="button"
                            onClick={onClose}
                            className="w-full"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
