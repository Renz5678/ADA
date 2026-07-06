import { useState, useEffect } from 'react';
import Button from '../ui/Button.jsx';

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
        <div className="fixed inset-0 bg-[#0F1D29]/60 backdrop-blur-sm z-50 flex justify-center items-center animate-fadeIn">
            <div className="w-[90%] sm:w-full max-w-sm bg-[#FFF7E6] border border-[#e8d5b5] rounded-3xl p-7 flex flex-col gap-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] animate-zoomIn">
                <h3 className="font-headline text-xl font-bold text-[#8D4A52] text-center border-b border-[#e8d5b5] pb-4">
                    {isEditing ? 'Edit Product' : 'New Product'}
                </h3>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div>
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

                    <div>
                        <label className="block text-sm mb-1 font-label text-[#0F1D29]">Product Name</label>
                        <input
                            type="text"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            placeholder="e.g. Custom Portrait Ink"
                            required
                            className="border border-[#e8d5b5] bg-white rounded-xl px-4 py-2.5 w-full text-sm font-body shadow-sm focus:border-[#8D4A52] focus:ring-1 focus:ring-[#8D4A52] outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 font-label text-[#0F1D29]">Price</label>
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

                    <div className="w-full h-px bg-[#e8d5b5] my-2" />

                    <div className="flex flex-col gap-2">
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