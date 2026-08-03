import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { getOrders, getTables, updateOrderStatus, checkoutOrder } from '../../https';
import { enqueueSnackbar } from 'notistack';
import { formatDateAndTime } from '../../utils';

const RecentOrders = () => {
    const queryClient = useQueryClient();

    const handleStatusChange = ({ orderId, orderStatus }) => {
        orderStatusUpdateMutation.mutate({ orderId, orderStatus });
    };

    const orderStatusUpdateMutation = useMutation({
        mutationFn: ({ orderId, orderStatus }) => updateOrderStatus({ orderId, orderStatus }),
        onSuccess: () => {
            enqueueSnackbar("Order status updated successfully!", { variant: "success" });
            queryClient.invalidateQueries(["orders"]);
            queryClient.invalidateQueries(["tables"]);
        },
        onError: (error) => {
            enqueueSnackbar(error?.response?.data?.message || "Failed to update order status!", { variant: "error" });
        }
    });

    const checkoutMutation = useMutation({
        mutationFn: ({ id, paymentMethod }) => checkoutOrder({ id, paymentMethod }),
        onSuccess: () => {
            enqueueSnackbar("Order checked out successfully!", { variant: "success" });
            queryClient.invalidateQueries(["orders"]);
            queryClient.invalidateQueries(["tables"]);
        },
        onError: (error) => {
            enqueueSnackbar(error?.response?.data?.message || "Checkout failed!", { variant: "error" });
        }
    });

    const handleCheckout = (order) => {
        if (order.paymentStatus === "Paid") {
            enqueueSnackbar("Order is already paid & completed!", { variant: "info" });
            return;
        }
        checkoutMutation.mutate({ id: order._id, paymentMethod: order.paymentMethod || "Cash" });
    };

    const { data: resData, isError, isLoading } = useQuery({
        queryKey: ["orders"],
        queryFn: async () => {
            return await getOrders();
        },
        placeholderData: keepPreviousData
    });

    if (isError) {
        enqueueSnackbar("Failed to load orders!", { variant: "error" });
    }

    const { data: tablesRes } = useQuery({ queryKey: ['tables'], queryFn: getTables, staleTime: 1000 * 60 * 5 });
    const tablesList = tablesRes?.data?.data || [];

    const getTableNo = (orderTable) => {
        if (!orderTable) return '1';
        if (typeof orderTable === 'object' && orderTable?.tableNo) return orderTable.tableNo;
        if (typeof orderTable === 'string') {
            const found = tablesList.find(t => t._id === orderTable);
            if (found && found.tableNo) return found.tableNo;
            if (orderTable.length === 24) return '1';
            return orderTable;
        }
        return '1';
    };

    const orders = resData?.data?.data || [];

    return (
        <div className="container mx-auto bg-[#262626] p-6 rounded-lg mt-4 shadow-lg">
            <h2 className="text-[#f5f5f5] text-xl font-semibold mb-4">
                Recent Orders Management
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-[#f5f5f5] text-sm">
                    <thead className="bg-[#333] text-[#ababab]">
                        <tr>
                            <th className="p-3">Order ID</th>
                            <th className="p-3">Customer</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Date & Time</th>
                            <th className="p-3">Items</th>
                            <th className="p-3">Table No</th>
                            <th className="p-3">Total</th>
                            <th className="p-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="8" className="text-center py-6 text-gray-400">Loading orders...</td>
                            </tr>
                        ) : orders.length > 0 ? (
                            orders.map((order) => {
                                const customerName = order.customerDetails?.name || "Customer";
                                const tableNo = getTableNo(order.table);
                                const total = order.bills?.totalWithTax ? Number(order.bills.totalWithTax).toFixed(2) : "0.00";
                                const orderDate = order.orderDate || order.createdAt;

                                return (
                                    <tr key={order._id} className="border-b border-gray-700 hover:bg-[#2d2d2d] transition">
                                        <td className="p-3 font-mono text-xs text-yellow-400">
                                            #{Math.floor(new Date(orderDate).getTime())}
                                        </td>
                                        <td className="p-3 font-medium">{customerName}</td>
                                        <td className="p-3">
                                            <select
                                                className={`bg-[#1a1a1a] text-xs font-semibold border border-gray-600 p-2 rounded-lg focus:outline-none ${
                                                    order.orderStatus === "Ready"
                                                        ? "text-green-400"
                                                        : order.orderStatus === "Completed"
                                                        ? "text-blue-400"
                                                        : "text-yellow-400"
                                                }`}
                                                value={order.orderStatus}
                                                onChange={(e) => handleStatusChange({ orderId: order._id, orderStatus: e.target.value })}
                                            >
                                                <option className="text-yellow-400" value="In Progress">In Progress</option>
                                                <option className="text-green-400" value="Ready">Ready</option>
                                                <option className="text-blue-400" value="Completed">Completed</option>
                                            </select>
                                        </td>
                                        <td className="p-3 text-xs text-gray-400">{formatDateAndTime(orderDate)}</td>
                                        <td className="p-3">{order.items?.length || 0} Items</td>
                                        <td className="p-3 font-semibold">Table {tableNo}</td>
                                        <td className="p-3 font-bold text-white">NPR {total}</td>
                                        <td className="p-3 text-center">
                                            {order.paymentStatus === "Paid" ? (
                                                <span className="text-xs bg-green-900/50 text-green-400 px-3 py-1 rounded-full border border-green-700">
                                                    Paid
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleCheckout(order)}
                                                    disabled={checkoutMutation.isPending}
                                                    className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-3 py-1 rounded-lg text-xs transition disabled:opacity-50"
                                                >
                                                    Checkout
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center py-6 text-gray-500">No orders found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentOrders;
