import { setToken } from "../../slices/authSlice"
import { setUser } from "../../slices/profileSlice";
import {resetCart} from '../../slices/cartSlice';
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

export const logout = (dispatch,navigate,flag=true) => {
    console.log(`In logout`);
    dispatch(setUser(null));
    dispatch(resetCart());
    dispatch(setToken(null));
    localStorage.clear();
    if(flag)
        toast.success("Logout Successfully");
    navigate("/login");
}

export const deleteAccount = (dispatch, navigate) => {
    console.log(`Deleting Account`);

    // Deleting Account API and backend functionality to be created... 

    toast.error(`Coming Soon...`)
}