import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useProducts } from '#hooks/useProducts.js';
import { createProduct, updateProduct, deleteProduct } from '#api/product.js';
import ProductsTable from '#components/products/ProductsTable.jsx';
import ProductModal from '#components/products/ProductModal.jsx';
import Button from '#components/ui/Button.jsx';
import Skeleton from '#components/ui/Skeleton.jsx';

export default function ProductsPage() {
    const queryClient = useQueryClient();
    const { data: products, isLoading, isError, error, isFetching } = useProducts();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null); // null = creating, otherwise editing this product

    const invalidateProducts = () => queryClient.invalidateQueries({ queryKey: ['products'] });

    const createMutation = useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            invalidateProducts();
            setIsModalOpen(false);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, updates }) => updateProduct(id, updates),
        onSuccess: () => {
            invalidateProducts();
            setIsModalOpen(false);
            setEditingProduct(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: invalidateProducts
    });

    const handleOpenCreate = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleSave = (formData) => {
        if (editingProduct) {
            updateMutation.mutate({ id: editingProduct.product_id, updates: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleDelete = (product) => {
        const confirmed = window.confirm(`Delete "${product.product_name}" (${product.product_code})? This can't be undone.`);
        if (confirmed) {
            deleteMutation.mutate(product.product_id);
        }
    };

    if (isLoading) return (
        <div className="w-full">
            <div className="w-full flex items-center justify-between mb-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-10 w-28" />
            </div>
            <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
    );
    if (isError) return <div>Error: {error.message}</div>;

    return (
        <div className="w-full">
            <div className="w-full flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold">Products</h1>
                <Button variant="primary" onClick={handleOpenCreate}>+ New Product</Button>
            </div>

            <ProductsTable
                products={products}
                isFetching={isFetching}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
            />

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                isSaving={createMutation.isPending || updateMutation.isPending}
                initialProduct={editingProduct}
            />
        </div>
    );
}