import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, deleteCategory } from '../../https';
import { enqueueSnackbar } from 'notistack';
import { FaEdit, FaTrash, FaPlus, FaFolder } from 'react-icons/fa';

const CategoryManagement = ({ onOpenAddCategory, onOpenEditCategory }) => {
    const queryClient = useQueryClient();
    const [deletingId, setDeletingId] = useState(null);

    const { data: resData, isLoading, isError } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteCategory(id),
        onSuccess: () => {
            enqueueSnackbar("Category deleted successfully!", { variant: "success" });
            queryClient.invalidateQueries(['categories']);
            queryClient.invalidateQueries(['menuItems']);
            setDeletingId(null);
        },
        onError: (err) => {
            enqueueSnackbar(err?.response?.data?.message || "Failed to delete category!", { variant: "error" });
            setDeletingId(null);
        }
    });

    const handleDelete = (id, name) => {
        if (window.confirm(`Are you sure you want to delete the category "${name}"?`)) {
            setDeletingId(id);
            deleteMutation.mutate(id);
        }
    };

    const categories = resData?.data?.data || [];

    return (
        <div className="container mx-auto bg-[#262626] p-6 rounded-2xl mt-4 shadow-xl border border-[#333]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#333]">
                <div>
                    <h2 className="text-[#f5f5f5] text-xl font-bold tracking-wide flex items-center gap-2">
                        <FaFolder className="text-[#f6b100]" /> Category Management
                    </h2>
                    <p className="text-xs text-[#ababab] mt-1">
                        View, update, or remove food & beverage categories
                    </p>
                </div>

                <button
                    onClick={onOpenAddCategory}
                    className="bg-[#f6b100] hover:bg-yellow-500 text-gray-900 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition shadow-md"
                >
                    <FaPlus size={12} /> Add Category
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-[#f5f5f5] text-sm">
                    <thead className="bg-[#1f1f1f] text-[#ababab] uppercase text-xs">
                        <tr>
                            <th className="p-4 rounded-l-xl">Icon</th>
                            <th className="p-4">Category Name</th>
                            <th className="p-4">Category ID</th>
                            <th className="p-4 text-center rounded-r-xl">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-gray-400">Loading categories...</td>
                            </tr>
                        ) : isError ? (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-red-400">Failed to load categories.</td>
                            </tr>
                        ) : categories.length > 0 ? (
                            categories.map((cat) => (
                                <tr key={cat._id} className="border-b border-[#333] hover:bg-[#2d2d2d] transition">
                                    <td className="p-4 text-2xl">
                                        <span className="p-2 rounded-xl bg-[#1f1f1f] inline-block">{cat.icon || '🍽️'}</span>
                                    </td>
                                    <td className="p-4 font-bold text-[#f5f5f5]">{cat.name}</td>
                                    <td className="p-4 font-mono text-xs text-[#ababab]">{cat._id}</td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => onOpenEditCategory(cat)}
                                                className="bg-[#025cca]/20 hover:bg-[#025cca] text-[#025cca] hover:text-white p-2.5 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold"
                                                title="Edit Category"
                                            >
                                                <FaEdit size={14} /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat._id, cat.name)}
                                                disabled={deletingId === cat._id}
                                                className="bg-red-500/20 hover:bg-red-600 text-red-400 hover:text-white p-2.5 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50"
                                                title="Delete Category"
                                            >
                                                <FaTrash size={13} /> {deletingId === cat._id ? "Deleting..." : "Delete"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-gray-500">No categories found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoryManagement;
