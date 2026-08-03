import React, { useState } from 'react';
import { MdTableBar, MdCategory } from 'react-icons/md';
import { BiSolidDish } from 'react-icons/bi';
import Metrics from '../components/dashboard/Metrics';
import RecentOrders from '../components/dashboard/RecentOrders';
import CategoryManagement from '../components/dashboard/CategoryManagement';
import DishesManagement from '../components/dashboard/DishesManagement';
import Modal from '../components/dashboard/Modal';

const buttons = [
    { label: "Add Table", icon: <MdTableBar />, action: "table" },
    { label: "Add Category", icon: <MdCategory />, action: "category" },
    { label: "Add Dishes", icon: <BiSolidDish />, action: "dishes" }
];

const tabs = ["Metrics", "Orders", "Categories", "Dishes"];

const Dashboard = () => {
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);
    const [activeModal, setActiveModal] = useState("table");
    const [editItem, setEditItem] = useState(null);
    const [activeTab, setActiveTab] = useState("Metrics");

    const handleOpenModal = (action) => {
        setEditItem(null);
        setActiveModal(action);
        setIsTableModalOpen(true);
    };

    const handleOpenEditCategory = (category) => {
        setEditItem(category);
        setActiveModal("editCategory");
        setIsTableModalOpen(true);
    };

    const handleOpenEditDish = (dish) => {
        setEditItem(dish);
        setActiveModal("editDishes");
        setIsTableModalOpen(true);
    };

    return (
        <div className='bg-[#1f1f1f] min-h-[calc(100vh-5rem)] pb-10'>
            <div className='container mx-auto px-6 md:px-4 pt-8'>
                <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-6'>
                    <div className='flex items-center gap-3 flex-wrap'>
                        {buttons.map(({ label, icon, action }) => (
                            <button
                                key={action}
                                onClick={() => handleOpenModal(action)}
                                className='bg-[#1a1a1a] hover:bg-[#262626] px-5 py-3 rounded-xl text-[#f5f5f5] font-semibold text-sm flex items-center gap-2 transition border border-[#333]'
                            >
                                {label} {icon}
                            </button>
                        ))}
                    </div>

                    <div className='flex items-center gap-2 flex-wrap'>
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition ${
                                    activeTab === tab ? 'bg-[#f6b100] text-gray-900 shadow-md font-bold' : 'bg-[#1a1a1a] text-[#ababab] hover:bg-[#262626] hover:text-white'
                                }`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'Metrics' && <Metrics />}
                {activeTab === 'Orders' && <RecentOrders />}
                {activeTab === 'Categories' && (
                    <CategoryManagement
                        onOpenAddCategory={() => handleOpenModal('category')}
                        onOpenEditCategory={handleOpenEditCategory}
                    />
                )}
                {activeTab === 'Dishes' && (
                    <DishesManagement
                        onOpenAddDish={() => handleOpenModal('dishes')}
                        onOpenEditDish={handleOpenEditDish}
                    />
                )}

                {isTableModalOpen && (
                    <Modal
                        setIsTableModalOpen={setIsTableModalOpen}
                        targetModal={activeModal}
                        editItem={editItem}
                    />
                )}
            </div>
        </div>
    );
};

export default Dashboard;
