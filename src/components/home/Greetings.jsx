import React from 'react';
import { useSelector } from 'react-redux';

const Greetings = () => {
    const userData = useSelector(state => state.user);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <div className='flex justify-between items-center px-8 mt-5'>
            <div>
                <h1 className='text-[#f5f5f5] text-2xl font-semibold tracking-wide'>
                    {getGreeting()}, {userData.name || "User"}
                </h1>
                <p className='text-[#ababab] text-sm'> Give your best services for customers! </p>
            </div>
        </div>
    );
};

export default Greetings;
