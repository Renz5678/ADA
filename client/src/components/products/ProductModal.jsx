// src/components/products/ProductModal.jsx
import { useState, useEffect } from 'react';

export default function ProductModal({ isOpen, onClose, onSave, isSaving, initialProduct }) {
    const isEditing = Boolean(initialProduct);

    const [productCode, setProductCode] = useState('');
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');

    // Re-sync form fields whenever a different product is opened for editing (or the modal opens fresh for create)
    useEffect(() => {
        if (isOpen) {
            setProductCode(initialProduct?.product_code ?? '');
            setProductName(initialProduct?.product_name ?? '');
            setPrice(initialProduct?.price ?? '');
        }
    }, [isOpen, initialProduct]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            product_code: productCode,
            product_name: productName,
            price: Number(price)
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex justify-center items-center">
            <div className="w-[90%] max-w-sm bg-white rounded-2xl p-6 flex flex-col gap-4 shadow-lg">
                <h3 className="font-headline text-lg font-semibold text-[#0F1D29] text-center">
                    {isEditing ? 'Edit Product' : 'New Product'}
                </h3>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div>
                        <label className="block text-sm mb-1 text-[#0F1D29]">Product Code</label>
                        <input
                            type="text"
                            value={productCode}
                            onChange={(e) => setProductCode(e.target.value)}
                            placeholder="e.g. CP01"
                            required
                            className="border border-[#c1c1c1] rounded-lg px-3 py-2 w-full text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-[#0F1D29]">Product Name</label>
                        <input
                            type="text"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            placeholder="e.g. Custom Portrait Ink"
                            required
                            className="border border-[#c1c1c1] rounded-lg px-3 py-2 w-full text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-[#0F1D29]">Price</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0.00"
                            required
                            className="border border-[#c1c1c1] rounded-lg px-3 py-2 w-full text-sm"
                        />
                    </div>

                    <div className="w-full h-px bg-[#f0f0f0] my-1" />

                    <div className="flex flex-col gap-2">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full h-9 rounded-full text-sm font-medium transition duration-150 bg-[#8D4A52] text-white hover:bg-[#0F1D29] disabled:opacity-60"
                        >
                            {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Product'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full h-9 rounded-full text-sm font-medium transition duration-150 border border-[#c1c1c1] text-[#0F1D29] hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}