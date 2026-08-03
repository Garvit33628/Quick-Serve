import React, { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getMenuItems, getOrders } from '../../https';
import { getRandomBG, getAvatarName } from '../../utils';

const PopularDishes = () => {
    const { data: orderRes } = useQuery({
        queryKey: ['orders'],
        queryFn: () => getOrders(),
        placeholderData: keepPreviousData
    });

    const { data: menuRes } = useQuery({
        queryKey: ['menuItems'],
        queryFn: () => getMenuItems(),
        placeholderData: keepPreviousData
    });

    const orders = orderRes?.data?.data || [];
    const menuItems = menuRes?.data?.data || [];

    const popularDishesList = useMemo(() => {
        const dishCounts = {};

        orders.forEach((order) => {
            if (Array.isArray(order.items)) {
                order.items.forEach((item) => {
                    const itemName = item.name;
                    const qty = Number(item.quantity) || 1;
                    if (itemName) {
                        dishCounts[itemName] = (dishCounts[itemName] || 0) + qty;
                    }
                });
            }
        });

        
        if (menuItems.length > 0) {
            const list = menuItems.map((item) => ({
                id: item._id,
                name: item.name,
                price: item.price,
                categoryIcon: typeof item.category === 'object' ? item.category?.icon : '🍲',
                numberOfOrders: dishCounts[item.name] || 0
            }));
            
            return list.sort((a, b) => b.numberOfOrders - a.numberOfOrders);
        }

    
        return Object.keys(dishCounts).map((name, index) => ({
            id: index + 1,
            name,
            numberOfOrders: dishCounts[name],
            categoryIcon: '🍲'
        })).sort((a, b) => b.numberOfOrders - a.numberOfOrders);
    }, [orders, menuItems]);

    return (
        <div className='mt-6 pr-6'>
            <div className="bg-[#1a1a1a] w-full rounded-lg p-4">
                <div className="flex justify-between items-center px-2 py-2">
                    <h1 className='text-[#f5f5f5] text-lg font-semibold tracking-wide'> Popular Dishes </h1>
                    <span className='text-[#ababab] text-xs font-semibold'> Realtime Data </span>
                </div>

                <div className='overflow-y-auto h-[640px] scrollbar-none space-y-3 mt-2'>
                    {popularDishesList.length > 0 ? (
                        popularDishesList.map((dish, index) => {
                            const rank = index + 1;
                            return (
                                <div
                                    key={dish.id || index}
                                    className='flex items-center justify-between bg-[#1f1f1f] rounded-[15px] px-6 py-4 mx-2 hover:bg-[#262626] transition'
                                >
                                    <div className='flex items-center gap-4'>
                                        <div
                                            className='w-[45px] h-[45px] rounded-full flex items-center justify-center text-xl font-bold text-white shadow'
                                            style={{ backgroundColor: getRandomBG(dish.id || index) }}
                                        >
                                            {dish.categoryIcon || getAvatarName(dish.name)}
                                        </div>
                                        <h1 className='text-[#f5f5f5] font-bold text-lg min-w-[30px]'>
                                            {rank < 10 ? `0${rank}` : rank}
                                        </h1>
                                        <div>
                                            <h1 className='text-[#f5f5f5] font-semibold tracking-wide text-sm md:text-base'>
                                                {dish.name}
                                            </h1>
                                            {dish.price && (
                                                <p className='text-xs text-[#ababab]'>
                                                    NPR {Number(dish.price).toFixed(2)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className='text-right'>
                                        <p className='text-[#f6b100] font-bold text-sm'>
                                            {dish.numberOfOrders} <span className='text-[#ababab] font-normal text-xs'>orders</span>
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className='text-center text-gray-500 py-10'>No popular dishes found yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PopularDishes;
