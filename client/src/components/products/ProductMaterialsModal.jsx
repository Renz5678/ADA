import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '../ui/Button.jsx';
import { getProductMaterials, addProductMaterial, removeProductMaterial } from '#api/productMaterials.js';
import { getMaterials } from '#api/materials.js';

export default function ProductMaterialsModal({ isOpen, onClose, product }) {
    const queryClient = useQueryClient();
    const [selectedMaterialId, setSelectedMaterialId] = useState('');
    const [quantityRequired, setQuantityRequired] = useState('');

    // Fetch existing materials assigned to the product
    const { data: productMaterialsData, isLoading: isLoadingProductMaterials } = useQuery({
        queryKey: ['productMaterials', product?.product_id],
        queryFn: () => getProductMaterials(product.product_id),
        enabled: Boolean(isOpen && product?.product_id),
    });

    const productMaterials = productMaterialsData || [];

    // Fetch global materials for the dropdown
    const { data: globalMaterialsData, isLoading: isLoadingGlobalMaterials } = useQuery({
        queryKey: ['materials', 'all'],
        queryFn: () => getMaterials(1, 1000), // Fetch a large limit or a dedicated endpoint for list
        enabled: Boolean(isOpen),
    });

    const globalMaterials = globalMaterialsData?.materials || [];

    const invalidateProductMaterials = () => queryClient.invalidateQueries({ queryKey: ['productMaterials', product?.product_id] });

    const addMutation = useMutation({
        mutationFn: (data) => addProductMaterial(product.product_id, data),
        onSuccess: () => {
            invalidateProductMaterials();
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setSelectedMaterialId('');
            setQuantityRequired('');
            toast.success('Material added to product!');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to add material.')
    });

    const removeMutation = useMutation({
        mutationFn: (materialId) => removeProductMaterial(product.product_id, materialId),
        onSuccess: () => {
            invalidateProductMaterials();
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Material removed from product!');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to remove material.')
    });

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedMaterialId('');
            setQuantityRequired('');
        }
    }, [isOpen]);

    if (!isOpen || !product) return null;

    const handleAdd = (e) => {
        e.preventDefault();
        if (!selectedMaterialId || !quantityRequired) return;
        
        addMutation.mutate({
            material_id: Number(selectedMaterialId),
            quantity_required: Number(quantityRequired)
        });
    };

    const handleRemove = (materialId) => {
        if (window.confirm('Remove this material requirement?')) {
            removeMutation.mutate(materialId);
        }
    };

    // Filter out materials that are already added
    const availableMaterials = globalMaterials.filter(
        gm => !productMaterials.some(pm => pm.material_id === gm.material_id)
    );

    return (
        <div className="fixed inset-0 bg-[#0F1D29]/60 backdrop-blur-sm z-50 flex justify-center items-center animate-fadeIn p-4">
            <div className="w-full sm:w-[600px] min-w-0 max-w-2xl bg-[#FFF7E6] border border-[#e8d5b5] rounded-3xl p-5 sm:p-7 flex flex-col gap-4 sm:gap-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] animate-zoomIn max-h-[90vh] overflow-hidden">
                
                <div className="flex justify-between items-center border-b border-[#e8d5b5] pb-4 shrink-0">
                    <h3 className="font-headline text-lg sm:text-xl font-bold text-[#8D4A52] truncate pr-4">
                        Bill of Materials: {product.product_name}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Add Material Form */}
                <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 items-end bg-white p-4 rounded-xl shadow-sm border border-[#e8d5b5] shrink-0 w-full">
                    <div className="w-full sm:flex-1">
                        <label className="block text-sm mb-1 font-label text-[#0F1D29]">Select Material</label>
                        <select
                            value={selectedMaterialId}
                            onChange={(e) => setSelectedMaterialId(e.target.value)}
                            required
                            disabled={isLoadingGlobalMaterials}
                            className="border border-[#e8d5b5] bg-white rounded-xl px-4 py-2.5 w-full text-sm font-body shadow-sm focus:border-[#8D4A52] focus:ring-1 focus:ring-[#8D4A52] outline-none transition disabled:bg-gray-100"
                        >
                            <option value="" disabled>Choose a material...</option>
                            {availableMaterials.map(m => (
                                <option key={m.material_id} value={m.material_id}>
                                    {m.material_name} ({m.material_code})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full sm:w-32">
                        <label className="block text-sm mb-1 font-label text-[#0F1D29]">Required Qty</label>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={quantityRequired}
                            onChange={(e) => setQuantityRequired(e.target.value)}
                            placeholder="e.g. 5"
                            required
                            className="border border-[#e8d5b5] bg-white rounded-xl px-4 py-2.5 w-full text-sm font-body shadow-sm focus:border-[#8D4A52] focus:ring-1 focus:ring-[#8D4A52] outline-none transition"
                        />
                    </div>

                    <div className="w-full sm:w-auto">
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={addMutation.isPending || !selectedMaterialId || !quantityRequired}
                            className="w-full sm:w-auto py-2.5"
                        >
                            {addMutation.isPending ? 'Adding...' : 'Add'}
                        </Button>
                    </div>
                </form>

                {/* Materials List */}
                <div className="flex-1 overflow-x-auto overflow-y-auto rounded-xl border border-[#e8d5b5] bg-white shadow-sm min-h-[200px] w-full min-w-0">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#F5F3F3] sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[#0F1D29] uppercase font-label">Code</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[#0F1D29] uppercase font-label">Material Name</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-[#0F1D29] uppercase font-label whitespace-nowrap">Required Qty</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-[#0F1D29] uppercase font-label">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoadingProductMaterials ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-6 text-gray-500">Loading materials...</td>
                                </tr>
                            ) : productMaterials.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-6 text-gray-500">No materials assigned to this product yet.</td>
                                </tr>
                            ) : (
                                productMaterials.map(pm => (
                                    <tr key={pm.material_id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-[#8D4A52] font-medium whitespace-nowrap">{pm.Material?.material_code}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900 min-w-[120px]">{pm.Material?.material_name}</td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-900 font-semibold whitespace-nowrap">{pm.quantity_required}</td>
                                        <td className="px-4 py-3 text-center whitespace-nowrap">
                                            <button 
                                                onClick={() => handleRemove(pm.material_id)}
                                                disabled={removeMutation.isPending}
                                                className="text-red-500 hover:text-red-700 font-semibold text-sm transition disabled:opacity-50"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end pt-2 shrink-0">
                    <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
