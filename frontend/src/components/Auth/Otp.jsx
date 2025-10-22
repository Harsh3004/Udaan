import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { endpoints } from '../../services/api';
import { request } from '../../services/operations/authApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import OtpInput from 'react-otp-input';

export const Otp = () => {
  const location = useLocation();
  const {state} = location;
  console.log(state);

  const [otp, setotp] = useState('');

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
        otp: otp
    }

    console.log(payload);
    const res =  await request(endpoints.SIGN_UP_API,"POST",payload);
    const data = await res.json();
    if(res.ok){
      navigate('/login')
      toast.success(`Your account created successfully`);
    }else
      toast.error(data?.message);
    
  }
 
  return (
    <form className="w-screen h-screen flex flex-col justify-center items-center space-y-6 z-50" onSubmit={handleOnSubmit}>
        <OtpInput
           value={otp}
           onChange={(newOtp) => setotp(newOtp)}
           numInputs={6}
           placeholder='-'
           renderInput={(props) => <input {...props} placeholder="-"/>}
           shouldAutoFocus='true'
           inputStyle={{
           width: "3rem",
           height: "3rem",
           margin: "0 0.5rem",
           fontSize: "1.5rem",
           borderRadius: "8px",  
           zIndex: "40",
           color: "white",
           backgroundColor: "#2C333F",
           outline: "none"
          }}
        />
        
        <button
        onClick={handleOnSubmit}
        className="px-2 bg-yellow-50 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition-all duration-300 text-lg z-50"
        >
            Verify Otp
        </button>
    </form>
  )
}
