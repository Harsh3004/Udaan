import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    totalItems: 0
}

export const cartSlice = createSlice({
    name: 'cart',
    initialState: initialState,
    reducers: {
        setTotalItems(state, value){
            state.totalItems = value.payload
        },
        resetCart(state){
            state.totalItems = 0;
        }

        // add to cart
        // remove from cart
        // reset Cart
    }
})

export const {setTotalItems, resetCart} = cartSlice.actions
export default cartSlice.reducer