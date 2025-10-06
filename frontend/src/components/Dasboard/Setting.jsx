import React from 'react'
import { useSelector } from 'react-redux';
import { Button } from '../Button';
import { useState } from 'react';
import { IoEyeOff} from "react-icons/io5";
import { PiEyeDuotone } from "react-icons/pi";
import toast from 'react-hot-toast';
import { endpoints } from '../../services/api';
import { request } from '../../services/operations/authApi';


// SVG Icons as React Components for cleaner use
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-rich-black-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" />
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-rich-black-400 cursor-pointer">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L6.228 6.228" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-rose-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.144-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.057-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const Setting = () => {
  const { user } = useSelector((state) => state.profile);
  const [previewImage, setPreviewImage] = useState(user.profileImage);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [data,setData] = useState({ password: '' , newPassword: ''})

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a temporary URL for the selected file to display a preview
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      console.log(previewImage);

      // Pass the file to a parent component or handle the upload logic
      // if (onImageChange) {
      //   onImageChange(file);
      // }
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(user.profileImage);
    // if (onImageRemove) {
    //   onImageRemove(); // Call a function to handle removal logic
    // }
  };

  const changePasswordHandler = async (e) => {
    e.preventDefault();
    console.log(`Change Password Request...`);
    const toastId = toast.loading(`Changing Password`);
    try{
      data.userId = user._id;
      const res = await request(endpoints.CHANGE_PASSWORD_API, "PUT", data);
      const response = await res.json();

      if(!res.ok)
        throw new Error(response.message);
            
      toast.dismiss(toastId);
      toast.success(`Password Changed Successfully`);
    }catch(err){
      toast.dismiss(toastId);
      toast.error(err.message);
    }
  }

  const handleInputChange = (e) => {
    setData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
    }));
  }
  
  return (
    <div className="min-h-screen flex justify-center items-center p-4 sm:p-6 lg:p-8 z-40">
      <div className="max-w-3xl w-full space-y-6 z-40">

        <div className="bg-rich-black-800 border border-rich-black-700 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6 z-40">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-rich-black-600">
            <img
              src={previewImage}
              alt="User profile"
              className="w-full h-full object-cover"
            />
            <input
              type="file"
              id="profile-image-upload"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <div className="text-center sm:text-left">
            <h3 className="text-base font-medium text-rich-black-5">Change Profile Picture</h3>
            <div className="mt-2 flex gap-3">
              <label
                htmlFor="profile-image-upload"
                className="bg-amber-400 text-rich-black-900 font-semibold px-4 py-1.5 rounded-md text-sm cursor-pointer hover:bg-amber-300 transition-colors"
              >
                Change
              </label>
              <button
                onClick={handleRemoveImage}
                className="bg-rich-black-700 text-rich-black-100 font-semibold px-4 py-1.5 rounded-md text-sm hover:bg-slate-500 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        {/* --- Section 2: Profile Information --- */}
        <div className="bg-rich-black-800 border border-rich-black-700 rounded-xl p-6 z-40">
          <h2 className="text-lg font-semibold text-rich-black-5 mb-6">Profile Information</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Display Name */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium text-rich-black-400">Display Name</label>
              <input type="text" id="displayName" placeholder="**********" className="w-full bg-rich-black-800 border border-rich-black-600 rounded-md px-3 py-2 text-rich-black-100 placeholder-rich-black-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p className="text-xs text-slate-500">Name entered above will be used for all issued certificates.</p>
            </div>

            {/* Profession */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="profession" className="text-sm font-medium text-rich-black-400">Profession</label>
              <select id="profession" className="w-full bg-rich-black-800 border border-rich-black-600 rounded-md px-3 py-2 text-rich-black-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Developer</option>
                <option>Designer</option>
                <option>Manager</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="dob" className="text-sm font-medium text-rich-black-400">Date of Birth</label>
              <div className="relative">
                <input type="text" id="dob" placeholder="dd/mm/yyyy" className="w-full bg-rich-black-800 border border-rich-black-600 rounded-md pl-3 pr-10 py-2 text-rich-black-100 placeholder-rich-black-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <CalendarIcon />
                </div>
              </div>
            </div>

            {/* Gender */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-rich-black-400">Gender</label>
              <div className="flex items-center gap-x-6 pt-2">
                <label htmlFor="male" className="flex items-center gap-2 cursor-pointer text-sm text-slate-200">
                  <input type="radio" name="gender" id="male" defaultChecked className="hidden peer" />
                  <span className="w-5 h-5 border-2 border-slate-500 rounded-full peer-checked:border-amber-400 relative flex items-center justify-center">
                    <span className="w-2.5 h-2.5 bg-amber-400 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></span>
                  </span>
                  Male
                </label>
                <label htmlFor="female" className="flex items-center gap-2 cursor-pointer text-sm text-slate-200">
                  <input type="radio" name="gender" id="female" className="hidden peer" />
                  <span className="w-5 h-5 border-2 border-slate-500 rounded-full peer-checked:border-amber-400 relative flex items-center justify-center">
                    <span className="w-2.5 h-2.5 bg-amber-400 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></span>
                  </span>
                  Female
                </label>
                <label htmlFor="other" className="flex items-center gap-2 cursor-pointer text-sm text-slate-200">
                  <input type="radio" name="gender" id="other" className="hidden peer" />
                  <span className="w-5 h-5 border-2 border-slate-500 rounded-full peer-checked:border-amber-400 relative flex items-center justify-center">
                    <span className="w-2.5 h-2.5 bg-amber-400 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></span>
                  </span>
                  Other
                </label>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-rich-black-400">Phone Number</label>
              <div className="flex gap-2">
                <select id="countryCode" className="bg-rich-black-800 border border-rich-black-600 rounded-md px-3 py-2 text-rich-black-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>+91</option>
                  <option>+1</option>
                </select>
                <input type="tel" id="phone" placeholder="12345 67890" className="flex-grow bg-rich-black-800 border border-rich-black-600 rounded-md px-3 py-2 text-rich-black-100 placeholder-rich-black-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* About */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="about" className="text-sm font-medium text-rich-black-400">About</label>
              <textarea name="" id="about" className="w-full bg-rich-black-800 border border-rich-black-600 rounded-md px-3 py-2 text-rich-black-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Enter Bio Details
              </textarea>
            </div>
          </form>
        </div>

        <div className="mt-2 flex flex-row-reverse gap-3">
          <button className="bg-amber-400 text-rich-black-900 font-semibold px-4 py-1.5 rounded-md text-sm hover:bg-amber-300 transition-colors">
            Save
          </button>
          <button className="bg-rich-black-700 text-rich-black-100 font-semibold px-4 py-1.5 rounded-md text-sm hover:bg-slate-500 transition-colors">
            Cancel
          </button>
        </div>
        
        {/* --- Section 3: Password --- */}
        <div className="bg-rich-black-800 border border-rich-black-700 rounded-xl p-6 z-40">
          <h2 className="text-lg font-semibold text-rich-black-100 mb-6">Password</h2>
          <form 
            onSubmit={changePasswordHandler}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="flex flex-col space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium text-rich-black-400">Current Password *</label>
              <div className="relative">
                <input 
                  type={showCurrentPassword ? 'text' : 'password'}
                  onChange={handleInputChange}
                  name='password'
                  id="currentPassword"
                  placeholder="Enter current password" 
                  className="w-full bg-rich-black-800 border border-rich-black-600 rounded-md pl-3 pr-10 py-2 text-rich-black-100 placeholder-rich-black-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-3 flex items-center"
                >
                  {showCurrentPassword ? <PiEyeDuotone/> : <IoEyeOff/>}
                </button>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="changePassword" className="text-sm font-medium text-rich-black-400">New Password *</label>
              <div className="relative">
                <input 
                  type={showNewPassword ? 'text' : 'password'}
                  onChange={handleInputChange}
                  name='newPassword'
                  id="changePassword" 
                  placeholder="Enter new password" 
                  className="w-full bg-rich-black-800 border border-rich-black-600 rounded-md pl-3 pr-10 py-2 text-rich-black-100 placeholder-rich-black-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-3 flex items-center"
                >
                  {showNewPassword ? <PiEyeDuotone/> : <IoEyeOff/>}
                </button>
              </div>
            </div>

            <div className="mt-2 flex flex-row-reverse gap-3 col-span-2">
              <button 
              type='submit'
              className="bg-amber-400 text-rich-black-900 font-semibold px-4 py-1.5 rounded-md text-sm hover:bg-amber-300 transition-colors">
                Change Password
              </button>
              {/* <button className="bg-rich-black-700 text-rich-black-100 font-semibold px-4 py-1.5 rounded-md text-sm hover:bg-slate-500 transition-colors">
                Cancel
              </button> */}
            </div>
          </form>
        </div>

        {/* --- Section 4: Delete Account --- */}
        <div className="bg-rose-900/20 border border-rose-500/30 rounded-xl p-6 flex items-start gap-6 z-40">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-rose-900/30 flex items-center justify-center">
            <TrashIcon />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-rich-black-100">Delete Account</h3>
            <p className="text-sm text-rich-black-400 mt-1 leading-relaxed">
              Would you like to delete your account?<br />
              This account contains Paid Courses. Deleting your account will remove all the content associated with it.
            </p>
            <a href="#delete" className="text-sm font-semibold text-rose-400 mt-4 inline-block hover:underline">
              I want to delete my account.
            </a>
          </div>
        </div>


      </div>
    </div>
  );
}

export default Setting;