import React from 'react';
import { FaSearch, FaUserCircle, FaBell } from 'react-icons/fa';
import { IoLogOutOutline } from "react-icons/io5";
import { MdDashboard } from 'react-icons/md';
import logo from '../../assets/images/logo.png';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { removeUser } from '../../redux/slices/userSlice';
import { logout } from '../../https';
import { enqueueSnackbar } from 'notistack';

const Header = () => {
    const userData = useSelector(state => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logoutMutation = useMutation({
        mutationFn: () => logout(),
        onSuccess: (data) => {
            dispatch(removeUser());
            enqueueSnackbar("Logged out successfully!", { variant: "success" });
            navigate("/auth");
        },
        onError: (error) => {
            dispatch(removeUser());
            navigate("/auth");
        }
    });

    const handleLogout = () => {
        logoutMutation.mutate();
    };

    return (
        <header className='flex justify-between items-center py-4 px-8 bg-[#1a1a1a]'>
            
            <div onClick={() => navigate("/")} className='flex items-center gap-2 cursor-pointer'>
                <img src={logo} className='h-8 w-8' alt="Quick Serve Logo" />
                <h1 className='text-lg font-semibold text-[#f5f5f5]'> Quick - Serve </h1>
            </div>

            
            <div className="flex items-center gap-4 bg-[#1f1f1f] p-2 rounded-[20px] px-5 py-2 w-[500px]">
                <FaSearch className='text-[#f5f5f5]' />
                <input
                    type='text'
                    placeholder='Search'
                    className='bg-[#1f1f1f] outline-none text-[#f5f5f5] w-full'
                />
            </div>

           
            <div className='flex items-center gap-4'>
                { (userData.role === "Admin" || userData.isAdmin) && (
                    <div
                        onClick={() => navigate("/dashboard")}
                        title="Dashboard"
                        className='bg-[#1f1f1f] hover:bg-[#2a2a2a] rounded-[15px] p-3 cursor-pointer transition'
                    >
                        <MdDashboard className='text-[#f5f5f5] text-2xl' />
                    </div>
                )}

                <div className='bg-[#1f1f1f] hover:bg-[#2a2a2a] rounded-[15px] p-3 cursor-pointer transition'>
                    <FaBell className='text-[#f5f5f5] text-2xl' />
                </div>
                <div className='flex items-center gap-3'>
                    <FaUserCircle className='text-[#f5f5f5] text-4xl' />
                    <div className='flex flex-col items-start'>
                        <h1 className='text-md text-[#f5f5f5] font-semibold'>
                            {userData.name || "Employee"}
                        </h1>
                        <p className='text-xs text-[#ababab] font-medium'>
                            {userData.role || (userData.isAdmin ? "Admin" : "Staff")}
                        </p>
                    </div>
                    <IoLogOutOutline
                        onClick={handleLogout}
                        title="Logout"
                        className='text-[#f5f5f5] hover:text-red-400 ml-2 cursor-pointer transition'
                        size={32}
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;
