import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCategories, getMenuItems, getOrders, getTables } from '../../https';

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

    const totalRevenue = ordersList
        .filter(o => o.paymentStatus === "Paid")
        .reduce((sum, o) => sum + (o.bills?.totalWithTax || 0), 0);

    const dynamicMetricsData = [
        { title: "Total Revenue", value: `NPR ${totalRevenue.toFixed(2)}`, color: "#025cca" },
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
        <div className='container mx-auto py-2 px-6 md:px-4'>
            <div className='flex justify-between items-center'>
                <div>
                    <h2 className='font-semibold text-[#f5f5f5] text-xl'>
                        Overall Performance
                    </h2>
                    <p className='text-sm text-[#ababab]'> QuickServe Realtime Metrics </p>
                </div>
            </div>
            <div className='mt-6 grid grid-cols-4 gap-4'>
                {dynamicMetricsData.map((metric, index) => (
                    <div
                        key={index}
                        className='shadow-sm rounded-lg p-4'
                        style={{ backgroundColor: metric.color }}
                    >
                        <p className='font-medium text-xs text-[#f5f5f5]'>
                            {metric.title}
                        </p>
                        <p className="mt-1 font-semibold text-2xl text-[#f5f5f5]">
                            {metric.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="flex flex-col justify-between mt-12">
                <div>
                    <h2 className="font-semibold text-[#f5f5f5] text-xl">
                        Item Details
                    </h2>
                    <p className="text-sm text-[#ababab]">
                        Inventory and Management Overview
                    </p>
                </div>
            </div>
            <div className='mt-6 grid grid-cols-4 gap-4'>
                {dynamicItemsData.map((item, index) => (
                    <div
                        key={index}
                        className="shadow-sm rounded-lg p-4"
                        style={{ backgroundColor: item.color }}
                    >
                        <p className="font-medium text-xs text-[#f5f5f5]">{item.title}</p>
                        <p className="mt-1 font-semibold text-2xl text-[#f5f5f5]">
                            {item.value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Metrics;
