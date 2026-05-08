import { request } from "./authApi"
import { endpoints } from "../api"
import toast from "react-hot-toast"

export const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => {
      resolve(true)
    }
    script.onerror = () => {
      resolve(false)
    }
    document.body.appendChild(script)
  })
}

async function verifyPayment(bodyData,navigate){
    const toastId = toast.loading("Verifying payment");
    try{
        const response = await request(endpoints.VERIFY_PAYMENT, "POST", bodyData);
        const data = await response.json();
        if(!data.success){
            throw new Error(data.message);
        }

        toast.dismiss(toastId);
        toast.success("Payment Successful");
        navigate("/dashboard/enrolled-courses");
    }catch(error){
        toast.dismiss(toastId);
        toast.error("Payment Failed! Try Again Later..");
        console.log("Error in Verifying Payment: ", error);
    }
}

async function enrollFreeCourse(course, navigate) {
  const toastId = toast.loading("Enrolling in course");

  try {
    const response = await request(endpoints.ENROLL_FREE_COURSE_API, "POST", {
      courseId: course._id,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to enroll in course");
    }

    toast.dismiss(toastId);
    toast.success(data.message || "Course enrolled successfully");
    navigate(`/view-course/${course._id}`);
  } catch (error) {
    toast.dismiss(toastId);
    toast.error(error.message || "Failed to enroll in course");
    console.log("Error enrolling in free course: ", error);
  }
}

export const buyCourse = async(course,navigate) => {
  console.log("Payment Testing...");
  console.log("course: ",course);

  if (Number(course?.price) <= 0) {
    await enrollFreeCourse(course, navigate);
    return;
  }

  try{
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js')
    
      if (!res){
        alert('Razropay failed to load!!')
        return ;
      }
    
      const response = await request(endpoints.CREATE_ORDER_API, "POST",
        {courseId: course._id}
      ); 
    
      const data = await response.json();
    
      console.log("data: ", data);
      const options = {
        "key": import.meta.env.VITE_RAZORPAY_KEY,
        "amount": course.price*100,
        "currency": "INR",
        "name": "Udaan",
        "description": "Thank you purchasing our Course",
        // "image": rzpLogo,
        "order_id": data.order.id,
        // "callback_url": endpoints.VERIFY_PAYMENT,
        
        handler: async function(response){
            // verify payment
            verifyPayment(response,navigate);
        },
        "notes": {
          "address": "Razorpay Corporate Office"
        },
        "theme": {
          "color": "#3399cc"
        }
      };
    
      const paymentObject = new window.Razorpay(options); 
      paymentObject.open();
  }
  catch(err){
    console.log("Payment API Error: ", err);
    toast.error("Payment Failed! Try Again Later..");
  }
}