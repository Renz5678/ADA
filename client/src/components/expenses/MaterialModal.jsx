import { useState, useEffect } from 'react';
import Button from '../ui/Button.jsx';

export default function MaterialModal({ isOpen, onClose, onSave, isSaving, initialMaterial }) {
    const isEditing = Boolean(initialMaterial);

    const [materialCode, setMaterialCode] = useState('');
    const [materialName, setMaterialName] = useState('');
    const [unitCost, setUnitCost] = useState('');
    const [quantity, setQuantity] = useState('');

    useEffect(() => {
        if (isOpen) {
            setMaterialCode(initialMaterial?.material_code ?? '');
            setMaterialName(initialMaterial?.material_name ?? '');
            setUnitCost(initialMaterial?.unit_cost ?? '');
            setQuantity(initialMaterial?.quantity ?? '');
        }
    }, [isOpen, initialMaterial]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            material_code: materialCode,
            material_name: materialName,
            unit_cost: Number(unitCost),
            quantity: Number(quantity)
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex justify-center items-center animate-fadeIn">
            <div className="w-[90%] sm:w-full max-w-sm bg-white rounded-2xl p-6 flex flex-col gap-4 shadow-lg animate-zoomIn">
                <h3 className="font-headline text-lg font-semibold text-[#0F1D29] text-center">
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
                            className="border border-[#c1c1c1] rounded-lg px-3 py-2 w-full text-sm font-body"
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
                            className="border border-[#c1c1c1] rounded-lg px-3 py-2 w-full text-sm font-body"
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
                            className="border border-[#c1c1c1] rounded-lg px-3 py-2 w-full text-sm font-body"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 font-label text-[#0F1D29]">Current Quantity</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="0"
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
