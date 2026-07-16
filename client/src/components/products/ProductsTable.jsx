// src/components/products/ProductsTable.jsx
import Button from '../ui/Button.jsx';
import { MdInventory2, MdLayers, MdOutlineLocalOffer, MdEdit, MdDelete, MdTimer } from 'react-icons/md';
import { motion } from 'framer-motion';

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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 font-body shrink-0 pb-10">
                {products.map((product) => (
                    <motion.div 
                        key={product.product_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#8D4A52] transition-all duration-300 flex flex-col overflow-hidden group"
                    >
                        {product.image_url ? (
                            <div className="w-full h-36 bg-gray-100 overflow-hidden relative shrink-0">
                                <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-[#8D4A52] shadow-sm">
                                    {product.product_code}
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-36 bg-[#FFF7E6] text-[#8D4A52] flex flex-col items-center justify-center shrink-0 relative">
                                <MdOutlineLocalOffer size={40} className="mb-2 opacity-50" />
                                <span className="text-xs font-medium opacity-60 uppercase tracking-widest">No Image</span>
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-[#8D4A52] shadow-sm">
                                    {product.product_code}
                                </div>
                            </div>
                        )}
                        <div className="p-5 flex flex-col flex-1">
                            <h3 className="text-lg font-bold text-[#0F1D29] mb-1 line-clamp-2 group-hover:text-[#8D4A52] transition-colors">{product.product_name}</h3>
                            
                            {product.description && (
                                <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                                    {product.description}
                                </p>
                            )}

                            <div className="flex flex-col gap-2 mb-4 mt-auto">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 text-sm font-medium">Price</span>
                                    <span className="text-lg font-bold text-[#8D4A52]">{formatCurrency(product.price)}</span>
                                </div>
                                {product.estimated_days && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 text-sm font-medium flex items-center gap-1"><MdTimer size={16} /> Est. Time</span>
                                        <span className="text-sm font-medium text-gray-700">{product.estimated_days} days</span>
                                    </div>
                                )}
                            </div>

                            {/* Freelancer details: BOM */}
                            <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100 flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Bill of Materials</span>
                                {product.ProductMaterials?.length > 0 ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                                        <MdLayers /> {product.ProductMaterials.length} Items
                                    </span>
                                ) : (
                                    <span className="text-xs font-medium text-gray-400 bg-gray-200 px-2.5 py-1 rounded-full">
                                        Not Set
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 mt-auto">
                                <Button variant="secondary" onClick={() => onManageMaterials?.(product)} className="flex-1 min-w-[80px] text-xs font-semibold py-2">BOM</Button>
                                <Button variant="secondary" onClick={() => onEdit(product)} className="flex-1 min-w-[80px] text-xs font-semibold py-2 flex items-center justify-center gap-1"><MdEdit /> Edit</Button>
                                <Button variant="danger" onClick={() => onDelete(product)} className="flex-1 min-w-[80px] text-xs font-semibold py-2 flex items-center justify-center gap-1"><MdDelete /> Delete</Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ProductsTable;