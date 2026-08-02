import React from 'react'
import { FaCheckDouble, FaCircle } from 'react-icons/fa'
import { getAvatarName } from '../../utils';

const OrderCard = ({ key, order}) => {
  console.log(order);
  return (
     <div className='w-[500px] bg-[#262626] p-4 rounded-lg mb-4'>
      <div className='flex items-center gap-5'>
        <button className='bg-[#f6b100] p-3 text-xl font-bold rounded-lg'> {getAvatarName(order.customerDetails.name)} </button>
      <div className='flex items-center justify-between w-[100%]'>
        <div className='items-start flex flex-col gap-1'> 
          <h1 className='text-[#f5f5f5] text-lg font-semibold tracking-wide'> {order.customerDetails.name} </h1>
          <p className='text-[#ababab] text-sm'> 8 Items </p>
        </div>
        {/* <div>
          <h1 className='text-[#f6b100] font-semibold border border-[#f6b100] rounded-lg p-1'> Table No: 3</h1>
        </div> */}
        <div className='flex flex-col items-end gap-2'> 
          {
            order.orderStatus === "Ready" ? (
              <>
              <p className='text-green-600 px-2 py-1 bg-[#2e4a40] rounded-lg'> <FaCheckDouble 
          className='inline mr-2' />
             {order.orderStatus} </p>
          <p className='text-[#ababab] text-sm'><FaCircle className='inline
          mr-2 text-green-600'/> 
          Ready To Serve </p>
          </>
            ) : ( 
              <>
              <p className='text-yellow-600 px-2 py-1 bg-[#4a452e] rounded-lg'> <FaCheckDouble 
          className='inline mr-2' />
             {order.orderStatus} </p>
          <p className='text-[#ababab] text-sm'><FaCircle className='inline
          mr-2 text-yellow-600'/> 
          Preparing your order </p>
          </>
            )
          }
        </div>
      </div>
      </div>
      <div className='flex justify-between items-center mt-4 text-[#ababab]'>
        <p> {order.createdAt} </p>
        <p> {order.items.length} Items </p>
      </div>
      <hr className='w-full mt-4 border-t-1 border-gray-500'/>
      <div className="flex items-center justify-between mt-4">
        <h1 className='text-[#f5f5f5] text-xl font-semibold'> Total </h1>
        <p className='text-[#f5f5f5] text-lg font-semibold'>NPR {order.bills.totalWithTax} </p>
      </div>
    </div>
  )
}

export default OrderCard
