import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTotalPrice, removeAllItems } from '../../redux/slices/cartSlice';
import { enqueueSnackbar } from "notistack";
import { useMutation } from '@tanstack/react-query';
import { addOrder, updateTable, checkoutOrder } from '../../https';
import { removeCustomer, setOrder } from '../../redux/slices/customerSlice';
import Invoice from '../invoice/invoice';

const Bill = () => {
    const dispatch = useDispatch();
    const customerData = useSelector((state) => state.customer);
    const cartData = useSelector((state) => state.cart);
    const total = useSelector(getTotalPrice);
    const taxRate = 13;
    const tax = (total * taxRate) / 100;
    const totalPriceWithTax = total + tax;

    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [showInvoice, setShowInvoice] = useState(false);
    const [orderInfo, setOrderInfo] = useState(null);

  
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
        onSuccess: (resData) => {
            const data = resData.data.data;
            setOrderInfo(data);
            setShowInvoice(true);
            enqueueSnackbar("Checkout completed successfully!", { variant: "success" });
            dispatch(removeCustomer());
            dispatch(removeAllItems());
        },
        onError: (error) => {
            const message = error?.response?.data?.message || "Failed to checkout order!";
            enqueueSnackbar(message, { variant: "error" });
        }
    });

    const handlePlaceOrder = async () => {
        if (!paymentMethod) {
            enqueueSnackbar("Please select a payment method!", { variant: "warning" });
            return;
        }
        if (cartData.length === 0) {
            enqueueSnackbar("Your cart is empty!", { variant: "warning" });
            return;
        }
        if (!customerData.customerName) {
            enqueueSnackbar("Please enter customer information first!", { variant: "warning" });
            return;
        }

        const tableId = customerData.table?.tableId || customerData.table?._id || null;

        const orderData = {
            customerDetails: {
                name: customerData.customerName,
                phone: Number(customerData.customerPhone) || 9800000000,
                guests: Number(customerData.guests) || 1
            },
            orderStatus: "In Progress",
            bills: {
                total: total,
                tax: tax,
                totalWithTax: totalPriceWithTax
            },
            items: cartData,
            table: tableId,
            paymentMethod: paymentMethod
        };

        orderMutation.mutate(orderData);
    };

    const handleDirectCheckout = () => {
        if (!paymentMethod) {
            enqueueSnackbar("Please select a payment method!", { variant: "warning" });
            return;
        }
        if (cartData.length === 0 && !customerData.activeOrderId) {
            enqueueSnackbar("Your cart is empty!", { variant: "warning" });
            return;
        }

     
        if (customerData.activeOrderId) {
            checkoutMutation.mutate({ id: customerData.activeOrderId, paymentMethod });
        } else {
           
            const tableId = customerData.table?.tableId || customerData.table?._id || null;
            const orderData = {
                customerDetails: {
                    name: customerData.customerName || "Walk-in Customer",
                    phone: Number(customerData.customerPhone) || 9800000000,
                    guests: Number(customerData.guests) || 1
                },
                orderStatus: "In Progress",
                bills: {
                    total: total,
                    tax: tax,
                    totalWithTax: totalPriceWithTax
                },
                items: cartData,
                table: tableId,
                paymentMethod: paymentMethod
            };

            addOrder(orderData)
                .then((res) => {
                    const data = res.data.data;
                    if (data.table) {
                        const tId = typeof data.table === 'object' ? data.table._id : data.table;
                        updateTable({ tableId: tId, status: "Booked", orderId: data._id });
                    }
                    checkoutMutation.mutate({ id: data._id, paymentMethod });
                })
                .catch((err) => {
                    enqueueSnackbar("Checkout failed to save order!", { variant: "error" });
                });
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
                    disabled={checkoutMutation.isPending || orderMutation.isPending}
                    className='bg-[#025cca] hover:bg-[#024aa3] disabled:opacity-50 px-4 py-3 w-full rounded-lg text-[#f5f5f5] font-semibold text-sm transition'
                >
                    {checkoutMutation.isPending ? "Checking out..." : "Direct Checkout"}
                </button>

                <button
                    onClick={handlePlaceOrder}
                    disabled={orderMutation.isPending || checkoutMutation.isPending}
                    className='bg-[#f6b100] hover:bg-[#d99c00] disabled:opacity-50 px-4 py-3 w-full rounded-lg text-[#1f1f1f] font-semibold text-sm transition'
                >
                    {orderMutation.isPending ? "Saving..." : (customerData.activeOrderId ? "Update Order" : "Place Order")}
                </button>
            </div>

            {showInvoice && orderInfo && (
                <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
            )}
        </>
    );
};

export default Bill;

