import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getTotalPrice, removeAllItems } from '../../redux/slices/cartSlice'
import { enqueueSnackbar } from "notistack"
import { useMutation } from '@tanstack/react-query'
import { addOrder, updateTable } from '../../https'
import { removeCustomer } from '../../redux/slices/customerSlice'





// category (bgcolor, icon,name )
// menu ()

const Bill = () => {
  const dispatch = useDispatch();
  const customerData = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);
  const taxRate = 13;
  const tax = (total * taxRate) / 100;
  const totalPriceWithTax = total + tax;

  const [paymentMethod, setPaymentMethod] = useState();
  const handlePlaceOrder = async () => {
    if(!paymentMethod){
      enqueueSnackbar("Please select a payment method!", {variant: "warning"});

      return;

      const orderData = {
        customerDetails: {
          name: customerData.customerName,
          phone: customerData.customerPhone,
          guests: customerData.guests
        },
        orderStatus: "In Progress",
        bills: {
          total: total,
          tax: tax,
          totalWithTax: totalPriceWithTax
        },
        items: cartData,
        table: customerData.table.tableId,
      }
    }
  };

    setTimeout(() => {
      orderMutation.mutate(orderData);
    }, 1500)

  const orderMutation = useMutation({
    mutationFn: (reqData) => addOrder(reqData),
    onSuccess: (resData) => {
      const { data } = resData.data;
      console.log(data);

      // Update Table
      const tableData = {
        status: "Booked",
        orderId: data._id,
      tableId: data.table    
      }

      setTimeout(() => {
        tableUpdateMutation.mutate(tableData);
      }, 1500);

      enqueueSnackbar("Order Placed!", {
        variant: "success",
      });
    },
    onError: (error) => {
      console.log(error);
    }
  });

    const tableUpdateMutation = useMutation({
      mutationFn: (reqData) => updateTable(reqData),
      onSuccess: (resData) => {

          console.log(resData);
          dispatch(removeCustomer());
          dispatch(removeAllItems());
      },
       onError: (error) => {
      console.log(error);
    }
   
    })

  return (
    <>
    <div className='flex items-center justify-between px-5 mt-2'>
    <p className='text-xs text-[#ababab] font-medium mt-2'> 
        Items({cartData.length})
    </p>
    <h1 className='text-[#f5f5f5] text-md font-bold'>
    NPR {total.toFixed(2)}
    </h1>
    </div>

    <div className='flex items-center justify-between px-5 mt-2'>
    <p className='text-xs text-[#ababab] font-medium mt-2'> 
        Tax(13%)
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

    <div className='flex items-center gap-3 px-5 mt-4'>
    <button onClick={() => setPaymentMethod('Cash')} className={`bg-[#1f1f1f] px-4 py-3 w-full rounded-lg text-[#ababab]
    font-semibold ${paymentMethod === "Cash" ? 'bg-[#383737]' : ''}`}> Cash </button>
     <button onClick={() => setPaymentMethod('Online')} className={`bg-[#1f1f1f] px-4 py-3 w-full rounded-lg text-[#ababab]
    font-semibold ${paymentMethod === "Online" ? 'bg-[#383737]' : ''}`}> Online </button>
    </div>

    <div className='flex items-center gap-3 px-5 mt-4'>
    <button className='bg-[#025cca] px-4 py-3 w-full rounded-lg text-[#f5f5f5]
    font-semibold text-lg'> 
    Print Receipt
    </button>

    <button onClick={handlePlaceOrder} className='bg-[#f6b100] px-4 py-3 w-full rounded-lg text-[#1f1f1f]
    font-semibold text-lg'> 
    Place Order
    </button>
    </div>
    </>
  )
}

export default Bill
