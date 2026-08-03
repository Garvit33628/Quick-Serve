import React, { useState } from 'react';
import { getAvatarName, getRandomBG } from '../../utils';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setOrder, updateTable } from '../../redux/slices/customerSlice';
import { setCart, removeAllItems } from '../../redux/slices/cartSlice';
import { getOrderById } from '../../https';
import { FaUserFriends, FaArrowRight, FaReceipt } from 'react-icons/fa';
import { MdTableBar } from 'react-icons/md';
import { enqueueSnackbar } from 'notistack';

const TableCard = ({ tableId, name, status, initials, seats, currentOrder, onSelectAvailableTable }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const customerData = useSelector((state) => state.customer);
    const [loading, setLoading] = useState(false);

    const isBooked = status === "Booked" && Boolean(currentOrder);
    const displayStatus = isBooked ? "Booked" : "Available";

    const handleClick = async () => {
        if (loading) return;

        if (isBooked) {
            const orderId = typeof currentOrder === 'object' ? currentOrder?._id : currentOrder;
            if (orderId) {
                try {
                    setLoading(true);
                    const res = await getOrderById(orderId);
                    const order = res.data?.data;
                    if (order) {
                        dispatch(setOrder({
                            activeOrderId: order._id,
                            orderId: order._id,
                            customerName: order.customerDetails?.name || initials || "Customer",
                            customerPhone: order.customerDetails?.phone || "",
                            guests: order.customerDetails?.guests || 1,
                            table: { tableId, tableNo: name },
                            orderStatus: order.orderStatus
                        }));
                        dispatch(setCart(order.items || []));
                        navigate(`/menu`);
                        return;
                    }
                } catch (err) {
                    console.error("Failed to load table order:", err);
                    enqueueSnackbar("Failed to load table order!", { variant: "error" });
                } finally {
                    setLoading(false);
                }
            } else {
                enqueueSnackbar("No active order linked to this booked table!", { variant: "warning" });
            }
        } else {
            
            if (onSelectAvailableTable) {
                onSelectAvailableTable({ tableId, tableNo: name, seats });
            }
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`w-full bg-[#262626] border border-[#333333] hover:border-[#f6b100]/50 p-5 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                loading ? "opacity-50 pointer-events-none" : ""
            }`}
        >
           
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2 text-[#f5f5f5]'>
                    <div className='p-2.5 rounded-xl bg-[#1f1f1f] text-[#f6b100] group-hover:bg-[#f6b100] group-hover:text-gray-900 transition-colors'>
                        <MdTableBar size={22} />
                    </div>
                    <div>
                        <h3 className='text-lg font-bold tracking-wide'>Table {name}</h3>
                        <p className='text-xs text-[#ababab] flex items-center gap-1'>
                            <FaUserFriends size={12} className='inline' /> {seats || 4} Seats
                        </p>
                    </div>
                </div>

                <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                        isBooked
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                    }`}
                >
                    <span
                        className={`w-2 h-2 rounded-full mr-1.5 ${
                            isBooked ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                        }`}
                    ></span>
                    {displayStatus}
                </span>
            </div>

            
            <div className='my-6 flex flex-col items-center justify-center py-2'>
                {isBooked ? (
                    <div className='flex flex-col items-center gap-2'>
                        <div
                            style={{ backgroundColor: initials ? getRandomBG(tableId) : '#f6b100' }}
                            className='w-14 h-14 rounded-full flex items-center justify-center text-gray-900 text-xl font-extrabold shadow-lg border-2 border-[#1f1f1f]'
                        >
                            {getAvatarName(initials) || 'C'}
                        </div>
                        <p className='text-sm font-semibold text-[#f5f5f5] truncate max-w-[160px]'>
                            {initials || 'Active Guest'}
                        </p>
                        <p className='text-[11px] text-emerald-400 bg-emerald-950/50 px-2.5 py-0.5 rounded-full font-medium'>
                            Booked / Active
                        </p>
                    </div>
                ) : (
                    <div className='flex flex-col items-center gap-2 text-[#666666] group-hover:text-[#ababab] transition-colors'>
                        <div className='w-14 h-14 rounded-full bg-[#1f1f1f] flex items-center justify-center text-gray-500 border border-[#2a2a2a]'>
                            <FaUserFriends size={24} />
                        </div>
                        <p className='text-xs text-[#ababab] font-medium'>Ready for guests</p>
                    </div>
                )}
            </div>

            
            <div className='pt-3 border-t border-[#333333] flex items-center justify-between text-xs font-semibold'>
                {isBooked ? (
                    <span className='text-amber-400 flex items-center gap-1.5 w-full justify-center py-1.5 rounded-lg bg-amber-500/10 group-hover:bg-amber-500 group-hover:text-gray-900 transition-colors'>
                        <FaReceipt size={12} /> View & Update Order
                    </span>
                ) : (
                    <span className='text-[#ababab] flex items-center gap-1.5 w-full justify-center py-1.5 rounded-lg bg-[#1f1f1f] group-hover:bg-[#f6b100] group-hover:text-gray-900 transition-colors'>
                        Book Table <FaArrowRight size={10} />
                    </span>
                )}
            </div>
        </div>
    );
};

export default TableCard;


