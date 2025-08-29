import React, { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import { GoArrowLeft } from 'react-icons/go';
import toast from 'react-hot-toast';
import { endpoints } from '../services/api';
import { PiEyeDuotone } from 'react-icons/pi';
import { IoEyeOff } from 'react-icons/io5';
import { request } from '../services/operations/authApi';

export const UpdatePassword = () => {
    const params = useParams();
    const navigate = useNavigate();

    const [data,setData] = useState({ password: '' , confirmPassword: ''})
    const [showPassword, setShowPassword] = useState(false);
    const [showconfirmPassword, setShowconfirmPassword] = useState(false);
    const handleInputChange = (e) => {
        setData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        console.log(`Changing Password`)
        const toastId = toast.loading(`Changing Password`);
        
        try{
            const {token} = params;
            data.token = token;
            
            console.log(data)
            const res = await request(endpoints.RESET_PASSWORD, "PUT", data);
            const response = await res.json();

            console.log(res);
            console.log(response);

            if(!res.ok)
                throw new Error(response.message);
            
            toast.dismiss(toastId);
            toast.success(`Password Changed Successfully`);
            navigate('/login')
        }catch(err){
            toast.dismiss(toastId);
            toast.error(err.message);
        }
    }

    return (
        <div className='w-screen min-h-screen text-rich-black-5 flex justify-center items-center'>
            <div className='px-5 w-1/3 mx-auto flex flex-col gap-2'>
                <p className='font-semibold text-3xl'>Choose  new password</p>
                <p className='text-lg text-rich-black-100'>Almost done. Enter your new password and youre all set.</p>

                <form onSubmit={submitHandler} className='flex flex-col gap-1 z-40'>
                    <div className='flex flex-col relative'>
                        <label htmlFor="password" className='font-normal text-rich-black-5'>New Password <span className='text-red-500'>*</span></label>
                        <input 
                            type={showPassword ? 'text' : 'password'}
                            name='password'
                            onChange={handleInputChange}
                            className='bg-rich-black-800 p-2 rounded-lg outline-none'
                        />
                        <button
                            type="button"
                            name='password'
                            value={data.password}
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-10 text-gray-400"
                        >
                        {showPassword ? <PiEyeDuotone/> : <IoEyeOff/>}
                        </button>
                    </div>

                    <div className='flex flex-col relative'>
                        <label htmlFor="confirmPassword" className='font-normal text-rich-black-5'>Confirm Password <span className='text-red-500'>*</span></label>
                        <input 
                        onChange={handleInputChange}
                        name='confirmPassword'
                        type={showconfirmPassword ? 'text' : 'password'}
                        className='bg-rich-black-800 p-2 rounded-lg outline-none'/>

                        <button
                        type="button"
                        name='confirmPassword'
                        value={data.confirmPassword}
                        onClick={() => setShowconfirmPassword(!showconfirmPassword)}
                        className="absolute right-3 top-10 text-gray-400 z-50"
                        >
                        {showconfirmPassword ? <PiEyeDuotone/> : <IoEyeOff/>}
                        </button>
                    </div>

                    <button
                    type = "submit"
                    className='bg-yellow-50 py-3 my-4 text-rich-black-900 rounded-md font-semibold z-40'
                    >
                        <p>Reset Password</p>
                    </button>
                </form>

                <Link to='/login' className='flex items-center gap-2 cursor-pointer z-40 text-rich-black-200'>
                    <GoArrowLeft/>
                    Back to login
                </Link>
            </div>
        </div>
    )
}
