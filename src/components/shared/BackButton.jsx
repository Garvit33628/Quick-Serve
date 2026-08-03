import React from 'react';
import { IoArrowBackOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ onClick }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate(-1);
        }
    };

    return (
        <button onClick={handleClick} className='bg-[#025cca] p-3 text-xl font-bold rounded-full text-white cursor-pointer hover:bg-[#024aa3] transition'>
            <IoArrowBackOutline />
        </button>
    );
};

export default BackButton;
