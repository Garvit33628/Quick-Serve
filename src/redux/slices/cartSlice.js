import { createSlice } from "@reduxjs/toolkit";

const loadCartState = () => {
    try {
        const data = localStorage.getItem("qs_cartData");
        if (data) return JSON.parse(data);
    } catch (err) {
        console.error("Error loading cart state:", err);
    }
    return [];
};

const saveCartState = (state) => {
    try {
        localStorage.setItem("qs_cartData", JSON.stringify(state));
    } catch (err) {
        console.error("Error saving cart state:", err);
    }
};

const cartSlice = createSlice({
    name: "cart",
    initialState: loadCartState(),
    reducers: {
        setCart: (state, action) => {
            const newState = action.payload || [];
            saveCartState(newState);
            return newState;
        },

        addItems: (state, action) => {
            const newItem = action.payload;
            const targetId = newItem.id || newItem._id;
            const existingItem = state.find(item => (item.id || item._id) === targetId);

            if (existingItem) {
                existingItem.quantity += newItem.quantity;
                const pPerQty = newItem.pricePerQuantity || (newItem.price / newItem.quantity);
                existingItem.pricePerQuantity = pPerQty;
                existingItem.price = existingItem.quantity * pPerQty;
            } else {
                const pPerQty = newItem.pricePerQuantity || (newItem.price / newItem.quantity);
                state.push({
                    id: targetId,
                    _id: targetId,
                    name: newItem.name,
                    pricePerQuantity: pPerQty,
                    quantity: newItem.quantity,
                    price: newItem.price || (pPerQty * newItem.quantity)
                });
            }
            saveCartState(state);
        },

        updateItemQuantity: (state, action) => {
            const { id, delta } = action.payload;
            const index = state.findIndex(item => (item.id || item._id) === id);
            if (index !== -1) {
                const item = state[index];
                const newQty = item.quantity + delta;
                if (newQty <= 0) {
                    state.splice(index, 1);
                } else {
                    item.quantity = newQty;
                    const pPerQty = item.pricePerQuantity || (item.price / (item.quantity - delta));
                    item.pricePerQuantity = pPerQty;
                    item.price = newQty * pPerQty;
                }
            }
            saveCartState(state);
        },

        removeItem: (state, action) => {
            const targetId = action.payload;
            const newState = state.filter(item => (item.id || item._id) !== targetId);
            saveCartState(newState);
            return newState;
        },

        removeAllItems: () => {
            try {
                localStorage.removeItem("qs_cartData");
            } catch (e) {}
            return [];
        }
    }
});

export const getTotalPrice = (state) =>
    state.cart.reduce((total, item) => total + (item.price || 0), 0);

export const { setCart, addItems, updateItemQuantity, removeItem, removeAllItems } = cartSlice.actions;
export default cartSlice.reducer;
