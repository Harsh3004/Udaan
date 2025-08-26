import { setToken } from "../../slices/authSlice"
import { setUser } from "../../slices/profileSlice";
import {resetCart} from '../../slices/cartSlice';
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

export const logout = (dispatch,navigate) => {
    console.log(`In logout`);
    dispatch(setUser(null));
    dispatch(resetCart());
    dispatch(setToken(null));
    localStorage.clear();
    toast.success("Loggout Successfully");
    navigate("/");
}