import { useMutation } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import React, { useState } from 'react';
import { register } from '../../https';

const Register = ({ setIsRegister }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "Staff",
    });

    const handleRoleSelection = (selectedRole) => {
        setFormData({ ...formData, role: selectedRole });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.role) {
            enqueueSnackbar("Please select a role!", { variant: "warning" });
            return;
        }
        if (formData.phone.length !== 10) {
            enqueueSnackbar("Phone number must be exactly 10 digits!", { variant: "warning" });
            return;
        }
        registerMutation.mutate({
            ...formData,
            phone: Number(formData.phone)
        });
    };

    const registerMutation = useMutation({
        mutationFn: (reqData) => register(reqData),
        onSuccess: (res) => {
            const { data } = res;
            enqueueSnackbar(data.message || "Registered successfully!", { variant: "success" });
            setFormData({
                name: "",
                email: "",
                phone: "",
                password: "",
                role: "Staff",
            });

            setTimeout(() => {
                if (typeof setIsRegister === 'function') {
                    setIsRegister(false);
                }
            }, 1500);
        },
        onError: (error) => {
            const message = error?.response?.data?.message || "Registration failed!";
            enqueueSnackbar(message, { variant: "error" });
        },
    });

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label className='block text-[#ababab] mb-2 text-sm font-medium'>
                        Employee Name
                    </label>
                    <div className='flex items-center rounded-lg p-5 px-4 bg-[#1f1f1f]'>
                        <input
                            type='text'
                            name='name'
                            value={formData.name}
                            onChange={handleChange}
                            placeholder='Enter Employee Name'
                            className='bg-transparent flex-1 text-white focus:outline-none'
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className='block text-[#ababab] mb-2 mt-3 text-sm font-medium'>
                        Employee Email
                    </label>
                    <div className='flex items-center rounded-lg p-5 px-4 bg-[#1f1f1f]'>
                        <input
                            type='email'
                            name='email'
                            value={formData.email}
                            onChange={handleChange}
                            placeholder='Enter Employee Email'
                            className='bg-transparent flex-1 text-white focus:outline-none'
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className='block text-[#ababab] mb-2 mt-3 text-sm font-medium'>
                        Employee Phone (10 Digits)
                    </label>
                    <div className='flex items-center rounded-lg p-5 px-4 bg-[#1f1f1f]'>
                        <input
                            type='number'
                            name='phone'
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder='Enter 10 digit Phone Number'
                            className='bg-transparent flex-1 text-white focus:outline-none'
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className='block text-[#ababab] mb-2 mt-3 text-sm font-medium'>
                        Password (Min 6 Characters)
                    </label>
                    <div className='flex items-center rounded-lg p-5 px-4 bg-[#1f1f1f]'>
                        <input
                            type='password'
                            name='password'
                            value={formData.password}
                            onChange={handleChange}
                            placeholder='Enter Password'
                            className='bg-transparent flex-1 text-white focus:outline-none'
                            minLength={6}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className='block text-[#ababab] mb-2 mt-3 text-sm font-medium'>
                        Choose your role
                    </label>

                    <div className="flex items-center gap-3 mt-4">
                        {['Staff', 'Admin'].map((role) => (
                            <button
                                key={role}
                                type='button'
                                onClick={() => handleRoleSelection(role)}
                                className={`px-4 py-3 w-full rounded-lg text-white font-semibold transition ${
                                    formData.role === role ? "bg-indigo-700" : "bg-[#1f1f1f] hover:bg-[#2a2a2a]"
                                }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    type='submit'
                    disabled={registerMutation.isPending}
                    className='w-full mt-6 py-3 rounded-lg text-lg bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-500 transition disabled:opacity-50'
                >
                    {registerMutation.isPending ? "Signing Up..." : "Sign Up"}
                </button>
            </form>
        </div>
    );
};

export default Register;
