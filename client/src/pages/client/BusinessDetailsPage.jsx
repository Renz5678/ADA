import { useParams, Link } from "react-router-dom";
import { useBusinessDetails, useCreateClientOrder } from "#hooks/useClient.js";
import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { MdArrowBack, MdOutlineLocalOffer, MdClose, MdShoppingCart, MdAdd, MdRemove } from "react-icons/md";

export default function BusinessDetailsPage() {
    const { id } = useParams();
    const { data: business, isLoading } = useBusinessDetails(id);
    const createOrderMut = useCreateClientOrder();

    const themeColor = business?.theme_color || "#8D4A52";

    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantityToAdd, setQuantityToAdd] = useState(1);
    const [deadline, setDeadline] = useState("");

    const cartTotal = useMemo(() => {
        return cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
    }, [cartItems]);

    const handleAddToCart = () => {
        if (!selectedProduct || quantityToAdd < 1) return;
        
        setCartItems(prev => {
            const existing = prev.find(item => item.product_id === selectedProduct.product_id);
            if (existing) {
                return prev.map(item => 
                    item.product_id === selectedProduct.product_id 
                        ? { ...item, quantity: item.quantity + quantityToAdd }
                        : item
                );
            }
            return [...prev, { ...selectedProduct, quantity: quantityToAdd }];
        });
        
        toast.success(`Added ${quantityToAdd} ${selectedProduct.product_name} to cart`);
        setSelectedProduct(null);
        setQuantityToAdd(1);
    };

    const handleRemoveFromCart = (productId) => {
        setCartItems(prev => prev.filter(item => item.product_id !== productId));
    };

    const handleRequestOrder = async (e) => {
        e.preventDefault();
        if (cartItems.length === 0) {
            toast.error("Your cart is empty!");
            return;
        }

        try {
            await createOrderMut.mutateAsync({
                freelancer_id: id,
                items: cartItems.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity
                })),
                deadline: deadline || null
            });
            toast.success("Order requested successfully!");
            setCartItems([]);
            setDeadline("");
            setIsCartOpen(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to request order");
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center p-4 font-body">
                <div className="animate-pulse text-gray-500">Loading business details...</div>
            </div>
        );
    }

    if (!business) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 font-body gap-4">
                <p className="text-gray-500 text-lg">Business not found</p>
                <Link to="/client/dashboard" className="text-[#8D4A52] hover:underline flex items-center gap-2">
                    <MdArrowBack /> Back to Directory
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-full p-4 lg:p-8 overflow-y-auto">
            {/* Header / Profile Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-sm relative mb-8 w-full shrink-0">
                <div className="absolute top-0 left-0 w-full h-32 overflow-hidden rounded-t-3xl z-0">
                    {business.banner_image ? (
                        <img src={business.banner_image} className="w-full h-full object-cover opacity-30" alt="banner" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-bl from-[#FFF7E6] to-transparent opacity-60 pointer-events-none"></div>
                    )}
                </div>
                
                <div className="z-10 relative flex flex-col w-full mt-2">
                    <Link to="/client/dashboard" className="inline-flex items-center gap-2 text-gray-500 transition-colors font-body text-sm mb-6 hover:opacity-80 w-max">
                        <MdArrowBack /> Back to Directory
                    </Link>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full">
                            {business.profile_picture ? (
                                <img src={business.profile_picture} alt={business.business_name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-md shrink-0 border border-gray-200" />
                            ) : (
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0F1D29] text-white flex items-center justify-center font-headline font-bold text-3xl sm:text-4xl shadow-md shrink-0">
                                    {business.business_name ? business.business_name.charAt(0).toUpperCase() : "B"}
                                </div>
                            )}
                            <div className="flex-1">
                                <h1 className="text-2xl sm:text-3xl font-headline font-bold text-[#0F1D29] break-words">{business.business_name || "Unknown Business"}</h1>
                                <p className="text-gray-500 font-body mt-1 break-all sm:break-normal">@{business.username} • {business.email}</p>
                                {business.bio && <p className="text-gray-600 font-body text-sm italic mt-2">"{business.bio}"</p>}
                            </div>
                        </div>
                        
                        <button
                            onClick={() => setIsCartOpen(true)}
                            style={{ backgroundColor: themeColor }}
                            className="w-full md:w-auto text-white px-8 py-3 rounded-full font-medium shadow-md shrink-0 text-center hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-4 md:mt-0"
                        >
                            <MdShoppingCart size={20} />
                            View Cart {cartItems.length > 0 && `(${cartItems.length})`}
                        </button>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-gray-100 w-full">
                        <h3 className="text-lg font-headline font-semibold text-[#0F1D29] mb-3">About the Business</h3>
                        {business.description ? (
                            <p className="text-gray-600 font-body text-sm whitespace-pre-line leading-relaxed max-w-4xl">{business.description}</p>
                        ) : (
                            <p className="text-gray-400 font-body text-sm italic">No description provided yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Products Catalog */}
            <div className="mb-6 shrink-0">
                <h2 className="text-2xl font-headline font-semibold text-[#0F1D29] mb-2">Product Catalog</h2>
                <p className="text-gray-500 font-body text-sm">Browse the items offered by this business. Click to view details and add to cart.</p>
            </div>

            {business.Products && business.Products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 font-body shrink-0 pb-10">
                    {business.Products.map((product) => (
                        <motion.div 
                            key={product.product_id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => { setSelectedProduct(product); setQuantityToAdd(1); }}
                            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#CBA0AA] transition-all duration-300 flex flex-col cursor-pointer overflow-hidden group"
                        >
                            {product.image_url ? (
                                <div className="w-full h-40 bg-gray-100 rounded-xl mb-4 overflow-hidden relative">
                                    <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-[#FFF7E6] text-[#8D4A52] flex items-center justify-center mb-4">
                                    <MdOutlineLocalOffer size={24} />
                                </div>
                            )}
                            <h3 className="text-lg font-bold text-[#0F1D29] mb-1 line-clamp-2 group-hover:text-[#8D4A52] transition-colors">{product.product_name}</h3>
                            
                            <div className="mt-auto pt-4 flex items-center justify-between">
                                <span className="text-gray-500 text-sm font-medium">Price</span>
                                <span className="text-xl font-bold" style={{ color: themeColor }}>₱{parseFloat(product.price).toFixed(2)}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-50 rounded-2xl p-12 flex flex-col items-center justify-center text-center border border-gray-100 border-dashed shrink-0">
                    <MdOutlineLocalOffer size={48} className="text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-[#0F1D29] mb-1">No products found</h3>
                    <p className="text-gray-500 font-body max-w-sm">This business hasn't listed any products in their catalog yet.</p>
                </div>
            )}

            {/* Product Details Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 font-body backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {selectedProduct.image_url && (
                                <div className="w-full h-64 sm:h-80 bg-gray-100 relative shrink-0">
                                    <img src={selectedProduct.image_url} className="w-full h-full object-cover" alt={selectedProduct.product_name} />
                                    <button 
                                        onClick={() => setSelectedProduct(null)}
                                        className="absolute top-4 right-4 bg-white/80 backdrop-blur text-gray-800 p-2 rounded-full hover:bg-white transition-colors"
                                    >
                                        <MdClose size={20} />
                                    </button>
                                </div>
                            )}
                            <div className="p-6 sm:p-8 flex flex-col overflow-y-auto">
                                {!selectedProduct.image_url && (
                                    <button 
                                        onClick={() => setSelectedProduct(null)}
                                        className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors"
                                    >
                                        <MdClose size={24} />
                                    </button>
                                )}
                                
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                    <h2 className="text-2xl sm:text-3xl font-headline font-bold text-[#0F1D29]">{selectedProduct.product_name}</h2>
                                    <span className="text-2xl font-bold shrink-0" style={{ color: themeColor }}>₱{parseFloat(selectedProduct.price).toFixed(2)}</span>
                                </div>

                                {selectedProduct.estimated_days && (
                                    <div className="inline-flex items-center gap-2 bg-[#FFF7E6] text-[#8D4A52] px-3 py-1.5 rounded-lg text-sm font-medium w-max mb-6">
                                        ⏱️ Est. Completion: {selectedProduct.estimated_days} days
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">Description</h3>
                                    {selectedProduct.description ? (
                                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">{selectedProduct.description}</p>
                                    ) : (
                                        <p className="text-gray-400 italic">No description available.</p>
                                    )}
                                </div>

                                <div className="mt-auto flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-gray-100">
                                    <div className="flex items-center bg-gray-100 rounded-xl p-1 w-full sm:w-auto shrink-0">
                                        <button 
                                            onClick={() => setQuantityToAdd(Math.max(1, quantityToAdd - 1))}
                                            className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            <MdRemove />
                                        </button>
                                        <span className="w-16 text-center font-bold text-lg">{quantityToAdd}</span>
                                        <button 
                                            onClick={() => setQuantityToAdd(quantityToAdd + 1)}
                                            className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            <MdAdd />
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleAddToCart}
                                        style={{ backgroundColor: themeColor }}
                                        className="w-full flex-1 text-white py-3 px-6 rounded-xl font-bold shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                    >
                                        <MdShoppingCart size={20} />
                                        Add to Cart • ₱{(parseFloat(selectedProduct.price) * quantityToAdd).toFixed(2)}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Cart Modal */}
            <AnimatePresence>
                {isCartOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-body backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            <div className="flex justify-between items-center mb-6 shrink-0">
                                <h2 className="text-2xl font-headline font-bold text-[#0F1D29] flex items-center gap-2">
                                    <MdShoppingCart /> Your Cart
                                </h2>
                                <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-800 transition-colors">
                                    <MdClose size={24} />
                                </button>
                            </div>

                            {cartItems.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <MdShoppingCart size={32} className="text-gray-300" />
                                    </div>
                                    <p className="text-gray-500 font-medium">Your cart is empty</p>
                                    <p className="text-gray-400 text-sm mt-1">Add some products to request an order.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1 overflow-y-auto mb-6 pr-2 flex flex-col gap-4" style={{ scrollbarWidth: 'thin' }}>
                                        {cartItems.map((item) => (
                                            <div key={item.product_id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt={item.product_name} className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0" />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center shrink-0">
                                                        <MdOutlineLocalOffer className="text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-[#0F1D29] truncate">{item.product_name}</h4>
                                                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                                        <span>₱{parseFloat(item.price).toFixed(2)}</span>
                                                        <span>×</span>
                                                        <span className="font-semibold text-gray-700">{item.quantity}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2 shrink-0">
                                                    <span className="font-bold text-[#0F1D29]">₱{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                                                    <button onClick={() => handleRemoveFromCart(item.product_id)} className="text-xs text-red-500 hover:underline font-medium">Remove</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="pt-4 border-t border-gray-100 shrink-0">
                                        <div className="flex justify-between items-center mb-6">
                                            <span className="font-semibold text-gray-500">Estimated Total</span>
                                            <span className="text-2xl font-bold" style={{ color: themeColor }}>₱{cartTotal.toFixed(2)}</span>
                                        </div>

                                        <form onSubmit={handleRequestOrder} className="flex flex-col gap-4">
                                            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                                                Desired Deadline (Optional)
                                                <input
                                                    type="date"
                                                    value={deadline}
                                                    onChange={e => setDeadline(e.target.value)}
                                                    className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#8D4A52] focus:ring-1 focus:ring-[#8D4A52] transition-all bg-white"
                                                />
                                            </label>
                                            
                                            <button 
                                                type="submit" 
                                                disabled={createOrderMut.isPending} 
                                                className="w-full mt-2 px-4 py-4 bg-[#0F1D29] text-white font-bold rounded-xl hover:bg-[#8D4A52] transition-colors disabled:opacity-70 shadow-lg shadow-gray-200"
                                            >
                                                {createOrderMut.isPending ? "Sending Request..." : "Confirm & Send Request"}
                                            </button>
                                        </form>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
