import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCategories, getMenuItems, getOrders, getTables } from '../../https';
import { getLocalDateString } from '../../utils';
import SalesChart from './SalesChart';
import DailyRecords from './DailyRecords';

const Metrics = () => {
    const { data: catRes } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
    const { data: menuRes } = useQuery({ queryKey: ['menuItems'], queryFn: getMenuItems });
    const { data: orderRes } = useQuery({ queryKey: ['orders'], queryFn: getOrders });
    const { data: tableRes } = useQuery({ queryKey: ['tables'], queryFn: getTables });

    const categoriesCount = catRes?.data?.data?.length || 0;
    const dishesCount = menuRes?.data?.data?.length || 0;
    const ordersList = orderRes?.data?.data || [];
    const activeOrdersCount = ordersList.filter(o => o.orderStatus === "In Progress" || o.orderStatus === "Ready").length;
    const tablesCount = tableRes?.data?.data?.length || 0;

    const todayLocalStr = getLocalDateString(new Date());

    const todaysRevenue = ordersList
        .filter(o => {
            const isPaid = o.paymentStatus === "Paid" || o.orderStatus === "Completed";
            const orderDateStr = getLocalDateString(o.orderDate || o.createdAt);
            return isPaid && orderDateStr === todayLocalStr;
        })
        .reduce((sum, o) => sum + (o.bills?.totalWithTax || 0), 0);

    const dynamicMetricsData = [
        { title: "Today's Revenue", value: `NPR ${todaysRevenue.toFixed(2)}`, color: "#025cca" },
        { title: "Total Orders", value: `${ordersList.length}`, color: "#02ca3a" },
        { title: "Active Orders", value: `${activeOrdersCount}`, color: "#f6b100" },
        { title: "Total Tables", value: `${tablesCount}`, color: "#be3e3f" },
    ];

    const dynamicItemsData = [
        { title: "Total Categories", value: `${categoriesCount}`, color: "#5b45b0" },
        { title: "Total Dishes", value: `${dishesCount}`, color: "#285430" },
        { title: "Active Orders", value: `${activeOrdersCount}`, color: "#735f32" },
        { title: "Total Tables", value: `${tablesCount}`, color: "#7f167f" }
    ];

    return (
        <div className='container mx-auto py-2 px-2 md:px-0 space-y-8'>
            {/* Top Cards Section */}
            <div>
                <div className='flex justify-between items-center mb-4'>
                    <div>
                        <h2 className='font-bold text-[#f5f5f5] text-2xl tracking-wide'>
                            Overall Performance Overview
                        </h2>
                        <p className='text-sm text-[#ababab]'>QuickServe Real-time Key Business Metrics</p>
                    </div>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                    {dynamicMetricsData.map((metric, index) => (
                        <div
                            key={index}
                            className='shadow-lg rounded-2xl p-5 border border-white/10 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1'
                            style={{ backgroundColor: metric.color }}
                        >
                            <p className='font-semibold text-xs text-[#f5f5f5]/90 uppercase tracking-wider'>
                                {metric.title}
                            </p>
                            <p className="mt-2 font-black text-2xl text-[#f5f5f5]">
                                {metric.value}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sales Scaling Graph Component (Per Day, Month, Year) */}
            <SalesChart orders={ordersList} />

            {/* Daily Records with Date Selector Component */}
            <DailyRecords orders={ordersList} />

            {/* Inventory Overview Footer Cards */}
            <div>
                <div className="flex flex-col justify-between mb-4">
                    <div>
                        <h2 className="font-bold text-[#f5f5f5] text-xl">
                            Inventory & Resource Management
                        </h2>
                        <p className="text-sm text-[#ababab]">
                            Summary of active categories, dishes, tables, and active queues
                        </p>
                    </div>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                    {dynamicItemsData.map((item, index) => (
                        <div
                            key={index}
                            className="shadow-md rounded-2xl p-5 border border-white/10 flex flex-col justify-between"
                            style={{ backgroundColor: item.color }}
                        >
                            <p className="font-semibold text-xs text-[#f5f5f5]/90 uppercase tracking-wider">{item.title}</p>
                            <p className="mt-2 font-black text-2xl text-[#f5f5f5]">
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Metrics;
