// src/components/products/ProductsTable.jsx
import Button from '../ui/Button.jsx';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

const ProductsTable = ({ products, isFetching, onEdit, onDelete }) => {
    if (products.length === 0) {
        return <div className="text-center py-10 text-gray-500">No products found.</div>;
    }

    return (
        <div className={`flex-1 min-h-0 overflow-auto transition-opacity duration-150 ${isFetching ? 'opacity-60' : ''}`}>

            {/* Mobile card view */}
            <div className="flex flex-col gap-3 md:hidden">
                {products.map((product) => (
                    <div key={product.product_id} className="bg-white rounded-xl border border-[#e8d5b5] p-4 flex flex-col gap-3 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="font-headline font-semibold text-[#0F1D29]">{product.product_name}</span>
                            <span className="text-xs font-medium text-[#8D4A52] bg-[#FFF7E6] px-2 py-1 rounded-full">{product.product_code}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-sm">
                            <span className="text-gray-500">Price</span>
                            <span className="text-right font-semibold text-[#8D4A52]">{formatCurrency(product.price)}</span>
                        </div>
                        <div className="flex gap-2 pt-1 border-t border-[#f0f0f0]">
                            <Button variant="secondary" onClick={() => onEdit(product)} className="flex-1">Edit</Button>
                            <Button variant="danger" onClick={() => onDelete(product)} className="flex-1">Delete</Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block rounded-lg border border-[#c1c1c1] overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#F5F3F3] sticky top-0 z-10 shadow-[0_1px_0_0_#f0f0f0]">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-[#0F1D29] uppercase font-label">Code</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-[#0F1D29] uppercase font-label">Product Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-[#0F1D29] uppercase font-label">Price</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-[#0F1D29] uppercase font-label">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {products.map((product) => (
                            <tr key={product.product_id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-[#8D4A52]">{product.product_code}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{product.product_name}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(product.price)}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="secondary" onClick={() => onEdit(product)}>Edit</Button>
                                        <Button variant="danger" onClick={() => onDelete(product)}>Delete</Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductsTable;