import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { request } from '../services/operations/authApi';
import { endpoints } from '../services/api';
import { Link } from 'react-router-dom';
import { GoArrowLeft } from "react-icons/go";

const ForgotPassword = () => {
    const [sendEmail,setsendEmail] = useState(false);
    const [email,setemail] = useState("");

    const changeHandler = (e) => {
        setemail(e.target.value);
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        console.log(`Sending mail`);
        const toastId = toast.loading(`Sending Mail`);
        try{
            const res = await request(endpoints.FORGOT_PASSWORD, "PUT", {email: email});
            const data = await res.json();
            console.log(res.ok);
            if(res.ok){
                toast.dismiss(toastId);
                toast.success(`Mail send successfully`);
                setsendEmail(true);
            }else{
                throw new Error(data.message)
            }
        }catch(err){
            console.log(`Error while sending mail`);
            toast.dismiss(toastId);
            toast.error(err.message);
        }
    }

  return (
    <div className='w-2/5 mx-auto h-screen text-white flex justify-center items-left flex-col gap-6 px-6 z-40'>
        <div>
            <div className='text-rich-black-5 font-semibold text-3xl z-40 py-2'>
                {
                    !sendEmail ? 
                    (
                        <p>Reset your password</p>
                    ) :     
                    (
                        <p>Check email</p>
                    )
                }
            </div>
            <div>
                {
                    !sendEmail ? 
                    (
                        <p>Have no fear. We’ll email you instructions to reset your password. If you dont have access to your email we can try account recovery</p>
                    ) :
                    (
                        <div>
                            <p>We have sent the reset email to</p>
                            <p className='font-semibold text-white italic'>{email}</p>
                        </div>
                    )
                }
            </div>
        </div>

        <div>
            <form action="" className='flex flex-col gap-8' onSubmit={submitHandler}>
                {
                    !sendEmail &&
                        (
                            <div className='flex flex-col'>
                                <label htmlFor='email' >Email Address <span className='text-red-500'>*</span></label>
                                <input 
                                type="text" 
                                name='email'
                                id='email'
                                className='bg-rich-black-800 rounded-md p-2 z-40 focus:outline-none border border-rich-black-700' 
                                placeholder='xyz@gmail.com'
                                value={email}
                                onChange={changeHandler}
                                />
                            </div>
                        ) 
                }
                <button
                type = "submit"
                className='bg-yellow-50 py-2 text-rich-black-900 rounded-md font-semibold z-40'
                >
                    {
                        !sendEmail ? 
                        (
                            <p>Reset Password</p>
                        ) :
                        (
                            <p>Resend email</p>
                        )
                    }
                </button>
            </form>
        </div>
        <Link to='/login' className='flex items-center gap-2 cursor-pointer z-40 text-rich-black-200'>
            <GoArrowLeft/>
            Back to login
        </Link>

    </div>
  )
}

export default ForgotPassword