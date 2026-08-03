import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import OrderList from './OrderList';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getOrders } from '../../https';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

const RecentOrders = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    const { data: resData, isError, isLoading } = useQuery({
        queryKey: ["orders"],
        queryFn: async () => {
            return await getOrders();
        },
        placeholderData: keepPreviousData
    });

    if (isError) {
        enqueueSnackbar("Failed to fetch recent orders!", { variant: "error" });
    }

    const orders = resData?.data?.data || [];
    const filteredOrders = orders.filter((order) => {
        const customerName = order.customerDetails?.name || "";
        return customerName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className='px-8 mt-6'>
            <div className='bg-[#1a1a1a] w-full h-[450px] rounded-lg p-4'>
                <div className='flex justify-between items-center px-2 py-2'>
                    <h1 className='text-[#f5f5f5] tracking-wide text-lg font-semibold'> Recent Orders </h1>
                    <button onClick={() => navigate('/orders')} className='text-[#025cca] hover:underline text-sm font-semibold'> View All </button>
                </div>

                <div className="flex items-center gap-4 bg-[#1f1f1f] p-2 rounded-[15px] px-6 py-3 my-2">
                    <FaSearch className='text-[#f5f5f5]' />
                    <input
                        type='text'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder='Search customer name...'
                        className='bg-[#1f1f1f] outline-none text-[#f5f5f5] w-full'
                    />
                </div>

                <div className="mt-4 px-2 overflow-y-auto space-y-2 h-[280px] scrollbar-none">
                    {isLoading ? (
                        <p className='text-gray-400 py-6 text-center'>Loading orders...</p>
                    ) : filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <OrderList key={order._id} order={order} />
                        ))
                    ) : (
                        <p className='text-gray-500 py-6 text-center'> No Orders Available </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecentOrders;
