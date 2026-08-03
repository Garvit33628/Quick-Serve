import React, { useState } from 'react';
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useDispatch } from "react-redux";
import { setUser } from '../../redux/slices/userSlice';
import { useNavigate } from "react-router-dom";
import { login } from '../../https';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        loginMutation.mutate(formData);
    };

    const loginMutation = useMutation({
        mutationFn: (reqData) => login(reqData),
        onSuccess: (res) => {
            const { data } = res;
            if (data && data.data) {
                const { _id, name, email, phone, isAdmin, role } = data.data;
                const userRole = role || (isAdmin ? "Admin" : "Staff");
                dispatch(setUser({ _id, name, email, phone, role: userRole, isAdmin }));
                enqueueSnackbar(data.message || "Logged in successfully!", { variant: "success" });
                navigate("/");
            }
        },
        onError: (error) => {
            const message = error?.response?.data?.message || "Login failed!";
            enqueueSnackbar(message, { variant: "error" });
        }
    });

    return (
        <div>
            <form onSubmit={handleSubmit}>
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
                        Password
                    </label>
                    <div className='flex items-center rounded-lg p-5 px-4 bg-[#1f1f1f]'>
                        <input
                            type='password'
                            name='password'
                            value={formData.password}
                            onChange={handleChange}
                            placeholder='Enter Password'
                            className='bg-transparent flex-1 text-white focus:outline-none'
                            required
                        />
                    </div>
                </div>

                <button
                    type='submit'
                    disabled={loginMutation.isPending}
                    className='w-full mt-6 py-3 rounded-lg text-lg bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-500 transition disabled:opacity-50'
                >
                    {loginMutation.isPending ? "Signing In..." : "Sign In"}
                </button>
            </form>
        </div>
    );
};

export default Login;
