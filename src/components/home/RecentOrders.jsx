import React from 'react'
import { FaSearch } from 'react-icons/fa';
import OrderList from './OrderList';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getOrders } from '../../https';
import { enqueueSnackbar } from 'notistack';
import OrderCard from '../orders/OrderCard';

const RecentOrders = () => {

  const { data: resData, isError } = useQuery({
    queryKey: [ "orders"],
    queryFn: async () => {
      return await getOrders();
    },
    placeholderData: keepPreviousData
  })

    if(isError){
      enqueueSnackbar("Something went wrong!", {variant:"error"})
    }
  return (
    <div className='px-8 mt-6'>
      <div className='bg-[#1a1a1a] w-full h-[450px] rounded-lg'>
        <div className='flex justify-between items-center px-6 py-4'>
            <h1 className='text-[#f5f5f5] tracking-wide text-lg font-semibold'> Recent Orders </h1>
            <a href="" className='text-[#025cca] text-sm font-semibold'> View All </a>
        </div>

        {/* SEARCH */}

         <div className="flex items-center gap-4 bg-[#1f1f1f] p-2 rounded-[15px] px-6
            py-4 mx-6">
                <FaSearch className='text-[#f5f5f5]' />
                <input type='text'
                placeholder='Search'
                className='bg-[#1f1f1f] outline-none text-[#f5f5f5]' />
            </div>

            {/* ORDER LIST */}
            <div className="mt-4 px-6 overflow-y-scroll space-y-2  h-[300px] scrollbar-none">
              
               {
                resData?.data.data.length > 0 ? (
                  resData.data.data.map((order) => {
                    return < OrderCard key={order._id} order={order}/>
                  })
                ) : <p className='col-span-3 text-gray-500'> No Orders Available </p>
               }
            </div>
      </div>
    </div>
  )
}

export default RecentOrders
