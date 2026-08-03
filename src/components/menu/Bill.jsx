import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getTotalPrice, removeAllItems } from '../../redux/slices/cartSlice';
import { enqueueSnackbar } from "notistack";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addOrder, updateTable, checkoutOrder, updateOrderApi } from '../../https';
import { removeCustomer, setOrder } from '../../redux/slices/customerSlice';
import Invoice from '../invoice/invoice';

const Bill = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const customerData = useSelector((state) => state.customer);
    const cartData = useSelector((state) => state.cart);
    const total = useSelector(getTotalPrice);
    const taxRate = 13;
    const tax = (total * taxRate) / 100;
    const totalPriceWithTax = total + tax;

    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [showInvoice, setShowInvoice] = useState(false);
    const [orderInfo, setOrderInfo] = useState(null);

    const handleCloseInvoice = () => {
        setShowInvoice(false);
        queryClient.invalidateQueries(['tables']);
        navigate('/tables');
    };

    const tableUpdateMutation = useMutation({
        mutationFn: (reqData) => updateTable(reqData),
        onSuccess: () => {
            enqueueSnackbar(customerData.activeOrderId ? "Order Updated Successfully!" : "Order Placed Successfully!", { variant: "success" });
        },
        onError: (error) => {
            console.error(error);
        }
    });

    const orderMutation = useMutation({
        mutationFn: (reqData) => addOrder(reqData),
        onSuccess: (resData) => {
            const data = resData.data.data;
            setOrderInfo(data);

            dispatch(setOrder({
                activeOrderId: data._id,
                orderId: data._id,
                customerName: customerData.customerName,
                customerPhone: customerData.customerPhone,
                guests: customerData.guests,
                table: customerData.table,
                orderStatus: "In Progress"
            }));

            if (data.table) {
                const tableId = typeof data.table === 'object' ? data.table._id : data.table;
                tableUpdateMutation.mutate({
                    tableId: tableId,
                    status: "Booked",
                    orderId: data._id
                });
            } else {
                enqueueSnackbar("Order Placed Successfully!", { variant: "success" });
            }
        },
        onError: (error) => {
            const message = error?.response?.data?.message || "Failed to place order!";
            enqueueSnackbar(message, { variant: "error" });
        }
    });

    const checkoutMutation = useMutation({
        mutationFn: ({ id, paymentMethod }) => checkoutOrder({ id, paymentMethod }),
        onSuccess: (resData, variables) => {
            const data = resData.data.data;
            const mergedOrderInfo = {
                ...data,
                items: (data?.items && data.items.length > 0) ? data.items : (variables?.snapshotItems || []),
                bills: (data?.bills && Number(data.bills.total) > 0) ? data.bills : (variables?.snapshotBills || { total: 0, tax: 0, totalWithTax: 0 }),
                customerDetails: data?.customerDetails?.name ? data.customerDetails : {
                    name: customerData.customerName || "Customer",
                    phone: customerData.customerPhone || "N/A",
                    guests: customerData.guests || 1
                }
            };

            setOrderInfo(mergedOrderInfo);
            setShowInvoice(true);
            enqueueSnackbar("Checkout completed successfully!", { variant: "success" });

            const tableId = customerData.table?.tableId || customerData.table?._id || (data?.table ? (typeof data.table === 'object' ? data.table._id : data.table) : null);
            if (tableId) {
                updateTable({ tableId, status: "Available", orderId: null }).catch(err => console.error("Table unbook error:", err));
            }
            dispatch(removeCustomer());
            dispatch(removeAllItems({ tableId, orderId: data?._id }));
            queryClient.invalidateQueries(['tables']);
        },
        onError: (error) => {
            const message = error?.response?.data?.message || "Failed to checkout order!";
            enqueueSnackbar(message, { variant: "error" });
        }
    });

    const handleDirectCheckout = async () => {
        if (!paymentMethod) {
            enqueueSnackbar("Please select a payment method!", { variant: "warning" });
            return;
        }
        if (!cartData || cartData.length === 0) {
            enqueueSnackbar("Cannot checkout an empty cart! Please add items first.", { variant: "warning" });
            return;
        }

        const snapshotItems = cartData.map(item => ({
            id: item.id || item._id,
            _id: item.id || item._id,
            name: item.name,
            quantity: item.quantity,
            pricePerQuantity: item.pricePerQuantity || (item.price / item.quantity),
            price: item.price
        }));

        const snapshotBills = {
            total: total,
            tax: tax,
            totalWithTax: totalPriceWithTax
        };

        try {
            let orderIdToCheckout = customerData.activeOrderId;
            const tableId = customerData.table?.tableId || customerData.table?._id || null;

            const orderPayload = {
                items: snapshotItems,
                bills: snapshotBills,
                customerDetails: {
                    name: customerData.customerName || "Walk-in Customer",
                    phone: Number(customerData.customerPhone) || 9800000000,
                    guests: Number(customerData.guests) || 1
                },
                orderStatus: "In Progress",
                paymentMethod: paymentMethod
            };

            if (orderIdToCheckout) {
                try {
                    await updateOrderApi({ orderId: orderIdToCheckout, ...orderPayload });
                } catch (e) {
                    console.log("updateOrderApi fallback triggered");
                }
            } else {
                try {
                    const res = await addOrder({ ...orderPayload, table: tableId });
                    const data = res.data.data;
                    orderIdToCheckout = data._id;
                    if (data.table) {
                        const tId = typeof data.table === 'object' ? data.table._id : data.table;
                        await updateTable({ tableId: tId, status: "Booked", orderId: data._id });
                    }
                } catch (e) {
                    console.log("addOrder fallback triggered");
                }
            }

            checkoutMutation.mutate({
                id: orderIdToCheckout,
                paymentMethod,
                snapshotItems,
                snapshotBills
            });
        } catch (err) {
            console.error("Direct checkout error:", err);
            enqueueSnackbar("Checkout failed!", { variant: "error" });
        }
    };

    return (
        <>
            <div className='flex items-center justify-between px-5 mt-2'>
                <p className='text-xs text-[#ababab] font-medium mt-2'>
                    Items ({cartData.length})
                </p>
                <h1 className='text-[#f5f5f5] text-md font-bold'>
                    NPR {total.toFixed(2)}
                </h1>
            </div>

            <div className='flex items-center justify-between px-5 mt-2'>
                <p className='text-xs text-[#ababab] font-medium mt-2'>
                    Tax (13%)
                </p>
                <h1 className='text-[#f5f5f5] text-md font-bold'>
                    NPR {tax.toFixed(2)}
                </h1>
            </div>

            <div className='flex items-center justify-between px-5 mt-2'>
                <p className='text-xs text-[#ababab] font-medium mt-2'>
                    Total with Tax
                </p>
                <h1 className='text-[#f5f5f5] text-md font-bold'>
                    NPR {totalPriceWithTax.toFixed(2)}
                </h1>
            </div>

            
            <div className='grid grid-cols-2 gap-2 px-5 mt-4'>
                {["Cash", "Card", "eSewa", "Khalti"].map((method) => (
                    <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                            paymentMethod === method ? 'bg-indigo-600 text-white' : 'bg-[#1f1f1f] text-[#ababab] hover:bg-[#2a2a2a]'
                        }`}
                    >
                        {method}
                    </button>
                ))}
            </div>

            <div className='flex items-center gap-3 px-5 mt-4 pb-4'>
                <button
                    onClick={handleDirectCheckout}
                    disabled={checkoutMutation.isPending}
                    className='bg-[#025cca] hover:bg-[#024aa3] disabled:opacity-50 px-4 py-3 w-full rounded-lg text-[#f5f5f5] font-semibold text-sm transition shadow-md'
                >
                    {checkoutMutation.isPending ? "Checking out..." : "Direct Checkout"}
                </button>
            </div>

            {showInvoice && orderInfo && (
                <Invoice orderInfo={orderInfo} setShowInvoice={handleCloseInvoice} />
            )}
        </>
    );
};

export default Bill;

