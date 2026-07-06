import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useExpenses } from '#hooks/useExpenses.js';
import { useMaterials } from '#hooks/useMaterials.js';
import { createExpense, updateExpense, deleteExpense } from '#api/expenses.js';
import { createMaterial, updateMaterial, deleteMaterial } from '#api/materials.js';
import { createMaterialTransaction } from '#api/materialTransactions.js';

import ExpensesTable from '#components/expenses/ExpensesTable.jsx';
import ExpenseModal from '#components/expenses/ExpenseModal.jsx';
import MaterialsTable from '#components/expenses/MaterialsTable.jsx';
import MaterialModal from '#components/expenses/MaterialModal.jsx';
import MaterialTransactionModal from '#components/expenses/MaterialTransactionModal.jsx';
import Button from '#components/ui/Button.jsx';
import Skeleton from '#components/ui/Skeleton.jsx';

export default function ExpensesPage() {
    const queryClient = useQueryClient();
    const [expensesPage, setExpensesPage] = useState(1);
    const [materialsPage, setMaterialsPage] = useState(1);
    const limit = 5;

    const { data: expensesData, isFetching: isFetchingExpenses, isError: isExpensesError, error: expensesError } = useExpenses(expensesPage, limit);
    const { data: materialsData, isFetching: isFetchingMaterials, isError: isMaterialsError, error: materialsError } = useMaterials(materialsPage, limit);

    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);

    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);

    const [isTxModalOpen, setIsTxModalOpen] = useState(false);
    const [txMaterial, setTxMaterial] = useState(null);
    const [txError, setTxError] = useState(null);

    // --- Expense Mutations ---
    const invalidateExpenses = () => queryClient.invalidateQueries({ queryKey: ['expenses'] });

    const createExpenseMut = useMutation({
        mutationFn: createExpense,
        onSuccess: () => { invalidateExpenses(); setIsExpenseModalOpen(false); }
    });
    const updateExpenseMut = useMutation({
        mutationFn: ({ id, updates }) => updateExpense(id, updates),
        onSuccess: () => { invalidateExpenses(); setIsExpenseModalOpen(false); setEditingExpense(null); }
    });
    const deleteExpenseMut = useMutation({
        mutationFn: deleteExpense,
        onSuccess: invalidateExpenses
    });

    const handleSaveExpense = (data) => {
        if (editingExpense) {
            updateExpenseMut.mutate({ id: editingExpense.expense_id, updates: data });
        } else {
            createExpenseMut.mutate(data);
        }
    };
    const handleDeleteExpense = (exp) => {
        if (window.confirm(`Delete expense "${exp.title}"?`)) {
            deleteExpenseMut.mutate(exp.expense_id);
        }
    };

    // --- Material Mutations ---
    const invalidateMaterials = () => queryClient.invalidateQueries({ queryKey: ['materials'] });

    const createMaterialMut = useMutation({
        mutationFn: createMaterial,
        onSuccess: () => { 
            invalidateMaterials(); 
            invalidateExpenses();
            setIsMaterialModalOpen(false); 
        }
    });
    const updateMaterialMut = useMutation({
        mutationFn: ({ id, updates }) => updateMaterial(id, updates),
        onSuccess: () => { invalidateMaterials(); setIsMaterialModalOpen(false); setEditingMaterial(null); }
    });
    const deleteMaterialMut = useMutation({
        mutationFn: deleteMaterial,
        onSuccess: invalidateMaterials
    });

    const handleSaveMaterial = (data) => {
        if (editingMaterial) {
            updateMaterialMut.mutate({ id: editingMaterial.material_id, updates: data });
        } else {
            createMaterialMut.mutate(data);
        }
    };
    const handleDeleteMaterial = (mat) => {
        if (window.confirm(`Delete material "${mat.material_name}"?`)) {
            deleteMaterialMut.mutate(mat.material_id);
        }
    };

    // --- Transaction Mutation ---
    const createTxMut = useMutation({
        mutationFn: ({ materialId, data }) => createMaterialTransaction(materialId, data),
        onSuccess: () => {
            invalidateMaterials();
            invalidateExpenses();
            setIsTxModalOpen(false);
            setTxMaterial(null);
            setTxError(null);
        },
        onError: (err) => {
            const msg = err.response?.data?.message || 'Failed to log transaction.';
            setTxError(msg);
        }
    });

    const handleSaveTx = (data) => {
        setTxError(null);
        createTxMut.mutate({ materialId: data.material_id, data });
    };

    if ((isFetchingExpenses && !expensesData) || (isFetchingMaterials && !materialsData)) {
        return (
            <div className="w-full flex flex-col gap-6 flex-1 min-h-0">
                <Skeleton className="flex-1 min-h-0 w-full rounded-2xl" />
                <Skeleton className="flex-1 min-h-0 w-full rounded-2xl" />
            </div>
        );
    }

    if (isExpensesError || isMaterialsError) {
        return (
            <div className="w-full text-center py-20 text-red-600">
                Error loading data: {expensesError?.message || materialsError?.message || 'Unknown error occurred.'}
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-6 animate-fadeIn flex-1 min-h-0">
            {/* Expenses Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0] flex flex-col gap-4 flex-1 min-h-0">
                <div className="flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-semibold font-headline text-[#0F1D29]">Expenses</h2>
                    <Button variant="primary" onClick={() => { setEditingExpense(null); setIsExpenseModalOpen(true); }}>
                        + New Expense
                    </Button>
                </div>
                <ExpensesTable
                    expenses={expensesData?.expenses ?? []}
                    isFetching={isFetchingExpenses}
                    onEdit={(exp) => { setEditingExpense(exp); setIsExpenseModalOpen(true); }}
                    onDelete={handleDeleteExpense}
                />
                {expensesData && expensesData.totalCount > 0 && (
                    <div className="flex items-center justify-between mt-auto pt-4 shrink-0 border-t border-[#f0f0f0]">
                        <Button
                            variant="secondary"
                            disabled={expensesPage === 1}
                            onClick={() => setExpensesPage((p) => Math.max(1, p - 1))}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-gray-600 font-body">
                            Page {expensesData.currentPage} of {expensesData.totalPages}
                        </span>
                        <Button
                            variant="secondary"
                            disabled={expensesPage === expensesData.totalPages}
                            onClick={() => setExpensesPage((p) => Math.min(expensesData.totalPages, p + 1))}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>

            {/* Materials Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0] flex flex-col gap-4 flex-1 min-h-0">
                <div className="flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-semibold font-headline text-[#0F1D29]">Materials & Stock</h2>
                    <Button variant="primary" onClick={() => { setEditingMaterial(null); setIsMaterialModalOpen(true); }}>
                        + New Material
                    </Button>
                </div>
                <MaterialsTable
                    materials={materialsData?.materials ?? []}
                    isFetching={isFetchingMaterials}
                    onEdit={(mat) => { setEditingMaterial(mat); setIsMaterialModalOpen(true); }}
                    onDelete={handleDeleteMaterial}
                    onTransaction={(mat) => { setTxMaterial(mat); setTxError(null); setIsTxModalOpen(true); }}
                />
                {materialsData && materialsData.totalCount > 0 && (
                    <div className="flex items-center justify-between mt-auto pt-4 shrink-0 border-t border-[#f0f0f0]">
                        <Button
                            variant="secondary"
                            disabled={materialsPage === 1}
                            onClick={() => setMaterialsPage((p) => Math.max(1, p - 1))}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-gray-600 font-body">
                            Page {materialsData.currentPage} of {materialsData.totalPages}
                        </span>
                        <Button
                            variant="secondary"
                            disabled={materialsPage === materialsData.totalPages}
                            onClick={() => setMaterialsPage((p) => Math.min(materialsData.totalPages, p + 1))}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ExpenseModal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                onSave={handleSaveExpense}
                isSaving={createExpenseMut.isPending || updateExpenseMut.isPending}
                initialExpense={editingExpense}
            />

            <MaterialModal
                isOpen={isMaterialModalOpen}
                onClose={() => setIsMaterialModalOpen(false)}
                onSave={handleSaveMaterial}
                isSaving={createMaterialMut.isPending || updateMaterialMut.isPending}
                initialMaterial={editingMaterial}
            />

            <MaterialTransactionModal
                isOpen={isTxModalOpen}
                onClose={() => setIsTxModalOpen(false)}
                onSave={handleSaveTx}
                isSaving={createTxMut.isPending}
                targetMaterial={txMaterial}
                error={txError}
            />
        </div>
    );
}