import React, { useState } from 'react'
import board1 from '../assets/Illustration/board1.png'
import { IoEyeOff} from "react-icons/io5";
import { PiEyeDuotone } from "react-icons/pi";

export const Login = () => {
    const [userType, setUserType] = useState('Instructor');
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const handleInputChange = (e) => {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

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
                onClick={() => setUserType('Student')}
                className={`px-6 py-2 rounded-full transition-colors text-base ${
                  userType === 'Student' ? 'bg-rich-black-900 text-white' : 'text-gray-400'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => setUserType('Instructor')}
                className={`px-6 py-2 rounded-full transition-colors text-base ${
                  userType === 'Instructor' ? 'bg-rich-black-900 text-white' : 'text-gray-400'
                }`}
              >
                Instructor
              </button>
            </div>

            <form className="space-y-6">
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
                <a href="#" className="text-xs text-blue-400 mt-1 block text-right">
                    Forgot password
                </a>
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
