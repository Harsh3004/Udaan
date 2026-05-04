import { setToken } from "../../slices/authSlice"
import { setUser } from "../../slices/profileSlice";
import {resetCart} from '../../slices/cartSlice';
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { request } from "../operations/authApi";
import { endpoints } from "../api";

export const logout = async (dispatch,navigate,flag=true) => {
    console.log(`In logout`);
    try{
        await request(endpoints.LOGOUT_API,"GET");

        dispatch(setUser(null));
        dispatch(resetCart());
        dispatch(setToken(null));
        localStorage.clear();
        if(flag)
            toast.success("Logout Successfully");
        navigate("/login");
    }
    catch(error){
        console.error("Logout failed:", error);
        toast.error("Failed to logout completely");
    }

}

export const deleteAccount = (dispatch, navigate) => {
    request(endpoints.DELETE_ACCOUNT_API, "DELETE")
        .then(async (response) => {
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete account');
            }

            dispatch(setUser(null));
            dispatch(resetCart());
            dispatch(setToken(null));
            localStorage.clear();
            toast.success("Account deleted successfully");
            navigate("/signup");
        })
        .catch(error => {
            console.error("Delete account failed:", error);
            toast.error(error.message || "Failed to delete account");
        });
}