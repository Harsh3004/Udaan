import toast from "react-hot-toast";
import { request } from "../operations/authApi";
import { endpoints } from "../api";

export const contactUs = async(data) => {
    console.log("Form Data:", data);
    const toastId = toast.loading('Contacting with team');
    try{
      const res = await request(endpoints.CONTACT_API,"POST",data);
      if(!res.ok){
        const response = await res.json();
        throw new Error(response.message)
      }
      toast.dismiss(toastId);
      toast.success(`Our Team received your message`);
    }catch(err){
      console.log(`Something went wrong`)
      toast.dismiss(toastId);
      toast.error(`Try Again Later`);
    }
}