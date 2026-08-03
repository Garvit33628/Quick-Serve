import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllUsers, setUserRoleApi, deleteUserApi } from '../../https';
import { enqueueSnackbar } from 'notistack';
import { useSelector } from 'react-redux';
import { FaUserShield, FaUserTie, FaTrash, FaShieldAlt } from 'react-icons/fa';
import { getAvatarName } from '../../utils';

const StaffManagement = () => {
    const queryClient = useQueryClient();
    const currentUser = useSelector((state) => state.user);

    const { data: usersRes, isLoading, isError } = useQuery({
        queryKey: ['users'],
        queryFn: getAllUsers,
    });

    const roleMutation = useMutation({
        mutationFn: ({ id, role }) => setUserRoleApi({ id, role }),
        onSuccess: (resData) => {
            enqueueSnackbar(resData?.data?.message || "User role updated successfully!", { variant: "success" });
            queryClient.invalidateQueries(['users']);
        },
        onError: (error) => {
            const message = error?.response?.data?.message || "Failed to update user role!";
            enqueueSnackbar(message, { variant: "error" });
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: (id) => deleteUserApi(id),
        onSuccess: (resData) => {
            enqueueSnackbar(resData?.data?.message || "User deleted successfully!", { variant: "success" });
            queryClient.invalidateQueries(['users']);
        },
        onError: (error) => {
            const message = error?.response?.data?.message || "Failed to delete user!";
            enqueueSnackbar(message, { variant: "error" });
        }
    });

    const handleRoleChange = (userId, newRole) => {
        roleMutation.mutate({ id: userId, role: newRole });
    };

    const handleDeleteUser = (userId, userName) => {
        if (window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
            deleteUserMutation.mutate(userId);
        }
    };

    const usersList = usersRes?.data?.data || [];

    return (
        <div className="bg-[#262626] border border-[#333333] rounded-2xl p-6 shadow-xl mb-8">
            <div className="flex items-center justify-between border-b border-[#333] pb-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#f6b100]/10 text-[#f6b100] rounded-xl border border-[#f6b100]/20">
                        <FaShieldAlt size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-wide">Staff & Role Management</h3>
                        <p className="text-xs text-gray-400">Promote staff members to Admin or switch roles (Default: Staff)</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-[#1f1f1f] px-4 py-2 rounded-xl border border-[#333]">
                    <span className="text-xs font-semibold text-gray-400">Total Staff & Admins:</span>
                    <span className="text-sm font-black text-[#f6b100]">{usersList.length} Users</span>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-16 text-gray-400">Loading user accounts...</div>
            ) : isError ? (
                <div className="text-center py-16 text-red-400">Failed to load user accounts! Please check admin permissions.</div>
            ) : usersList.length === 0 ? (
                <div className="text-center py-16 text-gray-500">No user accounts found</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {usersList.map((user) => {
                        const isCurrent = user._id === currentUser._id;
                        const userRoleLabel = user.isAdmin ? "Admin" : "Staff";

                        return (
                            <div
                                key={user._id}
                                className={`bg-[#1f1f1f] border p-5 rounded-2xl flex items-center justify-between gap-4 transition-all hover:border-gray-700 ${
                                    user.isAdmin ? "border-[#f6b100]/30 shadow-lg" : "border-[#333]"
                                }`}
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                                        user.isAdmin ? "bg-[#f6b100] text-gray-900" : "bg-[#025cca] text-white"
                                    }`}>
                                        {getAvatarName(user.name)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-white text-base">{user.name}</h4>
                                            {isCurrent && (
                                                <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full font-semibold">
                                                    (You)
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400">{user.email}</p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">Phone: {user.phone || "N/A"}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                        user.isAdmin
                                            ? "bg-[#f6b100]/20 text-[#f6b100] border border-[#f6b100]/30"
                                            : "bg-blue-950/80 text-blue-400 border border-blue-500/30"
                                    }`}>
                                        {user.isAdmin ? <FaUserShield size={12} /> : <FaUserTie size={12} />}
                                        {userRoleLabel}
                                    </span>

                                    {!isCurrent && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <select
                                                value={user.isAdmin ? "Admin" : "Staff"}
                                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                disabled={roleMutation.isPending}
                                                className="bg-[#262626] border border-[#3a3a3a] text-white text-xs font-semibold px-3 py-1.5 rounded-lg focus:outline-none focus:border-[#f6b100] cursor-pointer"
                                            >
                                                <option value="Staff">Staff</option>
                                                <option value="Admin">Admin</option>
                                            </select>

                                            <button
                                                onClick={() => handleDeleteUser(user._id, user.name)}
                                                disabled={deleteUserMutation.isPending}
                                                title="Delete user"
                                                className="p-2 rounded-lg bg-red-950/50 hover:bg-red-900 text-red-400 hover:text-white transition"
                                            >
                                                <FaTrash size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StaffManagement;
