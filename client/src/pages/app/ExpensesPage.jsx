import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useExpenses } from '#hooks/useExpenses.js';
import { useMaterials } from '#hooks/useMaterials.js';
import { useAnalyticsSummary } from '#hooks/useAnalytics.js';
import { createExpense, updateExpense, deleteExpense } from '#api/expenses.js';
import { createMaterial, updateMaterial, deleteMaterial } from '#api/materials.js';
import { createMaterialTransaction } from '#api/materialTransactions.js';
import ExpensesTable from '#components/expenses/ExpensesTable.jsx';
import ExpenseModal from '#components/expenses/ExpenseModal.jsx';
import MaterialsTable from '#components/expenses/MaterialsTable.jsx';
import MaterialModal from '#components/expenses/MaterialModal.jsx';
import MaterialTransactionModal from '#components/expenses/MaterialTransactionModal.jsx';
import ConfirmModal from '#components/ui/ConfirmModal.jsx';
import Button from '#components/ui/Button.jsx';
import { MdCreditCard } from 'react-icons/md';
import Skeleton from '#components/ui/Skeleton.jsx';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount || 0);

export default function ExpensesPage() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('materials');
    const [expensesPage, setExpensesPage] = useState(1);
    const [materialsPage, setMaterialsPage] = useState(1);
    const limit = 5;

    const { data: expensesData, isFetching: isFetchingExpenses, isError: isExpensesError, error: expensesError } = useExpenses(expensesPage, limit);
    const { data: materialsData, isFetching: isFetchingMaterials, isError: isMaterialsError, error: materialsError } = useMaterials(materialsPage, limit);
    const { data: summary } = useAnalyticsSummary('month');

    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [isTxModalOpen, setIsTxModalOpen] = useState(false);
    const [txMaterial, setTxMaterial] = useState(null);
    const [txError, setTxError] = useState(null);
    const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    const openConfirm = (title, message, onConfirm) => setConfirmState({ isOpen: true, title, message, onConfirm });
    const closeConfirm = () => setConfirmState(s => ({ ...s, isOpen: false }));

    const invalidateExpenses = () => queryClient.invalidateQueries({ queryKey: ['expenses'] });
    const invalidateMaterials = () => queryClient.invalidateQueries({ queryKey: ['materials'] });

    const createExpenseMut = useMutation({ mutationFn: createExpense, onSuccess: () => { invalidateExpenses(); setIsExpenseModalOpen(false); toast.success('Expense added!'); }, onError: (err) => toast.error(err.response?.data?.message || 'Failed.') });
    const updateExpenseMut = useMutation({ mutationFn: ({ id, updates }) => updateExpense(id, updates), onSuccess: () => { invalidateExpenses(); setIsExpenseModalOpen(false); setEditingExpense(null); toast.success('Expense updated!'); }, onError: (err) => toast.error(err.response?.data?.message || 'Failed.') });
    const deleteExpenseMut = useMutation({ mutationFn: deleteExpense, onSuccess: () => { invalidateExpenses(); closeConfirm(); toast.success('Expense deleted.'); }, onError: (err) => toast.error(err.response?.data?.message || 'Failed.') });
    const createMaterialMut = useMutation({ mutationFn: createMaterial, onSuccess: () => { invalidateMaterials(); invalidateExpenses(); setIsMaterialModalOpen(false); toast.success('Material created!'); }, onError: (err) => toast.error(err.response?.data?.message || 'Failed.') });
    const updateMaterialMut = useMutation({ mutationFn: ({ id, updates }) => updateMaterial(id, updates), onSuccess: () => { invalidateMaterials(); setIsMaterialModalOpen(false); setEditingMaterial(null); toast.success('Material updated!'); }, onError: (err) => toast.error(err.response?.data?.message || 'Failed.') });
    const deleteMaterialMut = useMutation({ mutationFn: deleteMaterial, onSuccess: () => { invalidateMaterials(); closeConfirm(); toast.success('Material deleted.'); }, onError: (err) => toast.error(err.response?.data?.message || 'Failed.') });
    const createTxMut = useMutation({ mutationFn: ({ materialId, data }) => createMaterialTransaction(materialId, data), onSuccess: () => { invalidateMaterials(); invalidateExpenses(); setIsTxModalOpen(false); setTxMaterial(null); setTxError(null); toast.success('Transaction logged!'); }, onError: (err) => { const msg = err.response?.data?.message || 'Failed.'; setTxError(msg); toast.error(msg); } });

    const handleSaveExpense = (data) => { if (editingExpense) updateExpenseMut.mutate({ id: editingExpense.expense_id, updates: data }); else createExpenseMut.mutate(data); };
    const handleDeleteExpense = (exp) => openConfirm(`Delete expense?`, `Are you sure you want to delete "${exp.title}"? This can't be undone.`, () => deleteExpenseMut.mutate(exp.expense_id));
    const handleSaveMaterial = (data) => { if (editingMaterial) updateMaterialMut.mutate({ id: editingMaterial.material_id, updates: data }); else createMaterialMut.mutate(data); };
    const handleDeleteMaterial = (mat) => openConfirm(`Delete material?`, `Are you sure you want to delete "${mat.material_name}"? This can't be undone.`, () => deleteMaterialMut.mutate(mat.material_id));
    const handleSaveTx = (data) => { setTxError(null); createTxMut.mutate({ materialId: data.material_id, data }); };

    if ((isFetchingExpenses && !expensesData) || (isFetchingMaterials && !materialsData)) {
        return (
            <div className="w-full flex flex-col gap-6 flex-1 min-h-0">
                <Skeleton className="h-24 w-full rounded-2xl shrink-0" />
                <Skeleton className="flex-1 min-h-0 w-full rounded-2xl" />
            </div>
        );
    }

    if (isExpensesError || isMaterialsError) return <div className="w-full text-center py-20 text-red-600">Error: {expensesError?.message || materialsError?.message}</div>;

    return (
        <div className="w-full flex flex-col gap-6 animate-fadeIn flex-1 min-h-0">
            <div className="shrink-0">
                <h1 className="text-xl sm:text-2xl font-semibold font-headline text-[#0F1D29]">Finances</h1>
                <p className="text-sm text-gray-500 mt-1 font-body">Track your materials, stock, and business expenses in one place.</p>
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

            {/* Tab Switcher */}
            <div className="flex bg-[#f0f0f0] rounded-xl p-1 w-full sm:w-auto self-start shrink-0">
                {[{ key: 'materials', label: 'Stock & Materials' }, { key: 'expenses', label: 'Other Expenses' }].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`px-5 py-2 text-sm rounded-lg transition duration-150 font-body ${activeTab === tab.key ? 'bg-white shadow-sm font-semibold text-[#0F1D29]' : 'text-gray-500 hover:text-[#0F1D29]'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Stock & Materials Tab */}
            {activeTab === 'materials' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0] flex flex-col gap-4 flex-1 min-h-0">
                    <div className="flex items-center justify-between shrink-0">
                        <h2 className="text-lg sm:text-xl font-semibold font-headline text-[#0F1D29] flex items-center gap-3">
                            Stock & Materials
                            {materialsData?.totalQuantity !== undefined && (
                                <span className="text-xs sm:text-sm bg-[#8D4A52] text-white px-2 py-1 rounded-md shadow-sm font-medium">Total Items: {materialsData.totalQuantity}</span>
                            )}
                        </h2>
                        <Button variant="primary" onClick={() => { setEditingMaterial(null); setIsMaterialModalOpen(true); }}>+ New Material</Button>
                    </div>
                    <MaterialsTable materials={materialsData?.materials ?? []} isFetching={isFetchingMaterials}
                        onEdit={(mat) => { setEditingMaterial(mat); setIsMaterialModalOpen(true); }}
                        onDelete={handleDeleteMaterial}
                        onTransaction={(mat) => { setTxMaterial(mat); setTxError(null); setIsTxModalOpen(true); }}
                    />
                    {materialsData && materialsData.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-auto pt-4 shrink-0 border-t border-[#f0f0f0]">
                            <Button variant="secondary" disabled={materialsPage === 1} onClick={() => setMaterialsPage(p => Math.max(1, p - 1))}>Previous</Button>
                            <span className="text-sm text-gray-600 font-body">Page {materialsData.currentPage} of {materialsData.totalPages}</span>
                            <Button variant="secondary" disabled={materialsPage === materialsData.totalPages} onClick={() => setMaterialsPage(p => Math.min(materialsData.totalPages, p + 1))}>Next</Button>
                        </div>
                    )}
                </div>
            )}

            {/* Other Expenses Tab */}
            {activeTab === 'expenses' && (
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
            )}

            <ExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} onSave={handleSaveExpense} isSaving={createExpenseMut.isPending || updateExpenseMut.isPending} initialExpense={editingExpense} />
            <MaterialModal isOpen={isMaterialModalOpen} onClose={() => setIsMaterialModalOpen(false)} onSave={handleSaveMaterial} isSaving={createMaterialMut.isPending || updateMaterialMut.isPending} initialMaterial={editingMaterial} />
            <MaterialTransactionModal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} onSave={handleSaveTx} isSaving={createTxMut.isPending} targetMaterial={txMaterial} error={txError} />
            <ConfirmModal isOpen={confirmState.isOpen} onClose={closeConfirm} onConfirm={confirmState.onConfirm} title={confirmState.title} message={confirmState.message} />
        </div>
    );
}