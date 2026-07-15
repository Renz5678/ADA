import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Button from '../ui/Button.jsx';
import { getMaterials } from '#api/materials.js';

export default function ProductModal({ isOpen, onClose, onSave, isSaving, initialProduct }) {
    const isEditing = Boolean(initialProduct);

    const [productCode, setProductCode] = useState('');
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [estimatedDays, setEstimatedDays] = useState('');
    const [image, setImage] = useState(null);
    const [materials, setMaterials] = useState([]);
    
    const [selectedMaterialId, setSelectedMaterialId] = useState('');
    const [quantityRequired, setQuantityRequired] = useState('');

    // Fetch global materials for the dropdown
    const { data: globalMaterialsData } = useQuery({
        queryKey: ['materials', 'all'],
        queryFn: () => getMaterials(1, 1000), // fetch all
        enabled: Boolean(isOpen),
    });

    const globalMaterials = useMemo(() => globalMaterialsData?.materials || [], [globalMaterialsData]);

    // Re-sync form fields whenever a different product is opened for editing (or the modal opens fresh for create)
    useEffect(() => {
        if (isOpen) {
            setProductCode(initialProduct?.product_code ?? '');
            setProductName(initialProduct?.product_name ?? '');
            setPrice(initialProduct?.price ?? '');
            setDescription(initialProduct?.description ?? '');
            setEstimatedDays(initialProduct?.estimated_days ?? '');
            setImage(null);
            
            // Re-sync existing materials if editing
            if (initialProduct?.ProductMaterials) {
                setMaterials(initialProduct.ProductMaterials.map(pm => ({
                    material_id: pm.material_id,
                    quantity_required: pm.quantity_required,
                    material_name: globalMaterials.find(m => m.material_id === pm.material_id)?.material_name || pm.material_id
                })));
            } else {
                setMaterials([]);
            }
        }
    }, [isOpen, initialProduct, globalMaterials]);

    if (!isOpen) return null;

    const handleAddMaterial = (e) => {
        e.preventDefault();
        if (!selectedMaterialId || !quantityRequired) return;

        const materialObj = globalMaterials.find(m => m.material_id === Number(selectedMaterialId));
        if (!materialObj) return;

        setMaterials(prev => [...prev, {
            material_id: materialObj.material_id,
            material_name: materialObj.material_name,
            quantity_required: Number(quantityRequired)
        }]);

        setSelectedMaterialId('');
        setQuantityRequired('');
    };

    const handleRemoveMaterial = (materialId) => {
        setMaterials(prev => prev.filter(m => m.material_id !== materialId));
    };

    const availableMaterials = globalMaterials.filter(
        gm => !materials.some(m => m.material_id === gm.material_id)
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('product_code', productCode);
        formData.append('product_name', productName);
        formData.append('price', price);
        
        if (description) formData.append('description', description);
        if (estimatedDays) formData.append('estimated_days', estimatedDays);
        if (image) formData.append('image', image);
        
        formData.append('materials', JSON.stringify(materials.map(m => ({
            material_id: m.material_id,
            quantity_required: Number(m.quantity_required)
        }))));

        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-[#0F1D29]/60 backdrop-blur-sm z-50 flex justify-center items-center animate-fadeIn p-4">
            <div className="w-full sm:w-[600px] max-w-2xl bg-[#FFF7E6] border border-[#e8d5b5] rounded-3xl p-6 flex flex-col gap-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] animate-zoomIn max-h-[95vh] overflow-hidden">
                <h3 className="font-headline text-xl font-bold text-[#8D4A52] text-center border-b border-[#e8d5b5] pb-4 shrink-0">
                    {isEditing ? 'Edit Product' : 'New Product'}
                </h3>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                    
                    <div className="flex flex-col gap-2">
                        <label className="block text-sm font-label text-[#0F1D29]">Product Image (Optional)</label>
                        
                        {(image || (isEditing && initialProduct?.image_url)) && (
                            <div className="w-full max-w-[200px] h-32 rounded-xl overflow-hidden border border-[#e8d5b5] bg-white mb-2">
                                <img 
                                    src={image ? URL.createObjectURL(image) : initialProduct?.image_url} 
                                    alt="Product Preview" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <input
                            type="file"
                            accept="image/jpeg, image/png, image/webp"
                            onChange={(e) => setImage(e.target.files[0])}
                            className="w-full text-sm font-body file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#8D4A52] file:text-white hover:file:bg-[#6b353d]"
                        />
                        {isEditing && initialProduct?.image_url && !image && (
                            <p className="text-xs text-gray-500 mt-1">Current image will be kept unless you upload a new one.</p>
                        )}
                    </div>

                    <div className="flex gap-3 flex-col sm:flex-row">
                        <div className="flex-1">
                            <label className="block text-sm mb-1 font-label text-[#0F1D29]">Product Code</label>
                            <input
                                type="text"
                                value={productCode}
                                onChange={(e) => setProductCode(e.target.value)}
                                placeholder="e.g. CP01"
                                required
                                className="border border-[#e8d5b5] bg-white rounded-xl px-4 py-2.5 w-full text-sm font-body shadow-sm focus:border-[#8D4A52] focus:ring-1 focus:ring-[#8D4A52] outline-none transition"
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm mb-1 font-label text-[#0F1D29]">Product Name</label>
                            <input
                                type="text"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                placeholder="e.g. Custom Portrait"
                                required
                                className="border border-[#e8d5b5] bg-white rounded-xl px-4 py-2.5 w-full text-sm font-body shadow-sm focus:border-[#8D4A52] focus:ring-1 focus:ring-[#8D4A52] outline-none transition"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 flex-col sm:flex-row">
                        <div className="flex-1">
                            <label className="block text-sm mb-1 font-label text-[#0F1D29]">Price (₱)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0.00"
                                required
                                className="border border-[#e8d5b5] bg-white rounded-xl px-4 py-2.5 w-full text-sm font-body shadow-sm focus:border-[#8D4A52] focus:ring-1 focus:ring-[#8D4A52] outline-none transition"
                            />
                        </div>
                        
                        <div className="flex-1">
                            <label className="block text-sm mb-1 font-label text-[#0F1D29]">Estimated Days (Optional)</label>
                            <input
                                type="number"
                                min="1"
                                value={estimatedDays}
                                onChange={(e) => setEstimatedDays(e.target.value)}
                                placeholder="e.g. 5"
                                className="border border-[#e8d5b5] bg-white rounded-xl px-4 py-2.5 w-full text-sm font-body shadow-sm focus:border-[#8D4A52] focus:ring-1 focus:ring-[#8D4A52] outline-none transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm mb-1 font-label text-[#0F1D29]">Description (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your product..."
                            rows={3}
                            className="border border-[#e8d5b5] bg-white rounded-xl px-4 py-2.5 w-full text-sm font-body shadow-sm focus:border-[#8D4A52] focus:ring-1 focus:ring-[#8D4A52] outline-none transition"
                        />
                    </div>

                    <div className="w-full h-px bg-[#e8d5b5] my-1" />

                    <div>
                        <label className="block text-sm mb-2 font-label text-[#0F1D29] font-semibold">Bill of Materials (Optional)</label>
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row gap-2 items-end">
                                <div className="flex-1">
                                    <select
                                        value={selectedMaterialId}
                                        onChange={(e) => setSelectedMaterialId(e.target.value)}
                                        className="border border-[#e8d5b5] bg-white rounded-xl px-4 py-2 w-full text-sm font-body shadow-sm focus:border-[#8D4A52] focus:ring-1 focus:ring-[#8D4A52] outline-none transition disabled:bg-gray-100"
                                    >
                                        <option value="" disabled>Choose material...</option>
                                        {availableMaterials.map(m => (
                                            <option key={m.material_id} value={m.material_id}>
                                                {m.material_name} ({m.material_code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-full sm:w-24">
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={quantityRequired}
                                        onChange={(e) => setQuantityRequired(e.target.value)}
                                        placeholder="Qty"
                                        className="border border-[#e8d5b5] bg-white rounded-xl px-4 py-2 w-full text-sm font-body shadow-sm focus:border-[#8D4A52] focus:ring-1 focus:ring-[#8D4A52] outline-none transition"
                                    />
                                </div>
                                <Button 
                                    variant="secondary" 
                                    type="button" 
                                    onClick={handleAddMaterial}
                                    disabled={!selectedMaterialId || !quantityRequired}
                                    className="py-2"
                                >
                                    Add
                                </Button>
                            </div>

                            {materials.length > 0 && (
                                <div className="max-h-[150px] overflow-auto border border-[#e8d5b5] rounded-xl bg-white shadow-sm">
                                    <table className="min-w-full divide-y divide-gray-100">
                                        <tbody className="divide-y divide-gray-100">
                                            {materials.map(pm => (
                                                <tr key={pm.material_id} className="text-sm">
                                                    <td className="px-3 py-2 text-gray-900">{pm.material_name || pm.material_id}</td>
                                                    <td className="px-3 py-2 text-right font-semibold text-gray-900">{pm.quantity_required}</td>
                                                    <td className="px-3 py-2 text-right">
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleRemoveMaterial(pm.material_id)}
                                                            className="text-red-500 hover:text-red-700 font-semibold"
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full h-px bg-[#e8d5b5] my-1" />

                    <div className="flex flex-col gap-2 shrink-0">
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={isSaving}
                            className="w-full"
                        >
                            {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Product'}
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