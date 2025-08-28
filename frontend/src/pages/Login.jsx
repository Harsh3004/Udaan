import React, { useState } from 'react'
import board1 from '../assets/Illustration/board1.png'
import { IoEyeOff} from "react-icons/io5";
import { PiEyeDuotone } from "react-icons/pi";
import { useNavigate } from 'react-router-dom';
import {request} from '../services/operations/authApi';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';
import { setToken } from '../slices/authSlice';
import { setUser } from '../slices/profileSlice';
import { endpoints } from '../services/api';

export const Login = () => {
  const [role, setRole] = useState('Instructor');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value 
    }));
  };
  
  const {email,password} = formData;
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const handleOnSubmit = async(e) => {
    e.preventDefault();
    
    const toastId = toast.loading("Loading...");
    try{
      const res = await request(endpoints.LOGIN_API, "POST" , {email,password,role});
      const data = await res.json();

      if(res.ok){
        localStorage.setItem("token",JSON.stringify(data.userDetails.token));
        console.log(`Login Successfully`);
        dispatch(setToken(data.userDetails.token));
        dispatch(setUser(data.userDetails));
        toast.dismiss(toastId);
        toast.success("Login Successfully");
        navigate('/dashboard');
      }
      else
        throw new Error("Login Failed");
    }catch(err){
      console.log(`Login Failed: ${err.message}`);
      toast.dismiss(toastId);
      toast.error("Login Failed");
    }
  }

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
                className={`px-6 py-2 rounded-full transition-colors text-base ${
                  role === 'Student' ? 'bg-rich-black-900 text-white' : 'text-gray-400'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => setRole('Instructor')}
                className={`px-6 py-2 rounded-full transition-colors text-base ${
                  role === 'Instructor' ? 'bg-rich-black-900 text-white' : 'text-gray-400'
                }`}
              >
                Instructor
              </button>
            </div>

            <form className="space-y-6" onSubmit={handleOnSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className="w-full bg-[#161d29] border border-gray-700 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div className="relative">
                <label htmlFor="password" className="block text-sm mb-1">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter Password"
                  className="w-full bg-[#161d29] border border-gray-700 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-10 text-gray-400"
                >
                  {showPassword ? <PiEyeDuotone/> : <IoEyeOff/>}
                </button>
                <Link to="forgot-password" className="text-xs text-blue-400 mt-1 block text-right">
                  Forgot password
                </Link>
              </div>
              <button
                type="submit"
                className="w-full bg-yellow-50 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition-all duration-300 text-lg"
              >
                Sign In
              </button>
            </form>
          </div>

          <div className="hidden md:block relative">
            <img
              src={board1}
              alt="Person coding on a laptop"
              className="rounded-xl"
              width={500}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
