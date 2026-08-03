import { createSlice } from '@reduxjs/toolkit';

const loadCustomerState = () => {
    try {
        const data = localStorage.getItem("qs_customerData");
        if (data) return JSON.parse(data);
    } catch (err) {
        console.error("Error loading customer state:", err);
    }
    return {
        orderId: "",
        activeOrderId: null,
        customerName: "",
        customerPhone: "",
        guests: 0,
        table: null,
        orderStatus: ""
    };
};

const saveCustomerState = (state) => {
    try {
        localStorage.setItem("qs_customerData", JSON.stringify(state));
    } catch (err) {
        console.error("Error saving customer state:", err);
    }
};

const customerSlice = createSlice({
    name: "customer",
    initialState: loadCustomerState(),
    reducers: {
        setCustomer: (state, action) => {
            const { name, phone, guests } = action.payload;
            state.orderId = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            state.activeOrderId = null;
            state.customerName = name;
            state.customerPhone = phone;
            state.guests = guests;
            saveCustomerState(state);
        },

        setOrder: (state, action) => {
            const { activeOrderId, orderId, customerName, customerPhone, guests, table, orderStatus } = action.payload;
            state.activeOrderId = activeOrderId || null;
            state.orderId = orderId || `${Date.now()}`;
            state.customerName = customerName || "";
            state.customerPhone = customerPhone || "";
            state.guests = guests || 1;
            if (table !== undefined) state.table = table;
            state.orderStatus = orderStatus || "In Progress";
            saveCustomerState(state);
        },

        removeCustomer: (state) => {
            state.orderId = "";
            state.activeOrderId = null;
            state.customerName = "";
            state.customerPhone = "";
            state.guests = 0;
            state.table = null;
            state.orderStatus = "";
            try {
                localStorage.removeItem("qs_customerData");
                localStorage.removeItem("qs_cartData");
            } catch (e) {}
        },

        updateTable: (state, action) => {
            state.table = action.payload.table;
            saveCustomerState(state);
        }
    }
});

export const { setCustomer, setOrder, removeCustomer, updateTable } = customerSlice.actions;
export default customerSlice.reducer;