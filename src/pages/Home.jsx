import React from 'react';
import BottomNav from '../components/shared/BottomNav';
import Greetings from '../components/home/Greetings';
import MiniCard from '../components/home/MiniCard';
import { BsCashCoin } from 'react-icons/bs';
import { GrInProgress } from 'react-icons/gr';
import RecentOrders from '../components/home/RecentOrders';
import PopularDishes from '../components/home/PopularDishes';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getOrders } from '../https';

const Home = () => {
    const { data: orderRes } = useQuery({
        queryKey: ['orders'],
        queryFn: () => getOrders(),
        placeholderData: keepPreviousData
    });

    const orders = orderRes?.data?.data || [];

    const totalEarnings = orders
        .filter((o) => o.paymentStatus === "Paid")
        .reduce((sum, o) => sum + (o.bills?.totalWithTax || 0), 0);

    const inProgressCount = orders.filter((o) => o.orderStatus === "In Progress").length;

    return (
        <section className='bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex gap-3'>
           
            <div className='flex-[3]'>
                <Greetings />
                <div className='flex items-center w-full gap-3 px-8 mt-8'>
                    <MiniCard
                        title="Total Earnings"
                        icon={<BsCashCoin />}
                        number={totalEarnings > 0 ? totalEarnings.toFixed(2) : "0.00"}
                    />
                    <MiniCard
                        title="In Progress"
                        icon={<GrInProgress />}
                        number={inProgressCount}
                    />
                </div>
                <RecentOrders />
            </div>
          
            <div className='flex-[2]'>
                <PopularDishes />
            </div>
            <BottomNav />
        </section>
    );
};

export default Home;
