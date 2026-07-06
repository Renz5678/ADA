import { useState, useEffect } from 'react';
import Button from '../ui/Button.jsx';

export default function ExpenseModal({ isOpen, onClose, onSave, isSaving, initialExpense }) {
    const isEditing = Boolean(initialExpense);

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [expenseDate, setExpenseDate] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTitle(initialExpense?.title ?? '');
            setCategory(initialExpense?.category ?? '');
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
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex justify-center items-center animate-fadeIn">
            <div className="w-[90%] sm:w-full max-w-sm bg-white rounded-2xl p-6 flex flex-col gap-4 shadow-lg animate-zoomIn">
                <h3 className="font-headline text-lg font-semibold text-[#0F1D29] text-center">
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
                            className="border border-[#c1c1c1] rounded-lg px-3 py-2 w-full text-sm font-body"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 font-label text-[#0F1D29]">Category</label>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="e.g. Operations"
                            required
                            className="border border-[#c1c1c1] rounded-lg px-3 py-2 w-full text-sm font-body"
                        />
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
                            className="border border-[#c1c1c1] rounded-lg px-3 py-2 w-full text-sm font-body"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 font-label text-[#0F1D29]">Date</label>
                        <input
                            type="date"
                            value={expenseDate}
                            onChange={(e) => setExpenseDate(e.target.value)}
                            required
                            className="border border-[#c1c1c1] rounded-lg px-3 py-2 w-full text-sm font-body"
                        />
                    </div>

                    <div className="w-full h-px bg-[#f0f0f0] my-1" />

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
