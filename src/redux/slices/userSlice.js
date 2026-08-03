import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    _id: "",
    name: "",
    email: "",
    phone: "",
    role: "",
    isAdmin: false,
    isAuth: false
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            const { _id, name, phone, email, role, isAdmin } = action.payload;
            state._id = _id || "";
            state.name = name || "";
            state.phone = phone || "";
            state.email = email || "";
            state.role = role || (isAdmin ? "Admin" : "Staff");
            state.isAdmin = isAdmin !== undefined ? isAdmin : role === "Admin";
            state.isAuth = true;
        },

        removeUser: (state) => {
            state._id = "";
            state.name = "";
            state.phone = "";
            state.email = "";
            state.role = "";
            state.isAdmin = false;
            state.isAuth = false;
        }
    }
});

export const { setUser, removeUser } = userSlice.actions;
export default userSlice.reducer;