import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: 'auth',
    initialState: { user: null, token: null, isLogin: false },
    reducers: {
        setAuth: (state, action) => {
            if (action.payload.user && action.payload.user.username) {
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isLogin = true;
            } else {
                console.error("User object or username is missing!");
            }
        },
        removeAuth: (state) => {
            state.user = null;
            state.token = null;
            state.isLogin = false;
        }
    }
});

export const { setAuth, removeAuth } = authSlice.actions;

export default authSlice.reducer;