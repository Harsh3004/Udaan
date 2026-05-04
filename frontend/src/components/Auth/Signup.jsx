import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { endpoints } from "../../services/api";
import { request } from "../../services/operations/authApi";
import { setToken } from "../../slices/authSlice";
import { setUser } from "../../slices/profileSlice";
import { IoEyeOff} from "react-icons/io5";
import { PiEyeDuotone } from "react-icons/pi";
import education from '../../assets/Illustration/education.png'
import notes from '../../assets/Illustration/notes.png'
import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from "react-icons/fc";

export const Signup = () => {
  const [userType, setUserType] = useState('Student');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const googleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const toastId = toast.loading("Verifying Google Auth...");
      try {
        const res = await request(endpoints.GOOGLE_AUTH_API, "POST", { 
            token: tokenResponse.access_token,
            role: userType
        });
        const text = await res.text();
        console.log("Google auth response status:", res.status);
        console.log("Google auth response:", text);
        
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error("Failed to parse JSON:", text);
          throw new Error("Server returned invalid response: " + text.substring(0, 200));
        }
        
        if (res.ok) {
            localStorage.setItem("token", JSON.stringify(data.token));
            localStorage.setItem("user", JSON.stringify(data.user));
            dispatch(setToken(data.token));
            dispatch(setUser(data.user));
            toast.dismiss(toastId);
            toast.success("Account Created Successfully");
            navigate(data.user.role === 'Instructor' ? '/dashboard/instructor' : '/browse');
        } else {
            throw new Error(data.message || "Unknown error");
        }
      } catch (error) {
          console.error("Google signup error:", error);
          toast.dismiss(toastId);
          toast.error(error.message || "Google Signup Failed");
      }
    },
    onError: (error) => {
        console.error("Google login error:", error);
        toast.error("Google Signup Failed");
    }
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading) return;

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match"); 
      return;
    }

    // Lock the button
    setIsLoading(true);
    const toastId = toast.loading(`Sending Otp...`);

    const payload = {
      ...formData,
      role: userType
    };

    try {
      const otp = await request(endpoints.SEND_OTP_API, "POST", formData);
      
      if(otp.ok){
        toast.dismiss(toastId);
        toast.success(`Otp Sent Successfully`);
        navigate('/otp', {state: payload});
      } else {
        toast.dismiss(toastId);
        toast.error(`Something went wrong`);
        navigate('/error');
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="bg-[#000814] min-h-screen text-gray-200 font-sans">
      <main className="w-10/12 max-w-7xl mx-auto py-4">
        <div className="grid md:grid-cols-2 gap-16 items-start">
            
          <div className="hidden md:flex flex-col relative justify-center mt-10">
            <img
              src={notes}
              alt="Person coding on a laptop"
              className="rounded-xl"
              width={250}
            />
            <img
              src={education}
              alt="Person coding on a laptop"
              className="rounded-xl  ml-52"
              width={250}
              />
          </div>
          
          <div className="max-w-md z-50">
            <h1 className="text-3xl font-semibold mb-2">Welcome Back</h1>
            <p className="text-md text-rich-black-100 mb-2">
                Discover your passions,<br /> 
                <span className="font-edu italic font-bold text-blue-300">
                    Be Unstoppable
                </span>
            </p>

            <div className="bg-rich-black-800 p-1 rounded-full flex gap-1 mb-4 max-w-max z-50 cursor-pointer">
              <button
                type="button" // Added type="button" so it doesn't accidentally trigger form submit
                onClick={() => setUserType('Student')}
                className={`px-6 py-1 rounded-full transition-colors text-base ${
                  userType === 'Student' ? 'bg-rich-black-900 text-white' : 'text-gray-400'
                }`}
              >
                Student
              </button>
              <button
                type="button" // Added type="button" 
                onClick={() => setUserType('Instructor')}
                className={`px-6 py-1 rounded-full transition-colors text-base ${
                  userType === 'Instructor' ? 'bg-rich-black-900 text-white' : 'text-gray-400'
                }`}
              >
                Instructor
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label htmlFor="firstName" className="block text-sm mb-1">
                    First Name 
                    <span className="text-red-500">*</span></label>
                  <input
                    type="text" id="firstName" name="firstName" required
                    value={formData.firstName} onChange={handleInputChange}
                    placeholder="Enter first name"
                    className="w-full bg-rich-black-800 border border-gray-700 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div className="w-1/2">
                  <label htmlFor="lastName" className="block text-sm mb-1">Last Name <span className="text-red-500">*</span></label>
                  <input
                    type="text" id="lastName" name="lastName" required
                    value={formData.lastName} onChange={handleInputChange}
                    placeholder="Enter last name"
                    className="w-full bg-rich-black-800 border border-gray-700 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm mb-1">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email" id="email" name="email" required
                  value={formData.email} onChange={handleInputChange}
                  placeholder="Enter email address"
                  className="w-full bg-rich-black-800 border border-gray-700 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm mb-1">Phone Number <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                    <select className="w-1/6 bg-rich-black-800 border border-gray-700 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400">
                        <option>+91</option>
                        <option>+1</option>
                    </select>
                    <input
                      type="tel" id="phone" name="phone" required
                      value={formData.phone} onChange={handleInputChange}
                      placeholder="12345 67890"
                      className="w-5/6 bg-rich-black-800 border border-gray-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-1/2 relative">
                  <label htmlFor="password" className="flex items-center gap-1 text-sm mb-1">
                    Create Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password" name="password" required
                    value={formData.password} onChange={handleInputChange}
                    placeholder="Enter Password"
                    className="w-full bg-rich-black-800 border border-gray-700 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="invisible lg:visible absolute right-4 top-8 text-gray-400">
                    {showPassword ? <IoEyeOff/> : <PiEyeDuotone/>}
                  </button>
                </div>
                 <div className="w-1/2 relative">
                  <label htmlFor="confirmPassword" className="block text-sm mb-1">Confirm Password <span className="text-red-500">*</span></label>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword" name="confirmPassword" required
                    value={formData.confirmPassword} onChange={handleInputChange}
                    placeholder="Enter Password"
                    className="w-full bg-rich-black-800 border border-gray-700 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="invisible lg:visible absolute right-4 top-8 text-gray-400">
                    {showConfirmPassword ? <IoEyeOff/> : <PiEyeDuotone/>}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full font-bold py-2 rounded-lg transition-all duration-300 text-lg mt-6 flex justify-center items-center ${
                  isLoading 
                    ? 'bg-rich-black-500 text-rich-black-200 cursor-not-allowed' 
                    : 'bg-yellow-50 text-rich-black-900 hover:bg-yellow-500'
                }`}
              >
                {isLoading ? 'Sending OTP...' : 'Create Account'}
              </button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-rich-black-700"></div>
              <span className="px-3 text-sm text-rich-black-200">OR</span>
              <div className="flex-1 border-t border-rich-black-700"></div>
            </div>

            <button 
              onClick={() => googleSignup()} 
              className="w-full flex items-center justify-center gap-3 bg-rich-black-800 border border-rich-black-700 text-rich-black-5 font-semibold py-2 rounded-lg hover:bg-rich-black-700 transition-all duration-300 text-lg"
            >
              <FcGoogle className="text-2xl" /> 
              Sign up with Google
            </button>
            
          </div>

        </div>
      </main>
    </div>
  );
}