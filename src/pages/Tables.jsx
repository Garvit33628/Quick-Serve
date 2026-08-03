import React, { useState } from 'react';
import BottomNav from '../components/shared/BottomNav';
import BackButton from '../components/shared/BackButton';
import TableCard from '../components/tables/TableCard';
import Modal from '../components/shared/Modal';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTables, addOrder, updateTable as updateTableApi } from '../https/index';
import { enqueueSnackbar } from 'notistack';
import { useDispatch, useSelector } from 'react-redux';
import { setCustomer, setOrder, updateTable } from '../redux/slices/customerSlice';
import { removeAllItems } from '../redux/slices/cartSlice';
import { useNavigate } from 'react-router-dom';
import { MdTableBar } from 'react-icons/md';
import { FaCheckCircle, FaBookmark } from 'react-icons/fa';

const Tables = () => {
    const [status, setStatus] = useState("all");
    const [selectedTableForOrder, setSelectedTableForOrder] = useState(null);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [guestCount, setGuestCount] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const customerData = useSelector((state) => state.customer);

    const { data: resData, isError, isLoading } = useQuery({
        queryKey: ['tables'],
        queryFn: async () => {
            return await getTables();
        },
        placeholderData: keepPreviousData,
    });

    if (isError) {
        enqueueSnackbar("Failed to fetch tables!", { variant: "error" });
    }

    const handleOpenModalForTable = (table) => {
        setSelectedTableForOrder(table);
        setName("");
        setPhone("");
        setGuestCount(1);
        setIsModalOpen(true);
    };

    const handleCreateOrderSubmit = async () => {
        if (!name.trim()) {
            enqueueSnackbar("Please enter customer name!", { variant: "warning" });
            return;
        }
        if (!phone || phone.toString().length !== 10) {
            enqueueSnackbar("Please enter a valid 10-digit phone number!", { variant: "warning" });
            return;
        }

        const tableId = selectedTableForOrder?.tableId || selectedTableForOrder?._id;
        if (!tableId) {
            enqueueSnackbar("No table selected!", { variant: "error" });
            return;
        }

        try {
            setSubmitting(true);
          
            const orderData = {
                customerDetails: {
                    name: name.trim(),
                    phone: Number(phone),
                    guests: Number(guestCount)
                },
                orderStatus: "In Progress",
                bills: { total: 0, tax: 0, totalWithTax: 0 },
                items: [],
                table: tableId,
                paymentMethod: "Cash"
            };

            const res = await addOrder(orderData);
            const newOrder = res?.data?.data;

            if (newOrder) {
                
                await updateTableApi({ tableId, status: "Booked", orderId: newOrder._id });

               
                dispatch(setOrder({
                    activeOrderId: newOrder._id,
                    orderId: newOrder._id,
                    customerName: name.trim(),
                    customerPhone: Number(phone),
                    guests: Number(guestCount),
                    table: { tableId, tableNo: selectedTableForOrder?.tableNo || selectedTableForOrder?.name },
                    orderStatus: "In Progress"
                }));
                dispatch(removeAllItems());

                
                queryClient.invalidateQueries(['tables']);
                enqueueSnackbar(`Table ${selectedTableForOrder?.tableNo || ''} booked for ${name.trim()}!`, { variant: "success" });
            }
        } catch (err) {
            console.error("Failed to book table:", err);
            enqueueSnackbar("Failed to create order on table!", { variant: "error" });
        } finally {
            setSubmitting(false);
            setIsModalOpen(false);
            navigate('/menu');
        }
    };

    const allTables = resData?.data?.data || [];

    const isTableBooked = (table) => {
        const custName = table?.currentOrder?.customerDetails?.name
            || (customerData?.table?.tableId === table._id ? customerData.customerName : null)
            || (customerData?.table?.tableNo === table.tableNo ? customerData.customerName : null);
        return table.status === "Booked" || Boolean(custName) || Boolean(table.currentOrder);
    };

    const bookedCount = allTables.filter(isTableBooked).length;
    const availableCount = allTables.length - bookedCount;

    const filteredTables = allTables.filter((table) => {
        if (status === "booked") return isTableBooked(table);
        if (status === "available") return !isTableBooked(table);
        return true;
    });

    return (
        <div>
            <section className='bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex flex-col'>
              
                <div className='flex items-center justify-between px-10 py-4 border-b border-[#2a2a2a]'>
                    <div className='flex items-center gap-4'>
                        <BackButton />
                        <div>
                            <h1 className='text-[#f5f5f5] text-2xl font-bold tracking-wider flex items-center gap-2'>
                                <MdTableBar className='text-[#f6b100]' /> Tables Overview
                            </h1>
                            <p className='text-xs text-[#ababab] mt-0.5'>
                                Manage dining tables & active orders
                            </p>
                        </div>
                    </div>

                    
                    <div className='flex items-center gap-3'>
                        <button
                            onClick={() => setStatus("all")}
                            className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-semibold transition ${
                                status === "all"
                                    ? "bg-[#f6b100] text-gray-900 shadow-md"
                                    : "bg-[#262626] text-[#ababab] hover:bg-[#333333] hover:text-white"
                            }`}
                        >
                            <span>All</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${status === "all" ? "bg-gray-900/20 text-gray-900" : "bg-[#1f1f1f] text-gray-400"}`}>
                                {allTables.length}
                            </span>
                        </button>

                        <button
                            onClick={() => setStatus("booked")}
                            className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-semibold transition ${
                                status === "booked"
                                    ? "bg-emerald-600 text-white shadow-md"
                                    : "bg-[#262626] text-[#ababab] hover:bg-[#333333] hover:text-white"
                            }`}
                        >
                            <FaBookmark size={12} />
                            <span>Booked</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${status === "booked" ? "bg-black/20 text-white" : "bg-[#1f1f1f] text-emerald-400"}`}>
                                {bookedCount}
                            </span>
                        </button>

                        <button
                            onClick={() => setStatus("available")}
                            className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-semibold transition ${
                                status === "available"
                                    ? "bg-amber-600 text-white shadow-md"
                                    : "bg-[#262626] text-[#ababab] hover:bg-[#333333] hover:text-white"
                            }`}
                        >
                            <FaCheckCircle size={12} />
                            <span>Available</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${status === "available" ? "bg-black/20 text-white" : "bg-[#1f1f1f] text-amber-400"}`}>
                                {availableCount}
                            </span>
                        </button>
                    </div>
                </div>

               
                <div className="flex-1 overflow-y-auto px-10 py-6 pb-28">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                            <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                            <p>Loading table layouts...</p>
                        </div>
                    ) : filteredTables.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredTables.map((table) => {
                                const customerName = table?.currentOrder?.customerDetails?.name
                                    || (customerData?.table?.tableId === table._id ? customerData.customerName : null);

                                return (
                                    <TableCard
                                        key={table._id}
                                        tableId={table._id}
                                        name={table.tableNo}
                                        status={table.status}
                                        initials={customerName}
                                        seats={table.seats}
                                        currentOrder={table.currentOrder}
                                        onSelectAvailableTable={handleOpenModalForTable}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-500 bg-[#262626] rounded-2xl border border-[#333333] max-w-md mx-auto">
                            <MdTableBar size={48} className="mx-auto text-gray-600 mb-2" />
                            <p className="text-lg font-semibold text-gray-300">No tables found</p>
                            <p className="text-xs text-gray-500 mt-1">Try switching filter tabs or create new tables in Dashboard.</p>
                        </div>
                    )}
                </div>

                <BottomNav />
            </section>

            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Create Order for Table ${selectedTableForOrder?.tableNo || ''}`}>
                <div className='space-y-4'>
                    <div>
                        <label className='block text-[#ababab] mb-1 text-sm font-medium'>
                            Customer Name
                        </label>
                        <div className='flex items-center rounded-lg p-3 bg-[#1f1f1f] border border-[#333] focus-within:border-yellow-500'>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                type="text"
                                placeholder='Enter customer name'
                                className='bg-transparent flex-1 text-white focus:outline-none'
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className='block text-[#ababab] mb-1 text-sm font-medium'>
                            Customer Phone (10 Digits)
                        </label>
                        <div className='flex items-center rounded-lg p-3 bg-[#1f1f1f] border border-[#333] focus-within:border-yellow-500'>
                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                type="number"
                                placeholder='9800000000'
                                className='bg-transparent flex-1 text-white focus:outline-none'
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className='block mb-1 text-sm font-medium text-[#ababab]'>
                            Guests
                        </label>
                        <div className='flex items-center justify-between bg-[#1f1f1f] px-4 py-3 rounded-lg border border-[#333]'>
                            <button onClick={() => setGuestCount(prev => Math.max(1, prev - 1))} className='text-yellow-500 text-2xl font-bold hover:text-yellow-400'>&minus;</button>
                            <span className='text-white font-semibold'>{guestCount} {guestCount === 1 ? 'person' : 'people'}</span>
                            <button onClick={() => setGuestCount(prev => prev + 1)} className='text-yellow-500 text-2xl font-bold hover:text-yellow-400'>&#43;</button>
                        </div>
                    </div>

                    <button
                        onClick={handleCreateOrderSubmit}
                        className='w-full bg-[#f6b100] text-gray-900 font-bold rounded-lg py-3 mt-4 hover:bg-yellow-500 transition shadow-lg'
                    >
                        Proceed to Menu
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default Tables;


