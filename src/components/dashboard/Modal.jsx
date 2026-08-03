import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoIosCloseCircle } from "react-icons/io";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addTable, addCategory, updateCategory, addMenuItem, updateMenuItem, getCategories } from '../../https';
import { enqueueSnackbar } from 'notistack';

const Modal = ({ setIsTableModalOpen, targetModal = 'table', editItem = null }) => {
    const queryClient = useQueryClient();

    
    const [tableData, setTableData] = useState({
        tableNo: "",
        seats: ""
    });

   
    const [categoryData, setCategoryData] = useState({
        name: editItem?.name || "",
        icon: editItem?.icon || "🍽️",
        bgColor: editItem?.bgColor || "#2a2a2a"
    });

    const [dishData, setDishData] = useState({
        name: editItem?.name || "",
        price: editItem?.price || "",
        category: editItem?.category ? (typeof editItem.category === 'object' ? editItem.category._id : editItem.category) : ""
    });

    useEffect(() => {
        if (editItem) {
            if (targetModal === 'editCategory') {
                setCategoryData({
                    name: editItem.name || "",
                    icon: editItem.icon || "🍽️",
                    bgColor: editItem.bgColor || "#2a2a2a"
                });
            } else if (targetModal === 'editDishes') {
                setDishData({
                    name: editItem.name || "",
                    price: editItem.price || "",
                    category: typeof editItem.category === 'object' ? editItem.category?._id : editItem.category || ""
                });
            }
        }
    }, [editItem, targetModal]);

    const { data: catRes } = useQuery({
        queryKey: ['categories'],
        queryFn: () => getCategories(),
        enabled: targetModal === 'dishes' || targetModal === 'editDishes'
    });
    const categories = catRes?.data?.data || [];

    const handleCloseModal = () => {
        setIsTableModalOpen(false);
    };

    
    const tableMutation = useMutation({
        mutationFn: (reqData) => addTable(reqData),
        onSuccess: (res) => {
            queryClient.invalidateQueries(["tables"]);
            enqueueSnackbar(res.data.message || "Table Added!", { variant: "success" });
            handleCloseModal();
        },
        onError: (error) => {
            const message = error?.response?.data?.message || "Failed to add table!";
            enqueueSnackbar(message, { variant: "error" });
        }
    });

    const categoryMutation = useMutation({
        mutationFn: (reqData) => addCategory(reqData),
        onSuccess: (res) => {
            queryClient.invalidateQueries(["categories"]);
            enqueueSnackbar(res.data.message || "Category Added!", { variant: "success" });
            handleCloseModal();
        },
        onError: (error) => {
            const message = error?.response?.data?.message || "Failed to add category!";
            enqueueSnackbar(message, { variant: "error" });
        }
    });

    const updateCategoryMutation = useMutation({
        mutationFn: (reqData) => updateCategory(reqData),
        onSuccess: (res) => {
            queryClient.invalidateQueries(["categories"]);
            queryClient.invalidateQueries(["menuItems"]);
            enqueueSnackbar(res.data.message || "Category Updated!", { variant: "success" });
            handleCloseModal();
        },
        onError: (error) => {
            const message = error?.response?.data?.message || "Failed to update category!";
            enqueueSnackbar(message, { variant: "error" });
        }
    });

    
    const dishMutation = useMutation({
        mutationFn: (reqData) => addMenuItem(reqData),
        onSuccess: (res) => {
            queryClient.invalidateQueries(["menuItems"]);
            enqueueSnackbar(res.data.message || "Dish Added!", { variant: "success" });
            handleCloseModal();
        },
        onError: (error) => {
            const message = error?.response?.data?.message || "Failed to add dish!";
            enqueueSnackbar(message, { variant: "error" });
        }
    });

    const updateDishMutation = useMutation({
        mutationFn: (reqData) => updateMenuItem(reqData),
        onSuccess: (res) => {
            queryClient.invalidateQueries(["menuItems"]);
            enqueueSnackbar(res.data.message || "Dish Updated!", { variant: "success" });
            handleCloseModal();
        },
        onError: (error) => {
            const message = error?.response?.data?.message || "Failed to update dish!";
            enqueueSnackbar(message, { variant: "error" });
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (targetModal === 'table') {
            tableMutation.mutate({
                tableNo: Number(tableData.tableNo),
                seats: Number(tableData.seats)
            });
        } else if (targetModal === 'category') {
            categoryMutation.mutate(categoryData);
        } else if (targetModal === 'editCategory') {
            updateCategoryMutation.mutate({
                id: editItem._id,
                ...categoryData
            });
        } else if (targetModal === 'dishes') {
            dishMutation.mutate({
                name: dishData.name,
                price: Number(dishData.price),
                category: dishData.category
            });
        } else if (targetModal === 'editDishes') {
            updateDishMutation.mutate({
                id: editItem._id,
                name: dishData.name,
                price: Number(dishData.price),
                category: dishData.category
            });
        }
    };

    return (
        <div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50'>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className='bg-[#262626] p-6 rounded-lg shadow-xl w-96 text-[#f5f5f5]'
            >
                
                <div className='flex justify-between items-center mb-4 border-b border-gray-700 pb-3'>
                    <h2 className='text-xl font-semibold capitalize'>
                        {targetModal === 'table'
                            ? 'Add Table'
                            : targetModal === 'category'
                            ? 'Add Category'
                            : targetModal === 'editCategory'
                            ? 'Edit Category'
                            : targetModal === 'editDishes'
                            ? 'Edit Dish'
                            : 'Add Dish'}
                    </h2>
                    <button onClick={handleCloseModal} className='text-gray-400 hover:text-red-500 transition'>
                        <IoIosCloseCircle size={24} />
                    </button>
                </div>

                
                {targetModal === 'table' && (
                    <form onSubmit={handleSubmit} className='space-y-4 mt-4'>
                        <div>
                            <label className='block text-[#ababab] mb-1 text-sm font-medium'>
                                Table Number
                            </label>
                            <input
                                type='number'
                                name='tableNo'
                                value={tableData.tableNo}
                                onChange={(e) => setTableData({ ...tableData, tableNo: e.target.value })}
                                placeholder='Enter Table Number'
                                className='w-full rounded-lg p-3 bg-[#1f1f1f] text-white focus:outline-none focus:ring-1 focus:ring-yellow-400'
                                required
                            />
                        </div>

                        <div>
                            <label className='block text-[#ababab] mb-1 text-sm font-medium'>
                                Number of Seats
                            </label>
                            <input
                                type='number'
                                name='seats'
                                value={tableData.seats}
                                onChange={(e) => setTableData({ ...tableData, seats: e.target.value })}
                                placeholder='Enter Number of Seats'
                                className='w-full rounded-lg p-3 bg-[#1f1f1f] text-white focus:outline-none focus:ring-1 focus:ring-yellow-400'
                                required
                            />
                        </div>

                        <button
                            type='submit'
                            disabled={tableMutation.isPending}
                            className='w-full mt-6 py-3 rounded-lg text-lg bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-500 transition disabled:opacity-50'
                        >
                            {tableMutation.isPending ? "Adding..." : "Add Table"}
                        </button>
                    </form>
                )}

                    {(targetModal === 'category' || targetModal === 'editCategory') && (
                    <form onSubmit={handleSubmit} className='space-y-4 mt-4'>
                        <div>
                            <label className='block text-[#ababab] mb-1 text-sm font-medium'>
                                Category Name
                            </label>
                            <input
                                type='text'
                                value={categoryData.name}
                                onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                                placeholder='e.g. Starters, Desserts'
                                className='w-full rounded-lg p-3 bg-[#1f1f1f] text-white focus:outline-none focus:ring-1 focus:ring-yellow-400'
                                required
                            />
                        </div>

                        <div>
                            <label className='block text-[#ababab] mb-1 text-sm font-medium'>
                                Icon (Emoji)
                            </label>
                            <input
                                type='text'
                                value={categoryData.icon}
                                onChange={(e) => setCategoryData({ ...categoryData, icon: e.target.value })}
                                placeholder='e.g. 🍲'
                                className='w-full rounded-lg p-3 bg-[#1f1f1f] text-white focus:outline-none focus:ring-1 focus:ring-yellow-400'
                            />
                        </div>

                        <button
                            type='submit'
                            disabled={categoryMutation.isPending || updateCategoryMutation.isPending}
                            className='w-full mt-6 py-3 rounded-lg text-lg bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-500 transition disabled:opacity-50'
                        >
                            {categoryMutation.isPending || updateCategoryMutation.isPending
                                ? "Saving..."
                                : targetModal === 'editCategory'
                                ? "Update Category"
                                : "Add Category"}
                        </button>
                    </form>
                )}

                {(targetModal === 'dishes' || targetModal === 'editDishes') && (
                    <form onSubmit={handleSubmit} className='space-y-4 mt-4'>
                        <div>
                            <label className='block text-[#ababab] mb-1 text-sm font-medium'>
                                Dish Name
                            </label>
                            <input
                                type='text'
                                value={dishData.name}
                                onChange={(e) => setDishData({ ...dishData, name: e.target.value })}
                                placeholder='e.g. Butter Chicken'
                                className='w-full rounded-lg p-3 bg-[#1f1f1f] text-white focus:outline-none focus:ring-1 focus:ring-yellow-400'
                                required
                            />
                        </div>

                        <div>
                            <label className='block text-[#ababab] mb-1 text-sm font-medium'>
                                Price (NPR)
                            </label>
                            <input
                                type='number'
                                value={dishData.price}
                                onChange={(e) => setDishData({ ...dishData, price: e.target.value })}
                                placeholder='e.g. 350'
                                className='w-full rounded-lg p-3 bg-[#1f1f1f] text-white focus:outline-none focus:ring-1 focus:ring-yellow-400'
                                required
                            />
                        </div>

                        <div>
                            <label className='block text-[#ababab] mb-1 text-sm font-medium'>
                                Category
                            </label>
                            <select
                                value={dishData.category}
                                onChange={(e) => setDishData({ ...dishData, category: e.target.value })}
                                className='w-full rounded-lg p-3 bg-[#1f1f1f] text-white focus:outline-none focus:ring-1 focus:ring-yellow-400'
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type='submit'
                            disabled={dishMutation.isPending || updateDishMutation.isPending}
                            className='w-full mt-6 py-3 rounded-lg text-lg bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-500 transition disabled:opacity-50'
                        >
                            {dishMutation.isPending || updateDishMutation.isPending
                                ? "Saving..."
                                : targetModal === 'editDishes'
                                ? "Update Dish"
                                : "Add Dish"}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default Modal;
