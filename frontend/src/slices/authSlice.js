import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    // here we are trying to fetch token from local storage if exists
    token: localStorage.getItem("token") ? localStorage.getItem("token") : null
}

export const authSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        setToken(state, value){
            state.token = value.payload
        }
    }
})

export const {setToken} = authSlice.actions
export default authSlice.reducer

