import { useState, useEffect } from 'react';
import Button from '../ui/Button.jsx';

export default function MaterialTransactionModal({ isOpen, onClose, onSave, isSaving, targetMaterial, error }) {
    const [type, setType] = useState('Purchase');
    const [quantity, setQuantity] = useState('');
    const [unitCost, setUnitCost] = useState('');
    const [dateBought, setDateBought] = useState('');

    useEffect(() => {
        if (isOpen) {
            setType('Purchase');
            setQuantity('');
            setUnitCost(targetMaterial?.unit_cost ?? '');
            setDateBought(new Date().toISOString().split('T')[0]);
        }
    }, [isOpen, targetMaterial]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            material_id: targetMaterial?.material_id,
            type,
            quantity: Number(quantity),
            unit_cost: Number(unitCost),
            date_bought: dateBought
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex justify-center items-center animate-fadeIn">
            <div className="w-[90%] sm:w-full max-w-sm bg-white rounded-2xl p-6 flex flex-col gap-4 shadow-lg animate-zoomIn">
                <h3 className="font-headline text-lg font-semibold text-[#0F1D29] text-center">
                    Log Transaction: {targetMaterial?.material_name}
                </h3>

                {error && (
                    <div className="bg-[#FFECED] text-[#AB626A] text-sm p-3 rounded-lg border border-[#FFB2B9] animate-fadeIn">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div>
                        <label className="block text-sm mb-1 font-label text-[#0F1D29]">Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="border border-[#c1c1c1] rounded-lg px-3 py-2 w-full text-sm font-body bg-white"
                        >
                            <option value="Purchase">Purchase (Add Stock)</option>
                            <option value="Usage">Usage (Remove Stock)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm mb-1 font-label text-[#0F1D29]">Quantity</label>
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
                        <label className="block text-sm mb-1 font-label text-[#0F1D29]">Date</label>
                        <input
                            type="date"
                            value={dateBought}
                            onChange={(e) => setDateBought(e.target.value)}
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
                            {isSaving ? 'Saving...' : 'Log Transaction'}
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
