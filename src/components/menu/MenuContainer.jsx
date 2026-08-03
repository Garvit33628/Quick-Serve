import React, { useState, useMemo } from 'react';
import { getRandomBG } from '../../utils';
import { GrRadialSelected } from "react-icons/gr";
import { useDispatch, useSelector } from 'react-redux';
import { addItems, updateItemQuantity } from '../../redux/slices/cartSlice';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getCategories, getMenuItems } from '../../https';
import { enqueueSnackbar } from 'notistack';

const MenuContainer = () => {
    const dispatch = useDispatch();
    const cartData = useSelector((state) => state.cart);

    const { data: catRes, isLoading: catLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: () => getCategories(),
        placeholderData: keepPreviousData,
    });

    const { data: menuRes, isLoading: menuLoading } = useQuery({
        queryKey: ['menuItems'],
        queryFn: () => getMenuItems(),
        placeholderData: keepPreviousData,
    });

    const categoriesList = catRes?.data?.data || [];
    const menuItemsList = menuRes?.data?.data || [];

    const categoriesData = useMemo(() => {
        return categoriesList.map(cat => {
            const items = menuItemsList.filter(item => {
                const itemCatId = typeof item.category === 'object' ? item.category?._id : item.category;
                return String(itemCatId) === String(cat._id);
            });
            return {
                id: cat._id,
                name: cat.name,
                icon: cat.icon || "🍽️",
                bgColor: cat.bgColor || "#2a2a2a",
                items
            };
        });
    }, [categoriesList, menuItemsList]);

    const [selectedCategory, setSelectedCategory] = useState(null);

    const activeCategory = useMemo(() => {
        if (selectedCategory) {
            const found = categoriesData.find(c => String(c.id) === String(selectedCategory));
            if (found) return found;
        }
        return categoriesData[0] || null;
    }, [categoriesData, selectedCategory]);

    const getItemCountInCart = (itemId) => {
        const item = cartData.find(i => (i.id || i._id) === itemId);
        return item ? item.quantity : 0;
    };

    const handleIncrement = (item) => {
        const itemId = item._id || item.id;
        const newObj = {
            id: itemId,
            _id: itemId,
            name: item.name,
            pricePerQuantity: item.price,
            quantity: 1,
            price: item.price
        };
        dispatch(addItems(newObj));
    };

    const handleDecrement = (item) => {
        const itemId = item._id || item.id;
        dispatch(updateItemQuantity({ id: itemId, delta: -1 }));
    };

    if (catLoading || menuLoading) {
        return <p className="text-center text-gray-400 py-10">Loading menu data from server...</p>;
    }

    if (categoriesData.length === 0) {
        return (
            <div className="text-center py-16 px-6">
                <p className="text-gray-400 text-lg">No categories found in backend database.</p>
                <p className="text-gray-500 text-sm mt-2">Go to Admin Dashboard to add categories and menu items!</p>
            </div>
        );
    }

    return (
        <>
            <div className='grid grid-cols-4 gap-4 px-10 py-4 w-[100%] max-h-[160px] overflow-y-auto scrollbar-none'>
                {categoriesData.map((menu) => {
                    const isSelected = activeCategory?.id === menu.id;
                    return (
                        <div
                            key={menu.id}
                            className={`flex flex-col items-center justify-between p-4 rounded-lg h-[100px] cursor-pointer transition border ${
                                isSelected ? "border-white shadow-lg" : "border-transparent opacity-90"
                            }`}
                            style={{ backgroundColor: menu.bgColor || getRandomBG(menu.id) }}
                            onClick={() => setSelectedCategory(menu.id)}
                        >
                            <div className='flex items-center justify-between w-full'>
                                <h1 className='text-[#f5f5f5] text-lg font-semibold truncate'>
                                    {menu.icon} {menu.name}
                                </h1>
                                {isSelected && (
                                    <GrRadialSelected className="text-white shrink-0 ml-2" size={20} />
                                )}
                            </div>
                            <p className='text-[#ababab] text-sm font-semibold self-start'>
                                {menu.items ? menu.items.length : 0} Items
                            </p>
                        </div>
                    );
                })}
            </div>

            <hr className='border-[#2a2a2a] border-t-2 mt-2' />

            <div className='grid grid-cols-4 gap-4 px-10 py-4 w-[100%] max-h-[calc(100vh-20rem)] overflow-y-auto scrollbar-none'>
                {activeCategory?.items && activeCategory.items.length > 0 ? (
                    activeCategory.items.map((item) => {
                        const itemId = item._id || item.id;
                        const count = getItemCountInCart(itemId);

                        return (
                            <div
                                key={itemId}
                                className='flex flex-col items-start justify-between p-4 rounded-lg h-[150px] hover:bg-[#2a2a2a] bg-[#1a1a1a] transition border border-[#262626]'
                            >
                                <div className='flex items-start justify-between w-full'>
                                    <h1 className='text-[#f5f5f5] text-lg font-semibold truncate pr-2'>
                                        {item.name}
                                    </h1>
                                    {count > 0 && (
                                        <span className="bg-[#f6b100] text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                                            {count} in cart
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between w-full">
                                    <p className='text-[#f5f5f5] text-xl font-bold'> रु {item.price}</p>
                                    <div className='flex items-center justify-between bg-[#1f1f1f] px-3 py-2 rounded-lg gap-4 border border-[#333333]'>
                                        <button
                                            onClick={() => handleDecrement(item)}
                                            disabled={count === 0}
                                            className='text-yellow-500 text-2xl font-bold hover:text-yellow-400 disabled:opacity-30 disabled:hover:text-yellow-500'
                                        >
                                            &minus;
                                        </button>
                                        <span className='text-white font-semibold min-w-[20px] text-center'>
                                            {count}
                                        </span>
                                        <button
                                            onClick={() => handleIncrement(item)}
                                            className='text-yellow-500 text-2xl font-bold hover:text-yellow-400'
                                        >
                                            &#43;
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="col-span-4 text-center text-gray-500 py-10">No items available in this category.</p>
                )}
            </div>
        </>
    );
};

export default MenuContainer;
