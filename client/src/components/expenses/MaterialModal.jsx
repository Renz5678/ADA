import { useState, useEffect } from 'react';
import Button from '../ui/Button.jsx';

export default function MaterialModal({ isOpen, onClose, onSave, isSaving, initialMaterial }) {
    const isEditing = Boolean(initialMaterial);

    const [materialCode, setMaterialCode] = useState('');
    const [materialName, setMaterialName] = useState('');
    const [unitCost, setUnitCost] = useState('');
    const [quantity, setQuantity] = useState('');
    const [lowStockThreshold, setLowStockThreshold] = useState('');

    useEffect(() => {
        if (isOpen) {
            setMaterialCode(initialMaterial?.material_code ?? '');
            setMaterialName(initialMaterial?.material_name ?? '');
            setUnitCost(initialMaterial?.unit_cost ?? '');
            setQuantity(initialMaterial?.quantity ?? '');
            setLowStockThreshold(initialMaterial?.low_stock_threshold ?? '');
        }
    }, [isOpen, initialMaterial]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            material_code: materialCode,
            material_name: materialName,
            unit_cost: Number(unitCost),
            quantity: Number(quantity),
            low_stock_threshold: lowStockThreshold !== '' ? Number(lowStockThreshold) : undefined
        });
    };

    return (
        <div className="fixed inset-0 bg-[#0F1D29]/60 backdrop-blur-sm z-50 flex justify-center items-center animate-fadeIn">
            <div className="w-[90%] sm:w-full max-w-sm bg-[#FFF7E6] border border-[#e8d5b5] rounded-3xl p-7 flex flex-col gap-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] animate-zoomIn">
                <h3 className="font-headline text-xl font-bold text-[#8D4A52] text-center border-b border-[#e8d5b5] pb-4">
                    {isEditing ? 'Edit Material' : 'New Material'}
                </h3>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div>
                        <label className="block text-sm mb-1 font-label text-[#0F1D29]">Code</label>
                        <input
                            type="text"
                            value={materialCode}
                            onChange={(e) => setMaterialCode(e.target.value)}
                            placeholder="e.g. WOOD-01"
                            required
                            className="border border-[#e8d5b5] bg-white rounded-xl px-4 py-2.5 w-full text-sm font-body shadow-sm focus:border-[#8D4A52] focus:ring-1 focus:ring-[#8D4A52] outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 font-label text-[#0F1D29]">Name</label>
                        <input
                            type="text"
                            value={materialName}
                            onChange={(e) => setMaterialName(e.target.value)}
                            placeholder="e.g. Pine Wood"
                            required
                            className="border border-[#e8d5b5] bg-white rounded-xl px-4 py-2.5 w-full text-sm font-body shadow-sm focus:border-[#8D4A52] focus:ring-1 focus:ring-[#8D4A52] outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 font-label text-[#0F1D29]">Unit Cost</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={unitCost}
                            onChange={(e) => setUnitCost(e.target.value)}
                            placeholder="0.00"
                            required
                            className="border border-[#e8d5b5] bg-white rounded-xl px-4 py-2.5 w-full text-sm font-body shadow-sm focus:border-[#8D4A52] focus:ring-1 focus:ring-[#8D4A52] outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 font-label text-[#0F1D29]">Current Quantity</label>
                        <input
                            type="number" min="0" step="0.01"
                            value={quantity}
                            onChange={(e) => !isEditing && setQuantity(e.target.value)}
                            readOnly={isEditing}
                            placeholder="0" required
                            className={`border border-[#e8d5b5] rounded-xl px-4 py-2.5 w-full text-sm font-body shadow-sm outline-none transition ${
                                isEditing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white focus:border-[#8D4A52] focus:ring-1 focus:ring-[#8D4A52]'
                            }`}
                        />
                        {isEditing && <p className="text-xs text-gray-400 mt-1">Use &ldquo;Log Tx&rdquo; to adjust quantity and maintain transaction history.</p>}
                    </div>

                    <div>
                        <label className="block text-sm mb-1 font-label text-[#0F1D29]">Low Stock Threshold</label>
                        <input
                            type="number" min="0" step="0.01"
                            value={lowStockThreshold}
                            onChange={(e) => setLowStockThreshold(e.target.value)}
                            placeholder="e.g. 10 (defaults to 20% of initial qty)"
                            className="border border-[#e8d5b5] bg-white rounded-xl px-4 py-2.5 w-full text-sm font-body shadow-sm focus:border-[#8D4A52] focus:ring-1 focus:ring-[#8D4A52] outline-none transition"
                        />
                        <p className="text-xs text-gray-400 mt-1">A notification fires when stock drops to or below this level.</p>
                    </div>

                    <div className="w-full h-px bg-[#e8d5b5] my-2" />

                    <div className="flex flex-col gap-2">
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={isSaving}
                            className="w-full"
                        >
                            {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Material'}
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
