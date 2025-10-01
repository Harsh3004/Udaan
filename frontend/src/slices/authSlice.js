import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    // here we are trying to fetch token from local storage if exists
    storedToken: localStorage.getItem("token"),
    
    token: localStorage.getItem("token") ? JSON.parse(localStorage.getItem("token")) : null,
    loading: false
}

export const authSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        setToken(state, value){
            state.token = value.payload
        },
        setLoading(state,value){
            state.loading = value
        }
    }
})

export const {setToken, setLoading} = authSlice.actions
export default authSlice.reducer

