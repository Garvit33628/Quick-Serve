import React, { useEffect, useRef } from 'react';
import { RiDeleteBin2Fill } from 'react-icons/ri';
import { FaPlus, FaMinus, FaTrashAlt } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { removeItem, removeAllItems, updateItemQuantity, getTotalPrice } from '../../redux/slices/cartSlice';

const CartInfo = () => {
  const cartData = useSelector(state => state.cart);
  const total = useSelector(getTotalPrice);
  const scrollRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [cartData]);

  const handleRemove = (itemId) => {
    dispatch(removeItem(itemId));
  };

  const handleQuantityChange = (itemId, delta) => {
    dispatch(updateItemQuantity({ id: itemId, delta }));
  };

  const handleClearCart = () => {
    dispatch(removeAllItems());
  };

  return (
    <div className='px-4 py-2'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-3 text-[#ababab]'>
          <button 
            onClick={handleClearCart} 
            title="Clear Cart" 
            className='hover:text-red-400 p-1.5 rounded-md hover:bg-[#262626] transition'
          >
            <FaTrashAlt size={16} />
          </button>
        </div>
        <h1 className='text-[#f5f5f5] font-bold text-md tracking-wider'>
          NPR {total.toFixed(2)}
        </h1>
      </div>

      <h1 className='text-lg text-[#e4e4e4] font-semibold tracking-wide border-t border-[#2a2a2a] pt-2'> 
        Order Details 
      </h1>
      
      <div className='mt-3 overflow-y-scroll scrollbar-none max-h-[340px]' ref={scrollRef}>
        {cartData.length === 0 ? ( 
          <p className='text-[#ababab] text-sm flex justify-center items-center h-[200px]'> 
            Your cart is empty. Start adding items! 
          </p>
        ) : (
          cartData.map((item) => {
            const itemId = item.id || item._id;
            return (
              <div key={itemId} className='bg-[#1f1f1f] rounded-lg px-4 py-3 mb-2'>
                <div className='flex items-center justify-between'>
                  <h1 className='text-[#ababab] font-semibold tracking-wide text-md truncate max-w-[200px]'>
                    {item.name}
                  </h1>
                  <p className='text-[#ababab] font-semibold text-sm bg-[#2a2a2a] px-2 py-0.5 rounded'>
                    {item.quantity}
                  </p>
                </div>

                <div className='flex items-center justify-between mt-3'>
                  <div className='flex items-center gap-2'> 
                    <RiDeleteBin2Fill 
                      onClick={() => handleRemove(itemId)} 
                      className='text-[#ababab] hover:text-red-400 cursor-pointer transition' 
                      size={18} 
                      title="Remove Item"
                    />
                    <div className='flex items-center bg-[#2a2a2a] rounded px-1 ml-1 gap-2'>
                      <button 
                        onClick={() => handleQuantityChange(itemId, -1)}
                        className='text-yellow-500 hover:text-yellow-400 text-sm px-1 font-bold'
                      >
                        <FaMinus size={10} />
                      </button>
                      <button 
                        onClick={() => handleQuantityChange(itemId, 1)}
                        className='text-yellow-500 hover:text-yellow-400 text-sm px-1 font-bold'
                      >
                        <FaPlus size={10} />
                      </button>
                    </div>
                  </div>
                  <p className='text-[#f5f5f5] text-md font-bold'> 
                    NPR {(item.price || (item.pricePerQuantity * item.quantity)).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CartInfo;

