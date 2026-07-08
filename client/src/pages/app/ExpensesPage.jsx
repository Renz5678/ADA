import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useExpenses } from '#hooks/useExpenses.js';
import { useAnalyticsSummary } from '#hooks/useAnalytics.js';
import { createExpense, updateExpense, deleteExpense } from '#api/expenses.js';
import ExpensesTable from '#components/expenses/ExpensesTable.jsx';
import ExpenseModal from '#components/expenses/ExpenseModal.jsx';
import ConfirmModal from '#components/ui/ConfirmModal.jsx';
import Button from '#components/ui/Button.jsx';
import { MdCreditCard } from 'react-icons/md';
import Skeleton from '#components/ui/Skeleton.jsx';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount || 0);

export default function ExpensesPage() {
    const queryClient = useQueryClient();
    const [expensesPage, setExpensesPage] = useState(1);
    const limit = 5;

    const { data: expensesData, isFetching: isFetchingExpenses, isError: isExpensesError, error: expensesError } = useExpenses(expensesPage, limit);
    const { data: summary } = useAnalyticsSummary('month');

    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    const openConfirm = (title, message, onConfirm) => setConfirmState({ isOpen: true, title, message, onConfirm });
    const closeConfirm = () => setConfirmState(s => ({ ...s, isOpen: false }));

    const invalidateExpenses = () => queryClient.invalidateQueries({ queryKey: ['expenses'] });

    const createExpenseMut = useMutation({ mutationFn: createExpense, onSuccess: () => { invalidateExpenses(); setIsExpenseModalOpen(false); toast.success('Expense added!'); }, onError: (err) => toast.error(err.response?.data?.message || 'Failed.') });
    const updateExpenseMut = useMutation({ mutationFn: ({ id, updates }) => updateExpense(id, updates), onSuccess: () => { invalidateExpenses(); setIsExpenseModalOpen(false); setEditingExpense(null); toast.success('Expense updated!'); }, onError: (err) => toast.error(err.response?.data?.message || 'Failed.') });
    const deleteExpenseMut = useMutation({ mutationFn: deleteExpense, onSuccess: () => { invalidateExpenses(); closeConfirm(); toast.success('Expense deleted.'); }, onError: (err) => toast.error(err.response?.data?.message || 'Failed.') });

    const handleSaveExpense = (data) => { if (editingExpense) updateExpenseMut.mutate({ id: editingExpense.expense_id, updates: data }); else createExpenseMut.mutate(data); };
    const handleDeleteExpense = (exp) => openConfirm(`Delete expense?`, `Are you sure you want to delete "${exp.title}"? This can't be undone.`, () => deleteExpenseMut.mutate(exp.expense_id));

    if (isFetchingExpenses && !expensesData) {
        return (
            <div className="w-full flex flex-col gap-6 flex-1 min-h-0">
                <Skeleton className="h-24 w-full rounded-2xl shrink-0" />
                <Skeleton className="flex-1 min-h-0 w-full rounded-2xl" />
            </div>
        );
    }

    if (isExpensesError) return <div className="w-full text-center py-20 text-red-600">Error: {expensesError?.message}</div>;

    return (
        <div className="w-full flex flex-col gap-6 animate-fadeIn flex-1 min-h-0">
            <div className="shrink-0">
                <h1 className="text-xl sm:text-2xl font-semibold font-headline text-[#0F1D29]">Expenses</h1>
                <p className="text-sm text-gray-500 mt-1 font-body">Track your business expenses.</p>
            </div>

            {/* Summary Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0f0f0] flex flex-col gap-1">
                    <span className="text-xs font-label uppercase text-gray-500">Revenue (This Month)</span>
                    <span className="text-2xl font-headline font-semibold text-[#8D4A52]">{formatCurrency(summary?.totalSales)}</span>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0f0f0] flex flex-col gap-1">
                    <span className="text-xs font-label uppercase text-gray-500">Expenses (This Month)</span>
                    <span className="text-2xl font-headline font-semibold text-[#0F1D29]">{formatCurrency(summary?.totalExpenses)}</span>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0f0f0] flex flex-col gap-1">
                    <span className="text-xs font-label uppercase text-gray-500">Net (This Month)</span>
                    <span className={`text-2xl font-headline font-semibold ${(summary?.netProfit ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(summary?.netProfit)}</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0] flex flex-col gap-4 flex-1 min-h-0">
                <div className="flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold font-headline text-[#0F1D29]">Other Expenses</h2>
                        <p className="text-xs text-gray-400 mt-0.5 font-body">Tools, rent, shipping — anything outside of material costs.</p>
                    </div>
                    <Button variant="primary" onClick={() => { setEditingExpense(null); setIsExpenseModalOpen(true); }}>+ New Expense</Button>
                </div>
                {!expensesData?.expenses?.length ? (
                    <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center">
                        <div className="text-5xl text-gray-400"><MdCreditCard /></div>
                        <p className="text-gray-500 font-body text-sm font-medium">No additional expenses logged yet.</p>
                        <p className="text-gray-400 text-xs max-w-xs">Your material costs are automatically tracked in Stock & Materials. Add expenses here for things like tools, rent, or shipping.</p>
                    </div>
                ) : (
                    <>
                        <ExpensesTable expenses={expensesData?.expenses ?? []} isFetching={isFetchingExpenses}
                            onEdit={(exp) => { setEditingExpense(exp); setIsExpenseModalOpen(true); }}
                            onDelete={handleDeleteExpense}
                        />
                        {expensesData && expensesData.totalPages > 1 && (
                            <div className="flex items-center justify-between mt-auto pt-4 shrink-0 border-t border-[#f0f0f0]">
                                <Button variant="secondary" disabled={expensesPage === 1} onClick={() => setExpensesPage(p => Math.max(1, p - 1))}>Previous</Button>
                                <span className="text-sm text-gray-600 font-body">Page {expensesData.currentPage} of {expensesData.totalPages}</span>
                                <Button variant="secondary" disabled={expensesPage === expensesData.totalPages} onClick={() => setExpensesPage(p => Math.min(expensesData.totalPages, p + 1))}>Next</Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <ExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} onSave={handleSaveExpense} isSaving={createExpenseMut.isPending || updateExpenseMut.isPending} initialExpense={editingExpense} />
            <ConfirmModal isOpen={confirmState.isOpen} onClose={closeConfirm} onConfirm={confirmState.onConfirm} title={confirmState.title} message={confirmState.message} />
        </div>
    );
}