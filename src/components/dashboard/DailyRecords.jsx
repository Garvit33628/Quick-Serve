import React, { useState, useMemo } from 'react';
import { FaCalendarAlt, FaReceipt, FaMoneyBillWave, FaUtensils, FaCreditCard, FaUser } from 'react-icons/fa';
import { formatDateAndTime, getAvatarName, getLocalDateString } from '../../utils';

const DailyRecords = ({ orders = [] }) => {
    
    const todayStr = useMemo(() => getLocalDateString(new Date()), []);
    const [selectedDate, setSelectedDate] = useState(todayStr);

   
    const setToday = () => setSelectedDate(todayStr);
    const setYesterday = () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        setSelectedDate(getLocalDateString(d));
    };
    const setSevenDaysAgo = () => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        setSelectedDate(getLocalDateString(d));
    };

    
    const dailyOrders = useMemo(() => {
        return orders.filter(order => {
            const orderDateStr = getLocalDateString(order.orderDate || order.createdAt);
            return orderDateStr === selectedDate;
        });
    }, [orders, selectedDate]);

   
    const paidDailyOrders = useMemo(() => dailyOrders.filter(o => o.paymentStatus === "Paid" || o.orderStatus === "Completed"), [dailyOrders]);
    const dailyRevenue = useMemo(() => paidDailyOrders.reduce((sum, o) => sum + Number(o.bills?.totalWithTax || 0), 0), [paidDailyOrders]);
    const avgOrderValue = paidDailyOrders.length > 0 ? (dailyRevenue / paidDailyOrders.length) : 0;

   
    const paymentBreakdown = useMemo(() => {
        const counts = { Cash: 0, Card: 0, eSewa: 0, Khalti: 0 };
        paidDailyOrders.forEach(o => {
            const method = o.paymentMethod || "Cash";
            if (counts[method] !== undefined) counts[method] += 1;
            else counts["Cash"] += 1;
        });
        return counts;
    }, [paidDailyOrders]);

    
    const topDishes = useMemo(() => {
        const itemMap = {};
        dailyOrders.forEach(o => {
            (o.items || []).forEach(item => {
                const name = item.name || "Item";
                const qty = Number(item.quantity) || 1;
                const totalAmount = Number(item.price) || ((Number(item.pricePerQuantity) || 0) * qty);
                if (!itemMap[name]) {
                    itemMap[name] = { name, totalQty: 0, totalAmount: 0 };
                }
                itemMap[name].totalQty += qty;
                itemMap[name].totalAmount += totalAmount;
            });
        });
        return Object.values(itemMap).sort((a, b) => b.totalQty - a.totalQty).slice(0, 5);
    }, [dailyOrders]);

    const formattedSelectedDateLabel = useMemo(() => {
        if (selectedDate === todayStr) return "Today";
        const d = new Date(selectedDate);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }, [selectedDate, todayStr]);

    return (
        <div className="bg-[#262626] border border-[#333333] rounded-2xl p-6 shadow-xl mb-8">
           
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-[#333] pb-6 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#025cca]/10 text-[#025cca] rounded-xl border border-[#025cca]/20">
                        <FaCalendarAlt size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-wide">Daily Sales & Transactions Record</h3>
                        <p className="text-xs text-gray-400">Filter records by date to view detailed performance metrics</p>
                    </div>
                </div>

                
                <div className="flex items-center gap-2 flex-wrap bg-[#1f1f1f] p-2 rounded-xl border border-[#333]">
                    <span className="text-xs font-semibold text-gray-400 px-2">Select Date:</span>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-[#262626] border border-[#3a3a3a] text-white text-xs font-semibold px-3 py-2 rounded-lg focus:outline-none focus:border-[#f6b100]"
                    />
                    <div className="flex items-center gap-1 ml-1">
                        <button
                            onClick={setToday}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                selectedDate === todayStr ? "bg-[#f6b100] text-gray-900 shadow-md" : "bg-[#262626] text-gray-400 hover:text-white"
                            }`}
                        >
                            Today
                        </button>
                        <button
                            onClick={setYesterday}
                            className="px-3 py-1.5 bg-[#262626] hover:bg-[#333] text-gray-400 hover:text-white rounded-lg text-xs font-semibold transition"
                        >
                            Yesterday
                        </button>
                        <button
                            onClick={setSevenDaysAgo}
                            className="px-3 py-1.5 bg-[#262626] hover:bg-[#333] text-gray-400 hover:text-white rounded-lg text-xs font-semibold transition"
                        >
                            -7 Days
                        </button>
                    </div>
                </div>
            </div>

            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#1f1f1f] p-4 rounded-xl border border-[#333]">
                    <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
                        <span>Daily Revenue ({formattedSelectedDateLabel})</span>
                        <FaMoneyBillWave className="text-emerald-400" />
                    </div>
                    <p className="text-2xl font-black text-[#f6b100] mt-2">NPR {dailyRevenue.toFixed(2)}</p>
                    <p className="text-[11px] text-gray-500 mt-1">{paidDailyOrders.length} paid order(s)</p>
                </div>

                <div className="bg-[#1f1f1f] p-4 rounded-xl border border-[#333]">
                    <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
                        <span>Total Daily Orders</span>
                        <FaReceipt className="text-blue-400" />
                    </div>
                    <p className="text-2xl font-black text-white mt-2">{dailyOrders.length}</p>
                    <p className="text-[11px] text-gray-500 mt-1">{dailyOrders.length - paidDailyOrders.length} active/pending</p>
                </div>

                <div className="bg-[#1f1f1f] p-4 rounded-xl border border-[#333]">
                    <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
                        <span>Avg Order Value</span>
                        <FaCreditCard className="text-purple-400" />
                    </div>
                    <p className="text-2xl font-black text-emerald-400 mt-2">NPR {avgOrderValue.toFixed(2)}</p>
                    <p className="text-[11px] text-gray-500 mt-1">Per transaction average</p>
                </div>

                <div className="bg-[#1f1f1f] p-4 rounded-xl border border-[#333]">
                    <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
                        <span>Payment Modes</span>
                        <FaCreditCard className="text-yellow-400" />
                    </div>
                    <div className="flex items-center justify-between text-xs mt-2 font-semibold text-gray-300">
                        <span>Cash: {paymentBreakdown.Cash}</span>
                        <span>Card: {paymentBreakdown.Card}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1 font-semibold text-gray-400">
                        <span>eSewa: {paymentBreakdown.eSewa}</span>
                        <span>Khalti: {paymentBreakdown.Khalti}</span>
                    </div>
                </div>
            </div>

           
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               
                <div className="bg-[#1f1f1f] p-5 rounded-xl border border-[#333] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <FaUtensils className="text-[#f6b100]" />
                            <h4 className="text-md font-bold text-white">Top Sold Items</h4>
                        </div>
                        {topDishes.length === 0 ? (
                            <p className="text-xs text-gray-500 py-6 text-center">No dishes sold on this date</p>
                        ) : (
                            <div className="space-y-3">
                                {topDishes.map((dish, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-[#262626] p-3 rounded-lg border border-[#333]">
                                        <div>
                                            <p className="text-xs font-semibold text-white">{dish.name}</p>
                                            <p className="text-[10px] text-gray-400">{dish.totalQty} qty sold</p>
                                        </div>
                                        <span className="text-xs font-bold text-[#f6b100]">NPR {dish.totalAmount.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                
                <div className="lg:col-span-2 bg-[#1f1f1f] p-5 rounded-xl border border-[#333]">
                    <h4 className="text-md font-bold text-white mb-4 flex items-center justify-between">
                        <span>Orders on {selectedDate}</span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f6b100]/20 text-[#f6b100]">
                            {dailyOrders.length} Orders
                        </span>
                    </h4>

                    {dailyOrders.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p className="text-sm font-semibold">No transactions recorded on this date</p>
                            <p className="text-xs mt-1">Select a different date from the date picker above</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto max-h-[350px] overflow-y-auto pr-1">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-[#333] text-gray-400 pb-2">
                                        <th className="pb-3 font-semibold">Customer</th>
                                        <th className="pb-3 font-semibold">Items</th>
                                        <th className="pb-3 font-semibold">Payment</th>
                                        <th className="pb-3 font-semibold text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#2a2a2a]">
                                    {dailyOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-[#262626] transition">
                                            <td className="py-3 pr-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-[#f6b100] text-gray-900 font-bold flex items-center justify-center text-[10px]">
                                                        {getAvatarName(order.customerDetails?.name || "Customer")}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white">{order.customerDetails?.name || "Customer"}</p>
                                                        <p className="text-[10px] text-gray-500">{formatDateAndTime(order.orderDate || order.createdAt)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 text-gray-300">
                                                <p className="font-medium">{order.items?.length || 0} items</p>
                                                <p className="text-[10px] text-gray-500 truncate max-w-[140px]">
                                                    {order.items?.map(i => `${i.name} x${i.quantity}`).join(', ')}
                                                </p>
                                            </td>
                                            <td className="py-3 px-2">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                    order.paymentStatus === "Paid"
                                                        ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                                                        : "bg-amber-950 text-amber-400 border border-amber-500/30"
                                                }`}>
                                                    {order.paymentStatus || "Pending"} ({order.paymentMethod || "Cash"})
                                                </span>
                                            </td>
                                            <td className="py-3 pl-2 text-right font-bold text-[#f6b100]">
                                                NPR {(order.bills?.totalWithTax || 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DailyRecords;
