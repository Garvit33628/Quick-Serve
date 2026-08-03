import React from 'react';
import { FaCheckDouble, FaLongArrowAltRight } from 'react-icons/fa';
import { getAvatarName } from '../../utils';
import { useQuery } from '@tanstack/react-query';
import { getTables } from '../../https';

const OrderList = ({ order }) => {
    const { data: tablesRes } = useQuery({
        queryKey: ['tables'],
        queryFn: getTables,
        staleTime: 1000 * 60 * 5
    });

    if (!order) return null;

    const tablesList = tablesRes?.data?.data || [];

    const getTableNo = () => {
        if (!order.table) return '1';
        if (typeof order.table === 'object' && order.table?.tableNo) {
            return order.table.tableNo;
        }
        if (typeof order.table === 'string') {
            const found = tablesList.find(t => t._id === order.table);
            if (found && found.tableNo) return found.tableNo;
            if (order.table.length === 24) return '1';
            return order.table;
        }
        return '1';
    };

    const customerName = order.customerDetails?.name || "Customer";
    const tableNumber = getTableNo();
    const itemsLength = order.items?.length || 0;

    return (
        <div className='flex items-center gap-5 mb-3 bg-[#1f1f1f] p-3 rounded-lg hover:bg-[#252525] transition'>
            <button className='bg-[#f6b100] p-3 text-xl font-bold rounded-lg text-gray-900 min-w-[45px]'>
                {getAvatarName(customerName)}
            </button>
            <div className='flex items-center justify-between w-full'>
                <div className='flex flex-col items-start gap-1'>
                    <h1 className='text-[#f5f5f5] text-base font-semibold tracking-wide'>
                        {customerName}
                    </h1>
                    <p className='text-[#ababab] text-xs'> {itemsLength} Items </p>
                </div>
                <div>
                    <h1 className='text-[#f6b100] font-semibold border border-[#f6b100] rounded-lg px-3 py-1 text-xs flex items-center'>
                        Table <FaLongArrowAltRight className='text-[#ababab] mx-1 inline' /> {tableNumber}
                    </h1>
                </div>

                <div className='flex flex-col items-end gap-2'>
                    {order.orderStatus === "Ready" ? (
                        <p className='text-green-400 px-2 py-1 bg-[#2e4a40] rounded-lg text-xs font-medium'>
                            <FaCheckDouble className='inline mr-1' />
                            Ready
                        </p>
                    ) : order.orderStatus === "Completed" ? (
                        <p className='text-blue-400 px-2 py-1 bg-[#1e3a5f] rounded-lg text-xs font-medium'>
                            <FaCheckDouble className='inline mr-1' />
                            Completed
                        </p>
                    ) : (
                        <p className='text-yellow-500 px-2 py-1 bg-[#4a452e] rounded-lg text-xs font-medium'>
                            <FaCheckDouble className='inline mr-1' />
                            {order.orderStatus || "In Progress"}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderList;
