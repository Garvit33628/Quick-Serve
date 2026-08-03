import React from 'react';
import BottomNav from '../components/shared/BottomNav';
import BackButton from '../components/shared/BackButton';
import { MdRestaurantMenu as MdMenuIcon } from 'react-icons/md';
import MenuContainer from '../components/menu/MenuContainer';
import CustomerInfo from '../components/menu/CustomerInfo';
import CartInfo from '../components/menu/CartInfo';
import Bill from '../components/menu/Bill';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { updateTable } from '../https';
import { removeCustomer } from '../redux/slices/customerSlice';
import { removeAllItems } from '../redux/slices/cartSlice';

const Menu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const customerData = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);

  const handleBack = async () => {
    const tableId = customerData?.table?.tableId || customerData?.table?._id;
    if ((!cartData || cartData.length === 0) && tableId) {
      try {
        await updateTable({ tableId, status: "Available", orderId: null });
      } catch (err) {
        console.error("Failed to release empty table:", err);
      }
      dispatch(removeCustomer());
      dispatch(removeAllItems({ tableId }));
    }
    queryClient.invalidateQueries(['tables']);
    navigate(-1);
  };

  return (
    <section className='bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex gap-3'>
      <div className='flex-[3]'>
        <div className='flex items-center justify-between px-10 py-4'>
          <div className='flex items-center gap-4'>
            <BackButton onClick={handleBack} />
            <h1 className='text-[#f5f5f5] text-2xl font-bold tracking-wider'>
              Menu
            </h1>
          </div>
          <div className='flex items-center justify-around gap-4'>
            <div className='flex items-center gap-3 cursor-pointer'>
              <MdMenuIcon className='text-[#f5f5f5] text-4xl' />
              <div className='flex flex-col items-start'>
                <h1 className='text-md text-[#f5f5f5] font-semibold tracking-wide'>
                  {customerData.customerName || "Customer"}
                </h1>
                <p className='text-xs text-[#ababab] font-medium'>
                  Table {customerData?.table?.tableNo || customerData?.table?.name || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
        <MenuContainer />
      </div>

      <div className="flex-[1] bg-[#1a1a1a] mt-4 mr-3 h-[calc(100vh-7rem)] rounded-lg pt-2 overflow-y-auto">
        <CustomerInfo />
        <hr className="border-[#2a2a2a] border-t-2" />
        <CartInfo />
        <hr className="border-[#2a2a2a] border-t-2" />
        <Bill />
      </div>

      <BottomNav />
    </section>
  );
};

export default Menu
