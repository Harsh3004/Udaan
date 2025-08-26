import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { signUp } from '../services/operations/authApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const Otp = () => {
  const location = useLocation();
  const {state} = location;
  console.log(state);

  const [otpForm, setotpFormData] = useState({ otp: '' });

  const handleInputChange = (e) => {
    setotpFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value 
    }));
  };

  const navigate = useNavigate();
  const handleOnSubmit = async (e) => {
    e.preventDefault();
    const payload = {
        fName: state.firstName,
        lName: state.lastName,
        email: state.email,
        password: state.password,
        confirmPassword: state.confirmPassword,
        role: state.role,
        otp: otpForm.otp
    }

    console.log(payload);
    const res =  await signUp(payload);
    const data = await res.json();
    if(res.ok){
        navigate('/dashboard')
        toast.success(`Otp Verified successfully`);
    }else{
        navigate('/signup');
        toast.error(data?.message);
    }
  }
 
  return (
    <form className="w-screen h-screen flex flex-col justify-center items-center space-y-6 z-50" onSubmit={handleOnSubmit}>
        <div className='z-50'>
            <input
              type="otp"
              id="otp"
              name="otp"
              value={otpForm.otp}
              onChange={handleInputChange}
              placeholder="OTP"
              className="w-full bg-[#161d29] text-white border border-gray-700 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-center tracking-widest z-40"
            />
        </div>
        
        <button
        type="submit"
        className="px-2 bg-yellow-50 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition-all duration-300 text-lg z-50"
        >
            Verify Otp
        </button>
    </form>
  )
}
