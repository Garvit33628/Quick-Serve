import React, { useState } from 'react';
import BottomNav from '../components/shared/BottomNav';
import OrderCard from '../components/orders/OrderCard';
import BackButton from '../components/shared/BackButton';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getOrders } from '../https';
import { enqueueSnackbar } from 'notistack';

const Orders = () => {
    const [status, setStatus] = useState("all");

    const { data: resData, isError, isLoading } = useQuery({
        queryKey: ["orders"],
        queryFn: async () => {
            return await getOrders();
        },
        placeholderData: keepPreviousData
    });

    if (isError) {
        enqueueSnackbar("Failed to fetch orders!", { variant: "error" });
    }

    const allOrders = resData?.data?.data || [];
    const filteredOrders = allOrders.filter((order) => {
        if (status === "progress") return order.orderStatus === "In Progress";
        if (status === "ready") return order.orderStatus === "Ready";
        if (status === "completed") return order.orderStatus === "Completed";
        return true;
    });

    return (
        <section className='bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden '>
            <div className='flex items-center justify-between px-10 py-4'>
                <div className='flex items-center gap-4'>
                    <BackButton />
                    <h1 className='text-[#f5f5f5] text-2xl font-bold tracking-wider'>
                        Orders
                    </h1>
                </div>
                <div className='flex items-center justify-around gap-4'>
                    <button
                        onClick={() => setStatus("all")}
                        className={`text-[#ababab] text-lg ${status === "all" ? "bg-[#383838] text-white" : ""} rounded-lg px-4 py-2 font-semibold transition`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setStatus("progress")}
                        className={`text-[#ababab] text-lg ${status === "progress" ? "bg-[#383838] text-white" : ""} rounded-lg px-4 py-2 font-semibold transition`}
                    >
                        In Progress
                    </button>
                    <button
                        onClick={() => setStatus("ready")}
                        className={`text-[#ababab] text-lg ${status === "ready" ? "bg-[#383838] text-white" : ""} rounded-lg px-4 py-2 font-semibold transition`}
                    >
                        Ready
                    </button>
                    <button
                        onClick={() => setStatus("completed")}
                        className={`text-[#ababab] text-lg ${status === "completed" ? "bg-[#383838] text-white" : ""} rounded-lg px-4 py-2 font-semibold transition`}
                    >
                        Completed
                    </button>
                </div>
            </div>

            <div className='flex flex-wrap gap-6 px-10 md:px-20 py-4 overflow-y-auto h-[calc(100vh-10rem)] pb-24 justify-center'>
                {isLoading ? (
                    <p className='text-gray-400 py-10'>Loading orders...</p>
                ) : filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <OrderCard key={order._id} order={order} />
                    ))
                ) : (
                    <p className='text-gray-500 py-10'>No orders available</p>
                )}
            </div>

            <BottomNav />
        </section>
    );
};

export default Orders;
