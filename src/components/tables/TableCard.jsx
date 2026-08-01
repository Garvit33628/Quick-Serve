import React from 'react'
import { getRandomBG } from '../../utils'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { updateTable } from '../../redux/slices/customerSlice'


const TableCard = ({ tableId, name, status, initials}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleClick = () => {
    if(status === "Booked") return;
    dispatch(updateTable({tableNo: name }))
    navigate(`/menu`);
  };
  
  return (
    <div onClick={handleClick} className='w-[300px] bg-[#262626] p-5 rounded-lg 
    cursor-pointer'>
        <div className='flex items-center justify-between px-1'>
      <h1 className='text-[#f5f5f5] text-xl font-semibold'>   {name} </h1>
      <p className={`${status === "Booked" ? 'text-green-600 bg-[#2e4a40]'
      : "text-[#f6b100] bg-yellow-100"} px-2 py-1 rounded-lg`}> 
         {status}
      </p>
      </div>
      <div className='flex items-center justify-center mt-5 mb-10'>
        <h1 style={{ backgroundColor: getRandomBG(tableId) }} 
        className='text-white rounded-full p-5 text-xl'>
             {initials} </h1>
      </div>
    </div>
  )
}

export default TableCard
