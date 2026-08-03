import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  }
});


export const login = (data) => api.post("/api/user/login", data);
export const register = (data) => api.post("/api/user/register", data);
export const getUserData = () => api.get("/api/user");
export const logout = () => api.post("/api/user/logout");


export const addTable = (data) => api.post("/api/table", data);
export const getTables = () => api.get("/api/table");
export const updateTable = ({ tableId, ...tableData }) => api.put(`/api/table/${tableId}`, tableData);


export const addOrder = (data) => api.post("/api/order", data);
export const getOrders = () => api.get("/api/order");
export const getOrderById = (id) => api.get(`/api/order/${id}`);
export const updateOrderStatus = ({ orderId, orderStatus }) => api.put(`/api/order/${orderId}`, { orderStatus });


export const getCategories = () => api.get("/api/category");
export const addCategory = (data) => api.post("/api/category", data);
export const updateCategory = ({ id, ...data }) => api.put(`/api/category/${id}`, data);
export const deleteCategory = (id) => api.delete(`/api/category/${id}`);


export const getMenuItems = () => api.get("/api/menu");
export const addMenuItem = (data) => api.post("/api/menu", data);
export const updateMenuItem = ({ id, ...data }) => api.put(`/api/menu/${id}`, data);
export const deleteMenuItem = (id) => api.delete(`/api/menu/${id}`);


export const checkoutOrder = ({ id, paymentMethod }) => api.put(`/api/checkout/checkout/${id}`, { paymentMethod });
export const getInvoice = (id) => api.get(`/api/checkout/invoice/${id}`);

export default api;
