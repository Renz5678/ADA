// src/components/products/ProductsTable.jsx
import Button from '../ui/Button.jsx';
import { MdInventory2, MdLayers } from 'react-icons/md';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

const ProductsTable = ({ products, isFetching, onEdit, onDelete, onManageMaterials }) => {
    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="text-5xl text-gray-400"><MdInventory2 /></div>
                <p className="text-gray-500 font-body text-sm">No products yet.</p>
                <p className="text-gray-400 text-xs">Add your first product using the button above.</p>
            </div>
        );
    }

    return (
        <div className={`flex-1 min-h-0 overflow-auto transition-opacity duration-150 ${isFetching ? 'opacity-60' : ''}`}>

            {/* Mobile card view */}
            <div className="flex flex-col gap-3 md:hidden">
                {products.map((product) => (
                    <div key={product.product_id} className="bg-white rounded-xl border border-[#e8d5b5] p-4 flex flex-col gap-3 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="font-headline font-semibold text-[#0F1D29] truncate">{product.product_name}</span>
                                {product.ProductMaterials?.length > 0 && (
                                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1"><MdLayers /> {product.ProductMaterials.length}</span>
                                )}
                            </div>
                            <span className="text-xs font-medium text-[#8D4A52] bg-[#FFF7E6] px-2 py-1 rounded-full shrink-0">{product.product_code}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-sm">
                            <span className="text-gray-500">Price</span>
                            <span className="text-right font-semibold text-[#8D4A52]">{formatCurrency(product.price)}</span>
                        </div>
                        <div className="flex gap-2 pt-1 border-t border-[#f0f0f0]">
                            <Button variant="secondary" onClick={() => onManageMaterials?.(product)} className="flex-1 text-xs">Materials</Button>
                            <Button variant="secondary" onClick={() => onEdit(product)} className="flex-1 text-xs">Edit</Button>
                            <Button variant="danger" onClick={() => onDelete(product)} className="flex-1 text-xs">Delete</Button>
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
                            <th className="px-4 py-3 text-left text-xs font-medium text-[#0F1D29] uppercase font-label">BOM</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-[#0F1D29] uppercase font-label">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {products.map((product) => (
                            <tr key={product.product_id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-[#8D4A52]">{product.product_code}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{product.product_name}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(product.price)}</td>
                                <td className="px-4 py-3 text-sm">
                                    {product.ProductMaterials?.length > 0 ? (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full"><MdLayers /> {product.ProductMaterials.length}</span>
                                    ) : (
                                        <span className="text-xs text-gray-400">None</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="secondary" onClick={() => onManageMaterials?.(product)}>Materials</Button>
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