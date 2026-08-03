import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMenuItems, getCategories, deleteMenuItem } from '../../https';
import { enqueueSnackbar } from 'notistack';
import { FaEdit, FaTrash, FaPlus, FaUtensils, FaSearch, FaFilter } from 'react-icons/fa';

const DishesManagement = ({ onOpenAddDish, onOpenEditDish }) => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCat, setSelectedCat] = useState("all");
    const [deletingId, setDeletingId] = useState(null);

    const { data: menuRes, isLoading, isError } = useQuery({
        queryKey: ['menuItems'],
        queryFn: getMenuItems,
    });

    const { data: catRes } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteMenuItem(id),
        onSuccess: () => {
            enqueueSnackbar("Dish deleted successfully!", { variant: "success" });
            queryClient.invalidateQueries(['menuItems']);
            setDeletingId(null);
        },
        onError: (err) => {
            enqueueSnackbar(err?.response?.data?.message || "Failed to delete dish!", { variant: "error" });
            setDeletingId(null);
        }
    });

    const handleDelete = (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}" from menu?`)) {
            setDeletingId(id);
            deleteMutation.mutate(id);
        }
    };

    const dishes = menuRes?.data?.data || [];
    const categories = catRes?.data?.data || [];

    const filteredDishes = dishes.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const catId = typeof item.category === 'object' ? item.category?._id : item.category;
        const matchesCategory = selectedCat === "all" || catId === selectedCat;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="container mx-auto bg-[#262626] p-6 rounded-2xl mt-4 shadow-xl border border-[#333]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#333]">
                <div>
                    <h2 className="text-[#f5f5f5] text-xl font-bold tracking-wide flex items-center gap-2">
                        <FaUtensils className="text-[#f6b100]" /> Menu Dishes Management
                    </h2>
                    <p className="text-xs text-[#ababab] mt-1">
                        View, update prices, or remove menu items
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={onOpenAddDish}
                        className="bg-[#f6b100] hover:bg-yellow-500 text-gray-900 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition shadow-md whitespace-nowrap"
                    >
                        <FaPlus size={12} /> Add Dish
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                <div className="flex items-center gap-3 bg-[#1f1f1f] px-4 py-2.5 rounded-xl border border-[#333] w-full sm:w-80">
                    <FaSearch className="text-[#ababab]" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search dish name..."
                        className="bg-transparent text-white text-sm focus:outline-none w-full"
                    />
                </div>

                <div className="flex items-center gap-2 bg-[#1f1f1f] px-4 py-2 rounded-xl border border-[#333] w-full sm:w-auto">
                    <FaFilter className="text-[#f6b100]" size={12} />
                    <select
                        value={selectedCat}
                        onChange={(e) => setSelectedCat(e.target.value)}
                        className="bg-transparent text-white text-sm focus:outline-none cursor-pointer py-1"
                    >
                        <option value="all" className="bg-[#1f1f1f]">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id} className="bg-[#1f1f1f]">{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-[#f5f5f5] text-sm">
                    <thead className="bg-[#1f1f1f] text-[#ababab] uppercase text-xs">
                        <tr>
                            <th className="p-4 rounded-l-xl">Dish Name</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Price</th>
                            <th className="p-4 text-center rounded-r-xl">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-gray-400">Loading dishes...</td>
                            </tr>
                        ) : isError ? (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-red-400">Failed to load menu items.</td>
                            </tr>
                        ) : filteredDishes.length > 0 ? (
                            filteredDishes.map((item) => {
                                const catObj = typeof item.category === 'object' ? item.category : null;
                                const catName = catObj?.name || "Uncategorized";
                                const catIcon = catObj?.icon || "🍽️";

                                return (
                                    <tr key={item._id} className="border-b border-[#333] hover:bg-[#2d2d2d] transition">
                                        <td className="p-4 font-bold text-white flex items-center gap-2">
                                            <span>{item.name}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-[#1f1f1f] px-3 py-1 rounded-full text-xs text-[#ababab] border border-[#333]">
                                                {catIcon} {catName}
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-[#02ca3a]">
                                            NPR {Number(item.price).toFixed(2)}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => onOpenEditDish(item)}
                                                    className="bg-[#025cca]/20 hover:bg-[#025cca] text-[#025cca] hover:text-white p-2.5 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold"
                                                    title="Edit Dish"
                                                >
                                                    <FaEdit size={14} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item._id, item.name)}
                                                    disabled={deletingId === item._id}
                                                    className="bg-red-500/20 hover:bg-red-600 text-red-400 hover:text-white p-2.5 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50"
                                                    title="Delete Dish"
                                                >
                                                    <FaTrash size={13} /> {deletingId === item._id ? "Deleting..." : "Delete"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-gray-500">No dishes found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DishesManagement;
