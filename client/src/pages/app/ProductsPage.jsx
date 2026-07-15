import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useProducts } from '#hooks/useProducts.js';
import { createProduct, updateProduct, deleteProduct } from '#api/product.js';
import ProductsTable from '#components/products/ProductsTable.jsx';
import ProductModal from '#components/products/ProductModal.jsx';
import ProductMaterialsModal from '#components/products/ProductMaterialsModal.jsx';
import Button from '#components/ui/Button.jsx';
import Skeleton from '#components/ui/Skeleton.jsx';
import ConfirmModal from '#components/ui/ConfirmModal.jsx';

export default function ProductsPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const limit = 10;
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    const openConfirm = (title, message, onConfirm) => setConfirmState({ isOpen: true, title, message, onConfirm });
    const closeConfirm = () => setConfirmState(s => ({ ...s, isOpen: false }));

    const { data, isLoading, isError, error, isFetching } = useProducts(page, limit, searchQuery);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null); // null = creating, otherwise editing this product

    const [isMaterialsModalOpen, setIsMaterialsModalOpen] = useState(false);
    const [activeProductForMaterials, setActiveProductForMaterials] = useState(null);

    const invalidateProducts = () => queryClient.invalidateQueries({ queryKey: ['products'] });

    const createMutation = useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            invalidateProducts();
            setIsModalOpen(false);
            toast.success('Product created successfully!');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to create product.')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, updates }) => updateProduct(id, updates),
        onSuccess: () => {
            invalidateProducts();
            setIsModalOpen(false);
            setEditingProduct(null);
            toast.success('Product updated successfully!');
        },
        onError: (err) => {
            console.error('[ProductsPage] updateMutation onError:', err);
            toast.error(err.response?.data?.message || 'Failed to update product.');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            invalidateProducts();
            closeConfirm();
            toast.success('Product deleted.');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete product.')
    });

    const handleOpenCreate = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleOpenMaterials = (product) => {
        setActiveProductForMaterials(product);
        setIsMaterialsModalOpen(true);
    };

    const handleSave = (formData) => {
        try {
            if (editingProduct) {
                updateMutation.mutate({ id: editingProduct.product_id, updates: formData });
            } else {
                createMutation.mutate(formData);
            }
        } catch (error) {
            console.error('[ProductsPage] handleSave error:', error);
        }
    };

    const handleDelete = (product) => {
        openConfirm(
            `Delete "${product.product_name}"?`,
            `This will permanently delete this product (${product.product_code}). This can't be undone.`,
            () => deleteMutation.mutate(product.product_id)
        );
    };

    if (isLoading) return (
        <div className="flex flex-col gap-6 animate-fadeIn w-full flex-1 min-h-0">
            <div className="w-full flex items-center justify-between mb-4 shrink-0">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-10 w-28" />
            </div>
            <Skeleton className="flex-1 min-h-0 w-full rounded-2xl" />
        </div>
    );
    if (isError) return <div>Error: {error.message}</div>;

    return (
        <div className="flex flex-col gap-6 animate-fadeIn w-full flex-1 min-h-0">
            <div className="w-full flex items-center justify-between shrink-0">
                <h1 className="text-xl sm:text-2xl font-semibold font-headline text-[#0F1D29]">Products</h1>
                <Button variant="primary" onClick={handleOpenCreate}>+ New Product</Button>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0] flex flex-col gap-4 flex-1 min-h-0">
                <div className="flex w-full sm:w-1/3">
                    <input
                        type="text"
                        placeholder="Search by code or name..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                        className="border border-[#c1c1c1] rounded-lg px-3 py-2 w-full text-sm font-body"
                    />
                </div>

                <ProductsTable
                    products={data?.products ?? []}
                    isFetching={isFetching}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                    onManageMaterials={handleOpenMaterials}
                />

                {data && data.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-auto pt-4 shrink-0 border-t border-[#f0f0f0]">
                        <Button
                            variant="secondary"
                            disabled={page === 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-gray-600 font-body">
                            Page {data.currentPage} of {data.totalPages}
                        </span>
                        <Button
                            variant="secondary"
                            disabled={page === data.totalPages}
                            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                isSaving={createMutation.isPending || updateMutation.isPending}
                initialProduct={editingProduct}
            />

            <ProductMaterialsModal
                isOpen={isMaterialsModalOpen}
                onClose={() => {
                    setIsMaterialsModalOpen(false);
                    setActiveProductForMaterials(null);
                }}
                product={activeProductForMaterials}
            />
            <ConfirmModal isOpen={confirmState.isOpen} onClose={closeConfirm} onConfirm={confirmState.onConfirm} title={confirmState.title} message={confirmState.message} />
        </div>
    );
}