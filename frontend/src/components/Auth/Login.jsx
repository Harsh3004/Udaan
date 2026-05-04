import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { IoEyeOff } from "react-icons/io5";
import { PiEyeDuotone } from "react-icons/pi";
import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from "react-icons/fc"; 
import { endpoints } from '../../services/api';
import { request } from '../../services/operations/authApi';
import { setToken } from '../../slices/authSlice';
import { setUser } from '../../slices/profileSlice';
import board1 from '../../assets/Illustration/board1.png'

export const Login = () => {
  const [role, setRole] = useState('Student');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // NEW: Added loading state

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const {email,password} = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleOnSubmit = async(e) => {
    e.preventDefault();
    if(isLoading) return;
    setIsLoading(true);
    const toastId = toast.loading("Loading...");
    
    try{
      const res = await request(endpoints.LOGIN_API, "POST" , {email,password,role});
      const data = await res.json();

      if(res.ok){
        localStorage.setItem("token",JSON.stringify(data.userDetails.token));
        localStorage.setItem("user",JSON.stringify(data.userDetails));  
        dispatch(setToken(data.userDetails.token));
        dispatch(setUser(data.userDetails));
        toast.dismiss(toastId);
        toast.success("Login Successfully");
        const accountType = data?.userDetails?.accountType || role;
        const redirectPath = accountType === 'Student' ? '/browse' : '/dashboard/instructor';
        navigate(redirectPath);
      }
      else throw new Error("Login Failed");
    }catch(err){
      toast.dismiss(toastId);
      toast.error("Login Failed");
    } finally {
      setIsLoading(false);
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const toastId = toast.loading("Verifying Google Auth...");
      try {
        const res = await request(endpoints.GOOGLE_AUTH_API, "POST", { 
            token: tokenResponse.access_token,
            role: role
        });
        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("token", JSON.stringify(data.token));
            localStorage.setItem("user", JSON.stringify(data.user));
            dispatch(setToken(data.token));
            dispatch(setUser(data.user));
            toast.dismiss(toastId);
            toast.success("Login Successfully");
            const redirectPath = data?.user?.role === 'Student' ? '/browse' : '/dashboard/instructor';
            navigate(redirectPath);
        } else {
            throw new Error(data.message);
        }
      } catch (error) {
          toast.dismiss(toastId);
          toast.error("Google Login Failed");
      }
    },
    onError: () => {
        toast.error("Google Login Failed");
    }
  });

  return (
    <div className='h-screen flex bg-rich-black-900 text-rich-black-5 z-50'>
      <main className="w-9/12 max-w-7xl mx-auto py-5 z-40">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="max-w-md">
            <h1 className="text-3xl font-semibold mb-2">Welcome Back</h1>
            <p className="text-lg text-rich-black-100 mb-6">
                Discover your passions, <br/>
                <span className="font-edu italic font-bold text-blue-300">
                    Be Unstoppable
                </span>
            </p>

            <div className="bg-rich-black-800 p-1 rounded-full flex gap-1 mb-6 max-w-max z-50 cursor-pointer">
              <button
                onClick={() => setRole('Student')}
                className={`px-6 py-2 rounded-full transition-colors text-base ${role === 'Student' ? 'bg-rich-black-900 text-white' : 'text-gray-400'}`}
              >Student</button>
              <button
                onClick={() => setRole('Instructor')}
                className={`px-6 py-2 rounded-full transition-colors text-base ${role === 'Instructor' ? 'bg-rich-black-900 text-white' : 'text-gray-400'}`}
              >Instructor</button>
            </div>

            <form className="space-y-6" onSubmit={handleOnSubmit}>
              {/* Email & Password inputs remain unchanged */}
              <div>
                <label htmlFor="email" className="block text-sm mb-1">Email Address</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter email address" className="w-full bg-[#161d29] border border-gray-700 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div className="relative">
                <label htmlFor="password" className="block text-sm mb-1">Password</label>
                <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Enter Password" className="w-full bg-[#161d29] border border-gray-700 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-10 text-gray-400">
                  {showPassword ? <PiEyeDuotone/> : <IoEyeOff/>}
                </button>
                <Link to="forgot-password" className="text-xs text-blue-400 mt-1 block text-right">Forgot password</Link>
              </div>

              <button type="submit" disabled={isLoading} className="w-full bg-yellow-50 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition-all duration-300 text-lg">
                Sign In
              </button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-rich-black-700"></div>
              <span className="px-3 text-sm text-rich-black-200">OR</span>
              <div className="flex-1 border-t border-rich-black-700"></div>
            </div>

            <button 
              onClick={() => googleLogin()} 
              className="w-full flex items-center justify-center gap-3 bg-rich-black-800 border border-rich-black-700 text-rich-black-5 font-semibold py-3 rounded-lg hover:bg-rich-black-700 transition-all duration-300 text-lg"
            >
              <FcGoogle className="text-2xl" /> 
              Continue with Google
            </button>

          </div>

          <div className="hidden md:block relative">
            <img src={board1} alt="Person coding on a laptop" className="rounded-xl" width={500} />
          </div>
        </div>
      </main>
    </div>
  )
}