import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalSearch } from '#hooks/useSearch.js';
import { IoSearch } from 'react-icons/io5';
import { useDebounce } from '#hooks/useDebounce.js';
import Button from '#components/ui/Button.jsx';

export default function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null); // The result to preview in the modal
    
    const debouncedQuery = useDebounce(query, 300);
    const { data: results, isLoading, isError } = useGlobalSearch(debouncedQuery);
    
    const navigate = useNavigate();
    const containerRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleResultClick = (item, type, path) => {
        setIsOpen(false);
        setSelectedResult({ item, type, path });
        setQuery('');
    };

    const handleNavigate = () => {
        if (selectedResult) {
            navigate(selectedResult.path);
            setSelectedResult(null);
        }
    };

    return (
        <div className="relative w-full h-[85%]" ref={containerRef}>
            <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AEAE]" size={24} />
            <input 
                type="text"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    if (!isOpen) setIsOpen(true);
                }}
                onFocus={() => {
                    if (query.length > 0) setIsOpen(true);
                }}
                className="w-full h-full bg-[#F5F3F3] rounded-4xl p-4 pl-11 focus:outline-[#FFECED] font-body font-medium"
                placeholder="Search orders, products, expenses..."
            />

            {/* Dropdown Results */}
            {isOpen && query.length > 0 && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-lg border border-[#f0f0f0] max-h-[60vh] overflow-y-auto z-50">
                    {!debouncedQuery ? (
                        <div className="p-4 text-center text-gray-400 text-sm">Searching...</div>
                    ) : isLoading ? (
                        <div className="p-4 text-center text-gray-400 text-sm">Searching...</div>
                    ) : isError ? (
                        <div className="p-4 text-center text-red-500 text-sm">Failed to fetch results.</div>
                    ) : (
                        <div className="flex flex-col p-2">
                            {/* Orders */}
                            {results?.orders?.length > 0 && (
                                <div className="flex flex-col mb-2">
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">Orders</div>
                                    {results.orders.map(order => (
                                        <button 
                                            key={`order-${order.order_id}`}
                                            onClick={() => handleResultClick(order, 'Order', `/orders/${order.order_id}`)}
                                            className="flex justify-between p-2 rounded-lg hover:bg-[#FFF7E6] transition text-left text-sm"
                                        >
                                            <span className="font-medium text-[#0F1D29]">Order #{order.order_id}</span>
                                            <span className="text-gray-500">{order.status}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Products */}
                            {results?.products?.length > 0 && (
                                <div className="flex flex-col mb-2">
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">Products</div>
                                    {results.products.map(product => (
                                        <button 
                                            key={`product-${product.product_id}`}
                                            onClick={() => handleResultClick(product, 'Product', `/products`)}
                                            className="flex justify-between p-2 rounded-lg hover:bg-[#FFF7E6] transition text-left text-sm"
                                        >
                                            <span className="font-medium text-[#0F1D29]">{product.product_name}</span>
                                            <span className="text-gray-500">{product.product_code}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Expenses */}
                            {results?.expenses?.length > 0 && (
                                <div className="flex flex-col mb-2">
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">Expenses</div>
                                    {results.expenses.map(expense => (
                                        <button 
                                            key={`exp-${expense.expense_id}`}
                                            onClick={() => handleResultClick(expense, 'Expense', `/expenses`)}
                                            className="flex justify-between p-2 rounded-lg hover:bg-[#FFF7E6] transition text-left text-sm"
                                        >
                                            <span className="font-medium text-[#0F1D29]">{expense.title}</span>
                                            <span className="text-gray-500">{expense.category}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Materials */}
                            {results?.materials?.length > 0 && (
                                <div className="flex flex-col mb-2">
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">Materials</div>
                                    {results.materials.map(mat => (
                                        <button 
                                            key={`mat-${mat.material_id}`}
                                            onClick={() => handleResultClick(mat, 'Material', `/expenses`)}
                                            className="flex justify-between p-2 rounded-lg hover:bg-[#FFF7E6] transition text-left text-sm"
                                        >
                                            <span className="font-medium text-[#0F1D29]">{mat.material_name}</span>
                                            <span className="text-gray-500">{mat.material_code}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Empty State */}
                            {results && 
                             results.orders.length === 0 && 
                             results.products.length === 0 && 
                             results.expenses.length === 0 && 
                             results.materials.length === 0 && (
                                <div className="p-4 text-center text-gray-400 text-sm">
                                    No results found for "{debouncedQuery}"
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Selected Result Preview Modal */}
            {selectedResult && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedResult(null)}>
                    <div 
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col border border-[#f0f0f0] animate-fadeIn"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-headline font-semibold text-[#0F1D29] mb-1">
                            {selectedResult.type} Found
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">You selected a search result. Would you like to navigate to its details?</p>
                        
                        <div className="bg-[#FFF7E6]/50 rounded-xl p-4 border border-[#e8d5b5] mb-6 flex flex-col gap-2">
                            {selectedResult.type === 'Order' && (
                                <>
                                    <div className="text-lg font-semibold text-[#8D4A52]">Order #{selectedResult.item.order_id}</div>
                                    <div className="text-sm text-gray-700">Status: {selectedResult.item.status}</div>
                                </>
                            )}
                            {selectedResult.type === 'Product' && (
                                <>
                                    <div className="text-lg font-semibold text-[#8D4A52]">{selectedResult.item.product_name}</div>
                                    <div className="text-sm text-gray-700">Code: {selectedResult.item.product_code}</div>
                                    <div className="text-sm text-gray-700">Price: ₱{selectedResult.item.price}</div>
                                </>
                            )}
                            {selectedResult.type === 'Expense' && (
                                <>
                                    <div className="text-lg font-semibold text-[#8D4A52]">{selectedResult.item.title}</div>
                                    <div className="text-sm text-gray-700">Category: {selectedResult.item.category}</div>
                                    <div className="text-sm text-gray-700">Amount: ₱{selectedResult.item.amount}</div>
                                </>
                            )}
                            {selectedResult.type === 'Material' && (
                                <>
                                    <div className="text-lg font-semibold text-[#8D4A52]">{selectedResult.item.material_name}</div>
                                    <div className="text-sm text-gray-700">Code: {selectedResult.item.material_code}</div>
                                    <div className="text-sm text-gray-700">Stock: {selectedResult.item.quantity}</div>
                                </>
                            )}
                        </div>

                        <div className="flex gap-3 justify-end w-full">
                            <Button variant="secondary" onClick={() => setSelectedResult(null)}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleNavigate}>
                                Go to {selectedResult.type}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
