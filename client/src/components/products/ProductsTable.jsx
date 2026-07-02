// src/components/products/ProductsTable.jsx
import Button from '../ui/Button.jsx';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

const ProductsTable = ({ products, isFetching, onEdit, onDelete }) => {
    if (products.length === 0) {
        return <div className="text-center py-10 text-gray-500">No products found.</div>;
    }

    return (
        <div className={`overflow-x-auto rounded-lg border border-gray-200 ${isFetching ? 'opacity-60' : ''}`}>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
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
    );
};

export default ProductsTable;