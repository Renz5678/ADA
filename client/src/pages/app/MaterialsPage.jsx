import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useMaterials } from '#hooks/useMaterials.js';
import { createMaterial, updateMaterial, deleteMaterial } from '#api/materials.js';
import { createMaterialTransaction } from '#api/materialTransactions.js';
import MaterialsTable from '#components/expenses/MaterialsTable.jsx';
import MaterialModal from '#components/expenses/MaterialModal.jsx';
import MaterialTransactionModal from '#components/expenses/MaterialTransactionModal.jsx';
import ConfirmModal from '#components/ui/ConfirmModal.jsx';
import Button from '#components/ui/Button.jsx';
import Skeleton from '#components/ui/Skeleton.jsx';

export default function MaterialsPage() {
    const queryClient = useQueryClient();
    const [materialsPage, setMaterialsPage] = useState(1);
    const limit = 5;

    const { data: materialsData, isFetching: isFetchingMaterials, isError: isMaterialsError, error: materialsError } = useMaterials(materialsPage, limit);

    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [isTxModalOpen, setIsTxModalOpen] = useState(false);
    const [txMaterial, setTxMaterial] = useState(null);
    const [txError, setTxError] = useState(null);
    const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    const openConfirm = (title, message, onConfirm) => setConfirmState({ isOpen: true, title, message, onConfirm });
    const closeConfirm = () => setConfirmState(s => ({ ...s, isOpen: false }));

    const invalidateMaterials = () => queryClient.invalidateQueries({ queryKey: ['materials'] });

    const createMaterialMut = useMutation({ mutationFn: createMaterial, onSuccess: () => { invalidateMaterials(); setIsMaterialModalOpen(false); toast.success('Material created!'); }, onError: (err) => toast.error(err.response?.data?.message || 'Failed.') });
    const updateMaterialMut = useMutation({ mutationFn: ({ id, updates }) => updateMaterial(id, updates), onSuccess: () => { invalidateMaterials(); setIsMaterialModalOpen(false); setEditingMaterial(null); toast.success('Material updated!'); }, onError: (err) => toast.error(err.response?.data?.message || 'Failed.') });
    const deleteMaterialMut = useMutation({ mutationFn: deleteMaterial, onSuccess: () => { invalidateMaterials(); closeConfirm(); toast.success('Material deleted.'); }, onError: (err) => toast.error(err.response?.data?.message || 'Failed.') });
    const createTxMut = useMutation({ mutationFn: ({ materialId, data }) => createMaterialTransaction(materialId, data), onSuccess: () => { invalidateMaterials(); setIsTxModalOpen(false); setTxMaterial(null); setTxError(null); toast.success('Transaction logged!'); }, onError: (err) => { const msg = err.response?.data?.message || 'Failed.'; setTxError(msg); toast.error(msg); } });

    const handleSaveMaterial = (data) => { if (editingMaterial) updateMaterialMut.mutate({ id: editingMaterial.material_id, updates: data }); else createMaterialMut.mutate(data); };
    const handleDeleteMaterial = (mat) => openConfirm(`Delete material?`, `Are you sure you want to delete "${mat.material_name}"? This can't be undone.`, () => deleteMaterialMut.mutate(mat.material_id));
    const handleSaveTx = (data) => { setTxError(null); createTxMut.mutate({ materialId: data.material_id, data }); };

    if (isFetchingMaterials && !materialsData) {
        return (
            <div className="w-full flex flex-col gap-6 flex-1 min-h-0">
                <Skeleton className="h-24 w-full rounded-2xl shrink-0" />
                <Skeleton className="flex-1 min-h-0 w-full rounded-2xl" />
            </div>
        );
    }

    if (isMaterialsError) return <div className="w-full text-center py-20 text-red-600">Error: {materialsError?.message}</div>;

    return (
        <div className="w-full flex flex-col gap-6 animate-fadeIn flex-1 min-h-0">
            <div className="shrink-0">
                <h1 className="text-xl sm:text-2xl font-semibold font-headline text-[#0F1D29]">Stock & Materials</h1>
                <p className="text-sm text-gray-500 mt-1 font-body">Manage your raw materials and stock levels.</p>
            </div>

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

            <MaterialModal isOpen={isMaterialModalOpen} onClose={() => setIsMaterialModalOpen(false)} onSave={handleSaveMaterial} isSaving={createMaterialMut.isPending || updateMaterialMut.isPending} initialMaterial={editingMaterial} />
            <MaterialTransactionModal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} onSave={handleSaveTx} isSaving={createTxMut.isPending} targetMaterial={txMaterial} error={txError} />
            <ConfirmModal isOpen={confirmState.isOpen} onClose={closeConfirm} onConfirm={confirmState.onConfirm} title={confirmState.title} message={confirmState.message} />
        </div>
    );
}
