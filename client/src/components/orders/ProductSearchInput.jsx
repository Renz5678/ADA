// src/components/orders/ProductSearchInput.jsx
import { useState, useRef, useEffect } from 'react';

function highlightMatch(text, query) {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;

    return (
        <>
            {text.slice(0, idx)}
            <mark className="bg-[#FFB2B9] text-[#71333C] rounded px-0.5">
                {text.slice(idx, idx + query.length)}
            </mark>
            {text.slice(idx + query.length)}
        </>
    );
}

export default function ProductSearchInput({ products, value, onChange, placeholder = 'Search by code or name...' }) {
    const [query, setQuery] = useState(value ? value.product_name : '');
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const containerRef = useRef(null);

    const filtered = query.length > 0
        ? products.filter((p) =>
            p.product_code.toLowerCase().includes(query.toLowerCase()) ||
            p.product_name.toLowerCase().includes(query.toLowerCase())
          )
        : [];

    // Close the dropdown on a click anywhere outside this component —
    // no onBlur race condition, since option selection also happens on mousedown (see below)
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Selecting a suggestion fills the search box with that product's name
    // (like clicking a Google suggestion), but the box stays editable —
    // it does not lock into a separate "selected value" display.
    const selectProduct = (product) => {
        onChange(product);
        setQuery(product.product_name);
        setIsOpen(false);
        setHighlightedIndex(0);
    };

    const handleKeyDown = (e) => {
        if (!isOpen || filtered.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            selectProduct(filtered[highlightedIndex]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <input
                type="text"
                value={query}
                onChange={(e) => {
                    onChange(null);
                    setQuery(e.target.value);
                    setIsOpen(true);
                    setHighlightedIndex(0);
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="border rounded-lg px-3 py-2 w-full"
            />

            {isOpen && query.length > 0 && (
                <ul className="absolute z-10 bg-white border rounded-lg mt-1 w-full shadow-lg max-h-48 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <li className="px-3 py-2 text-sm text-gray-400">No matching products</li>
                    ) : (
                        filtered.map((p, index) => (
                            <li
                                key={p.product_id}
                                onMouseDown={() => selectProduct(p)}
                                onMouseEnter={() => setHighlightedIndex(index)}
                                className={`px-3 py-2 cursor-pointer text-sm flex justify-between items-center
                                    ${index === highlightedIndex ? 'bg-[#FFF7E6]' : 'hover:bg-gray-50'}`}
                            >
                                <span>
                                    {highlightMatch(p.product_code, query)} — {highlightMatch(p.product_name, query)}
                                </span>
                                <span className="text-gray-500">₱{p.price}</span>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
}