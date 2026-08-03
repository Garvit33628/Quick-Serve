import React, { useState } from 'react';
import { FaHome } from 'react-icons/fa';
import { MdOutlineReorder, MdTableBar } from 'react-icons/md';
import { CiCircleMore } from 'react-icons/ci';
import { BiSolidDish } from 'react-icons/bi';
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import Modal from './Modal';
import { setCustomer } from '../../redux/slices/customerSlice';
import { removeAllItems } from '../../redux/slices/cartSlice';
import { enqueueSnackbar } from 'notistack';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [guestCount, setGuestCount] = useState(1);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleCreateOrder = () => {
        if (!name.trim()) {
            enqueueSnackbar("Please enter customer name!", { variant: "warning" });
            return;
        }
        if (!phone || phone.toString().length !== 10) {
            enqueueSnackbar("Please enter a valid 10-digit phone number!", { variant: "warning" });
            return;
        }
        if (guestCount <= 0) {
            enqueueSnackbar("Guest count must be at least 1!", { variant: "warning" });
            return;
        }

        dispatch(setCustomer({ name: name.trim(), phone: Number(phone), guests: guestCount }));
        dispatch(removeAllItems());
        closeModal();
        navigate('/tables');
    };

    const increment = () => {
        if (guestCount >= 20) return;
        setGuestCount((prev) => prev + 1);
    };

    const decrement = () => {
        if (guestCount <= 1) return;
        setGuestCount((prev) => prev - 1);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className='fixed bottom-0 left-0 right-0 bg-[#262626] p-2 h-16 flex justify-around items-center z-40 shadow-lg'>
            <button
                onClick={() => navigate("/home")}
                className={`flex items-center justify-center font-bold ${
                    isActive("/home") || isActive("/") ? 'text-[#f5f5f5] bg-[#343434]' : 'text-[#ababab]'
                } w-[200px] md:w-[300px] py-2 rounded-[20px] transition`}
            >
                <FaHome className='inline mr-2' size={20} /> <p> Home </p>
            </button>

            <button
                onClick={() => navigate("/orders")}
                className={`flex items-center justify-center font-bold ${
                    isActive("/orders") ? 'text-[#f5f5f5] bg-[#343434]' : 'text-[#ababab]'
                } w-[200px] md:w-[300px] py-2 rounded-[20px] transition`}
            >
                <MdOutlineReorder className='inline mr-2' size={20} /> <p> Orders </p>
            </button>

            <button
                onClick={() => navigate("/tables")}
                className={`flex items-center justify-center font-bold ${
                    isActive("/tables") ? 'text-[#f5f5f5] bg-[#343434]' : 'text-[#ababab]'
                } w-[200px] md:w-[300px] py-2 rounded-[20px] transition`}
            >
                <MdTableBar className='inline mr-2' size={20} /> <p> Tables </p>
            </button>

            <button
                onClick={() => navigate("/dashboard")}
                className={`flex items-center justify-center font-bold ${
                    isActive("/dashboard") ? 'text-[#f5f5f5] bg-[#343434]' : 'text-[#ababab]'
                } w-[200px] md:w-[300px] py-2 rounded-[20px] transition`}
            >
                <CiCircleMore className='inline mr-2' size={20} /> <p> Dashboard </p>
            </button>

            <button
                disabled={isActive('/menu')}
                onClick={() => navigate('/tables')}
                title="Create Order"
                className='absolute -top-5 left-1/2 -translate-x-1/2 flex items-center justify-center p-3 rounded-full bg-[#f6b100] hover:bg-yellow-500 text-gray-900 shadow-xl transition border-4 border-[#1f1f1f]'
            >
                <BiSolidDish size={32} />
            </button>
        </div>
    );
};

export default BottomNav;
