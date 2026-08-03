import React, { useState, useMemo } from 'react';
import { FaChartLine, FaCalendarAlt, FaCalendarWeek, FaCalendar } from 'react-icons/fa';
import { getLocalDateString } from '../../utils';

const SalesChart = ({ orders = [] }) => {
    const [timeframe, setTimeframe] = useState("day"); // "day" | "month" | "year"
    const [hoveredBar, setHoveredBar] = useState(null);

    const paidOrders = useMemo(() => {
        return orders.filter(o => o.paymentStatus === "Paid" || o.orderStatus === "Completed");
    }, [orders]);

    // Process chart data based on selected timeframe
    const chartData = useMemo(() => {
        if (timeframe === "day") {
            // Last 14 days
            const daysMap = {};
            const now = new Date();
            for (let i = 13; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                const key = getLocalDateString(d);
                const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                daysMap[key] = { label, key, revenue: 0, orderCount: 0 };
            }

            paidOrders.forEach(order => {
                const key = getLocalDateString(order.orderDate || order.createdAt);
                if (daysMap[key]) {
                    const amount = Number(order.bills?.totalWithTax || 0);
                    daysMap[key].revenue += amount;
                    daysMap[key].orderCount += 1;
                }
            });

            return Object.values(daysMap);
        } else if (timeframe === "month") {
            // Months of current year
            const monthsMap = {};
            const currentYear = new Date().getFullYear();
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            monthNames.forEach((mName, idx) => {
                const key = `${currentYear}-${String(idx + 1).padStart(2, '0')}`;
                monthsMap[key] = { label: mName, key, revenue: 0, orderCount: 0 };
            });

            paidOrders.forEach(order => {
                const dateObj = new Date(order.orderDate || order.createdAt || Date.now());
                if (dateObj.getFullYear() === currentYear) {
                    const monthIdx = dateObj.getMonth();
                    const key = `${currentYear}-${String(monthIdx + 1).padStart(2, '0')}`;
                    if (monthsMap[key]) {
                        const amount = Number(order.bills?.totalWithTax || 0);
                        monthsMap[key].revenue += amount;
                        monthsMap[key].orderCount += 1;
                    }
                }
            });

            return Object.values(monthsMap);
        } else {
            // Yearly breakdown (last 5 years)
            const yearsMap = {};
            const currentYear = new Date().getFullYear();
            for (let y = currentYear - 4; y <= currentYear; y++) {
                yearsMap[y] = { label: String(y), key: String(y), revenue: 0, orderCount: 0 };
            }

            paidOrders.forEach(order => {
                const dateObj = new Date(order.orderDate || order.createdAt || Date.now());
                const yr = dateObj.getFullYear();
                if (yearsMap[yr]) {
                    const amount = Number(order.bills?.totalWithTax || 0);
                    yearsMap[yr].revenue += amount;
                    yearsMap[yr].orderCount += 1;
                }
            });

            return Object.values(yearsMap);
        }
    }, [paidOrders, timeframe]);

    const maxRevenue = useMemo(() => {
        const max = Math.max(...chartData.map(d => d.revenue), 1);
        return max;
    }, [chartData]);

    const totalPeriodRevenue = useMemo(() => {
        return chartData.reduce((acc, d) => acc + d.revenue, 0);
    }, [chartData]);

    const totalPeriodOrders = useMemo(() => {
        return chartData.reduce((acc, d) => acc + d.orderCount, 0);
    }, [chartData]);

    const avgRevenue = chartData.length > 0 ? (totalPeriodRevenue / chartData.length) : 0;

    return (
        <div className="bg-[#262626] border border-[#333333] rounded-2xl p-6 shadow-xl mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#333] pb-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#f6b100]/10 text-[#f6b100] rounded-xl border border-[#f6b100]/20">
                        <FaChartLine size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-wide">Sales Scaling & Revenue Analytics</h3>
                        <p className="text-xs text-gray-400">Real-time revenue breakdown scaling per day, month, and year</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-[#1f1f1f] p-1.5 rounded-xl border border-[#333]">
                    <button
                        onClick={() => setTimeframe("day")}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                            timeframe === "day"
                                ? "bg-[#f6b100] text-gray-900 shadow-md"
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        <FaCalendarAlt size={12} />
                        <span>Per Day</span>
                    </button>

                    <button
                        onClick={() => setTimeframe("month")}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                            timeframe === "month"
                                ? "bg-[#f6b100] text-gray-900 shadow-md"
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        <FaCalendarWeek size={12} />
                        <span>Per Month</span>
                    </button>

                    <button
                        onClick={() => setTimeframe("year")}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                            timeframe === "year"
                                ? "bg-[#f6b100] text-gray-900 shadow-md"
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        <FaCalendar size={12} />
                        <span>Per Year</span>
                    </button>
                </div>
            </div>

            {/* Quick Metrics Header */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#1f1f1f] p-4 rounded-xl border border-[#333] flex flex-col justify-between">
                    <span className="text-xs font-medium text-gray-400">Total Period Revenue</span>
                    <span className="text-2xl font-black text-[#f6b100] mt-1">NPR {totalPeriodRevenue.toFixed(2)}</span>
                    <span className="text-[11px] text-gray-500 mt-1">From {paidOrders.length} total paid transactions</span>
                </div>
                <div className="bg-[#1f1f1f] p-4 rounded-xl border border-[#333] flex flex-col justify-between">
                    <span className="text-xs font-medium text-gray-400">Average Revenue / {timeframe.toUpperCase()}</span>
                    <span className="text-2xl font-black text-emerald-400 mt-1">NPR {avgRevenue.toFixed(2)}</span>
                    <span className="text-[11px] text-gray-500 mt-1">Average per {timeframe} interval</span>
                </div>
                <div className="bg-[#1f1f1f] p-4 rounded-xl border border-[#333] flex flex-col justify-between">
                    <span className="text-xs font-medium text-gray-400">Completed Orders</span>
                    <span className="text-2xl font-black text-blue-400 mt-1">{totalPeriodOrders} Orders</span>
                    <span className="text-[11px] text-gray-500 mt-1">Total orders scaled in view</span>
                </div>
            </div>

            {/* Interactive Graph Container */}
            <div className="relative pt-6 pb-2 px-2 bg-[#1f1f1f] rounded-xl border border-[#333]">
                <div className="h-64 flex items-end justify-between gap-2 px-4 relative">
                    {/* Background Grid Lines */}
                    <div className="absolute inset-x-0 top-0 border-b border-gray-800/60 pointer-events-none"></div>
                    <div className="absolute inset-x-0 top-1/4 border-b border-gray-800/60 pointer-events-none"></div>
                    <div className="absolute inset-x-0 top-2/4 border-b border-gray-800/60 pointer-events-none"></div>
                    <div className="absolute inset-x-0 top-3/4 border-b border-gray-800/60 pointer-events-none"></div>

                    {chartData.map((item, idx) => {
                        const heightPercent = Math.max((item.revenue / maxRevenue) * 100, item.revenue > 0 ? 8 : 4);
                        const isHovered = hoveredBar === idx;

                        return (
                            <div
                                key={idx}
                                onMouseEnter={() => setHoveredBar(idx)}
                                onMouseLeave={() => setHoveredBar(null)}
                                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative z-10"
                            >
                                {/* Tooltip */}
                                {isHovered && (
                                    <div className="absolute bottom-full mb-2 bg-[#121212] border border-[#f6b100] px-3 py-1.5 rounded-lg shadow-2xl z-30 pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                                        <p className="text-[11px] font-bold text-[#f6b100]">{item.label}</p>
                                        <p className="text-xs font-black text-white">NPR {item.revenue.toFixed(2)}</p>
                                        <p className="text-[10px] text-gray-400">{item.orderCount} order(s)</p>
                                    </div>
                                )}

                                {/* Animated Bar */}
                                <div
                                    style={{ height: `${heightPercent}%` }}
                                    className={`w-full max-w-[48px] rounded-t-lg transition-all duration-300 relative overflow-hidden ${
                                        isHovered
                                            ? "bg-gradient-to-t from-[#f6b100] to-yellow-300 shadow-lg shadow-yellow-500/20"
                                            : item.revenue > 0
                                            ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                                            : "bg-gray-800/60 hover:bg-gray-700"
                                    }`}
                                >
                                    <div className="absolute top-0 inset-x-0 h-1 bg-white/40"></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* X Axis Labels */}
                <div className="flex justify-between items-center px-4 pt-3 border-t border-[#333] mt-2">
                    {chartData.map((item, idx) => (
                        <div key={idx} className="flex-1 text-center">
                            <span className={`text-[11px] font-semibold block truncate ${hoveredBar === idx ? "text-[#f6b100] font-bold" : "text-gray-400"}`}>
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SalesChart;
