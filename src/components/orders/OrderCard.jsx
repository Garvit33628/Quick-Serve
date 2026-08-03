import React from 'react';
import { FaCheckDouble, FaCircle, FaLongArrowAltRight } from 'react-icons/fa';
import { formatDateAndTime, getAvatarName } from '../../utils';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setOrder } from '../../redux/slices/customerSlice';
import { setCart } from '../../redux/slices/cartSlice';
import { useQuery } from '@tanstack/react-query';
import { getTables } from '../../https';

const OrderCard = ({ order }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { data: tablesRes } = useQuery({
        queryKey: ['tables'],
        queryFn: getTables,
        staleTime: 1000 * 60 * 5
    });

    if (!order) return null;

    const tablesList = tablesRes?.data?.data || [];

    const getTableNo = () => {
        if (!order.table) return '1';
        if (typeof order.table === 'object' && order.table !== null && order.table?.tableNo) {
            return order.table.tableNo;
        }
        if (typeof order.table === 'string') {
            const found = tablesList.find(t => t && t._id === order.table);
            if (found && found.tableNo) return found.tableNo;
            if (order.table.length === 24) return '1';
            return order.table;
        }
        return '1';
    };

    const customerName = order.customerDetails?.name || "Customer";
    const tableNumber = getTableNo();
    const tableObj = (order.table && typeof order.table === 'object')
        ? { tableId: order.table._id || null, tableNo: order.table.tableNo || tableNumber }
        : { tableId: order.table || null, tableNo: tableNumber };
    const totalAmount = order.bills?.totalWithTax ? Number(order.bills.totalWithTax).toFixed(2) : "0.00";
    const orderTime = order.orderDate || order.createdAt || Date.now();
    const orderIdShort = Math.floor(new Date(orderTime).getTime());

    const handleCardClick = () => {
        dispatch(setOrder({
            activeOrderId: order._id,
            orderId: order._id,
            customerName: customerName,
            customerPhone: order.customerDetails?.phone || "",
            guests: order.customerDetails?.guests || 1,
            table: tableObj,
            orderStatus: order.orderStatus
        }));
        dispatch(setCart(order.items || []));
        navigate('/menu');
    };

    return (
        <div
            onClick={handleCardClick}
            className='w-[500px] bg-[#262626] hover:bg-[#2e2e2e] transition cursor-pointer p-4 rounded-lg mb-4 shadow-md border border-transparent hover:border-gray-700'
        >
            <div className='flex items-center gap-5'>
                <button className='bg-[#f6b100] p-3 text-xl font-bold rounded-lg min-w-[50px] text-gray-900'>
                    {getAvatarName(customerName)}
                </button>
                <div className='flex items-center justify-between w-[100%]'>
                    <div className='items-start flex flex-col gap-1'>
                        <h1 className='text-[#f5f5f5] text-lg font-semibold tracking-wide'>
                            {customerName}
                        </h1>
                        <p className='text-[#ababab] text-sm'>
                            #{orderIdShort} / Dine in
                        </p>
                        <p className='text-[#ababab] text-sm flex items-center'>
                            Table <FaLongArrowAltRight className='text-[#ababab] mx-1 inline' /> {tableNumber}
                        </p>
                    </div>

                    <div className='flex flex-col items-end gap-2'>
                        {order.orderStatus === "Ready" ? (
                            <>
                                <p className='text-green-400 px-2 py-1 bg-[#2e4a40] rounded-lg text-sm font-medium'>
                                    <FaCheckDouble className='inline mr-2' />
                                    Ready
                                </p>
                                <p className='text-[#ababab] text-xs flex items-center'>
                                    <FaCircle className='inline mr-1 text-green-500' size={10} />
                                    Ready To Serve
                                </p>
                            </>
                        ) : order.orderStatus === "Completed" ? (
                            <>
                                <p className='text-blue-400 px-2 py-1 bg-[#1e3a5f] rounded-lg text-sm font-medium'>
                                    <FaCheckDouble className='inline mr-2' />
                                    Completed
                                </p>
                                <p className='text-[#ababab] text-xs flex items-center'>
                                    <FaCircle className='inline mr-1 text-blue-500' size={10} />
                                    Checked Out
                                </p>
                            </>
                        ) : (
                            <>
                                <p className='text-yellow-500 px-2 py-1 bg-[#4a452e] rounded-lg text-sm font-medium'>
                                    <FaCheckDouble className='inline mr-2' />
                                    {order.orderStatus || "In Progress"}
                                </p>
                                <p className='text-[#ababab] text-xs flex items-center'>
                                    <FaCircle className='inline mr-1 text-yellow-500' size={10} />
                                    Preparing your order
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className='flex justify-between items-center mt-4 text-[#ababab] text-sm'>
                <p>{formatDateAndTime(orderTime)}</p>
                <p>{order.items?.length || 0} Items</p>
            </div>

            <hr className='w-full mt-3 border-t border-gray-700' />

            <div className="flex items-center justify-between mt-3">
                <h1 className='text-[#f5f5f5] text-lg font-semibold'> Total </h1>
                <p className='text-[#f5f5f5] text-lg font-semibold'>NPR {totalAmount}</p>
            </div>
        </div>
    );
};

export default OrderCard;

