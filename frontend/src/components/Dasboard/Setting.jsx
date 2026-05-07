import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { IoEyeOff } from "react-icons/io5";
import { PiEyeDuotone } from "react-icons/pi";
import toast from 'react-hot-toast';
import { endpoints } from '../../services/api';
import { request } from '../../services/operations/authApi';
import { setUser } from '../../slices/profileSlice';
import { Modal } from '../Modal';
import { deleteAccount } from '../../services/functions/auth';
import { useNavigate } from 'react-router-dom';

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-rich-black-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-rose-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.144-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.057-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const Setting = () => {
  const { user } = useSelector((state) => state.profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [previewImage, setPreviewImage] = useState(user.profileImage);
  const [profileImageFile, setprofileImageFile] = useState(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [data, setData] = useState({ password: '', newPassword: '' });
  
  const initialFormData = {
    displayName: user.fName + " " + user.lName,
    profession: 'Developer',
    dob: '',
    gender: '',
    phone: '',
    about: '',
    accountHolderName: user.additionalDetails?.accountHolderName || '',
    accountNumber: user.additionalDetails?.accountNumber || '',
    bankName: user.additionalDetails?.bankName || '',
    ifscCode: user.additionalDetails?.ifscCode || '',
    branchName: user.additionalDetails?.branchName || '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setprofileImageFile(file);
      setPreviewImage(imageUrl);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(user.profileImage);
    setprofileImageFile(null);
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setPreviewImage(user.profileImage);
    setprofileImageFile(null);
  };

  const changePasswordHandler = async (e) => {
    e.preventDefault();
    const toastId = toast.loading(`Changing Password`);
    try {
      data.userId = user._id;
      const res = await request(endpoints.CHANGE_PASSWORD_API, "PUT", data);
      
      if (!res.ok) {
        throw new Error(res.message || res.statusText || "Failed to change password");
      }

      toast.dismiss(toastId);
      toast.success(`Password Changed Successfully`);
      setData({ password: '', newPassword: '' });
    } catch (err) {
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

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleGenderChange = (e) => {
    setFormData(prev => ({
      ...prev,
      gender: e.target.id
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const toastId = toast.loading(`Updating Profile`);
    const formPayload = new FormData();
    
    if (profileImageFile) formPayload.append('file', profileImageFile);

    if (formData.displayName !== (user.fName + " " + user.lName)) {
      const name = formData.displayName.split(' ');
      formPayload.append('fName', name[0]);
      formPayload.append('lName', name.slice(1).join(' '));
    }

    if (formData.profession) formPayload.append('profession', formData.profession);
    if (formData.dob !== '') formPayload.append('dob', formData.dob);
    if (formData.gender !== '') formPayload.append('gender', formData.gender);
    if (formData.phone !== '') formPayload.append('mobile', formData.phone);
    if (formData.about !== '') formPayload.append('bio', formData.about);
    if (formData.accountHolderName !== '') formPayload.append('accountHolderName', formData.accountHolderName);
    if (formData.accountNumber !== '') formPayload.append('accountNumber', formData.accountNumber);
    if (formData.bankName !== '') formPayload.append('bankName', formData.bankName);
    if (formData.ifscCode !== '') formPayload.append('ifscCode', formData.ifscCode.toUpperCase());
    if (formData.branchName !== '') formPayload.append('branchName', formData.branchName);

    formPayload.append('user', user._id);

    try {
      const res = await request(endpoints.UPDATE_PROFILE_API, "PUT", formPayload);
      if (!res.ok) throw new Error(res.message);

      const response = await res.json();
      dispatch(setUser(response.userObject));
      localStorage.setItem("token", JSON.stringify(response.userObject.token));
      localStorage.setItem("user", JSON.stringify(response.userObject));

      toast.dismiss(toastId);
      toast.success(`Profile Updated Successfully.`);
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.message);
    }
  };

  const handleDeleteAccountConfirm = () => {
    deleteAccount(dispatch, navigate);
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <div className="min-h-screen flex justify-center items-center p-4 sm:p-6 lg:p-8 z-40">
        <div className="max-w-3xl w-full space-y-6 z-40">
          <form onSubmit={handleSave} className="flex flex-col gap-6">

            {/* --- Section 1: Profile Picture --- */}
            <div className="bg-rich-black-800 border border-rich-black-700 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6 z-40">
               <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-rich-black-600">
               <img
                   src={previewImage}
                   alt="User profile"
                   className="w-full h-full object-cover"
                   onError={(e) => {
                       if (!e.target.dataset.fallback) {
                           e.target.dataset.fallback = 'true';
                           e.target.src = `https://api.dicebear.com/7.x/initials/png?seed=${user?.fName || 'U'}${user?.lName || ''}&size=128`;
                       }
                   }}
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
                    type="button"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Display Name */}
                <div className="flex flex-col space-y-2">
                  <label htmlFor="displayName" className="text-sm font-medium text-rich-black-400">Display Name</label>
                  <input
                    type="text"
                    id="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full bg-rich-black-800 border border-rich-black-600 rounded-md px-3 py-2 text-rich-black-100 placeholder-rich-black-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500">
                    Name entered above will be used for all issued certificates.
                  </p>
                </div>

                {/* Profession */}
                <div className="flex flex-col space-y-2">
                  <label htmlFor="profession" className="text-sm font-medium text-rich-black-400">Profession</label>
                  <select
                    id="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    className="w-full bg-rich-black-800 border border-rich-black-600 rounded-md px-3 py-2 text-rich-black-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Developer</option>
                    <option>Designer</option>
                    <option>Manager</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div className="flex flex-col space-y-2">
                  <label htmlFor="dob" className="text-sm font-medium text-rich-black-400">Date of Birth</label>
                  <div className="relative">
                    <input
                      type="text"
                      id="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      placeholder="dd/mm/yyyy"
                      className="w-full bg-rich-black-800 border border-rich-black-600 rounded-md pl-3 pr-10 py-2 text-rich-black-100 placeholder-rich-black-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
                      <input
                        type="radio"
                        name="gender"
                        id="male"
                        checked={formData.gender === 'male'}
                        onChange={handleGenderChange}
                        className="hidden peer"
                      />
                      <span className="w-5 h-5 border-2 border-slate-500 rounded-full peer-checked:border-amber-400 relative flex items-center justify-center">
                        <span className="w-2.5 h-2.5 bg-amber-400 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></span>
                      </span>
                      Male
                    </label>
                    <label htmlFor="female" className="flex items-center gap-2 cursor-pointer text-sm text-slate-200">
                      <input
                        type="radio"
                        name="gender"
                        id="female"
                        checked={formData.gender === 'female'}
                        onChange={handleGenderChange}
                        className="hidden peer"
                      />
                      <span className="w-5 h-5 border-2 border-slate-500 rounded-full peer-checked:border-amber-400 relative flex items-center justify-center">
                        <span className="w-2.5 h-2.5 bg-amber-400 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></span>
                      </span>
                      Female
                    </label>
                    <label htmlFor="other" className="flex items-center gap-2 cursor-pointer text-sm text-slate-200">
                      <input
                        type="radio"
                        name="gender"
                        id="other"
                        checked={formData.gender === 'other'}
                        onChange={handleGenderChange}
                        className="hidden peer"
                      />
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
                    <select
                      id="countryCode"
                      className="bg-rich-black-800 border border-rich-black-600 rounded-md px-3 py-2 text-rich-black-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>+91</option>
                      <option>+1</option>
                    </select>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="12345 67890"
                      className="flex-grow bg-rich-black-800 border border-rich-black-600 rounded-md px-3 py-2 text-rich-black-100 placeholder-rich-black-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* About */}
                <div className="flex flex-col space-y-2">
                  <label htmlFor="about" className="text-sm font-medium text-rich-black-400">About</label>
                  <textarea
                    id="about"
                    value={formData.about}
                    onChange={handleChange}
                    className="w-full bg-rich-black-800 border border-rich-black-600 rounded-md px-3 py-2 text-rich-black-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                  </textarea>
                </div>
              </div>
            </div>

            {/* --- Bank Account Details (Instructors Only) --- */}
            {user.role === 'Instructor' && (
              <div className="bg-rich-black-800 border border-rich-black-700 rounded-xl mt-6 p-6 z-40">
                <h2 className="text-lg font-semibold text-rich-black-5 mb-6">Bank Account Details</h2>
                <p className="text-sm text-rich-black-400 mb-6">Add your bank account information to receive payments for your courses.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Account Holder Name */}
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="accountHolderName" className="text-sm font-medium text-rich-black-400">Account Holder Name</label>
                    <input
                      type="text"
                      id="accountHolderName"
                      value={formData.accountHolderName}
                      onChange={handleChange}
                      placeholder="Enter account holder name"
                      className="w-full bg-rich-black-800 border border-rich-black-600 rounded-md px-3 py-2 text-rich-black-100 placeholder-rich-black-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Account Number */}
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="accountNumber" className="text-sm font-medium text-rich-black-400">Account Number</label>
                    <input
                      type="text"
                      id="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      placeholder="Enter account number"
                      className="w-full bg-rich-black-800 border border-rich-black-600 rounded-md px-3 py-2 text-rich-black-100 placeholder-rich-black-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Bank Name */}
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="bankName" className="text-sm font-medium text-rich-black-400">Bank Name</label>
                    <input
                      type="text"
                      id="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      placeholder="Enter bank name"
                      className="w-full bg-rich-black-800 border border-rich-black-600 rounded-md px-3 py-2 text-rich-black-100 placeholder-rich-black-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* IFSC Code */}
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="ifscCode" className="text-sm font-medium text-rich-black-400">IFSC Code</label>
                    <input
                      type="text"
                      id="ifscCode"
                      value={formData.ifscCode}
                      onChange={handleChange}
                      placeholder="Enter IFSC code"
                      className="w-full bg-rich-black-800 border border-rich-black-600 rounded-md px-3 py-2 text-rich-black-100 placeholder-rich-black-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{textTransform: 'uppercase'}}
                    />
                  </div>

                  {/* Branch Name */}
                  <div className="flex flex-col space-y-2 md:col-span-2">
                    <label htmlFor="branchName" className="text-sm font-medium text-rich-black-400">Branch Name (Optional)</label>
                    <input
                      type="text"
                      id="branchName"
                      value={formData.branchName}
                      onChange={handleChange}
                      placeholder="Enter branch name"
                      className="w-full bg-rich-black-800 border border-rich-black-600 rounded-md px-3 py-2 text-rich-black-100 placeholder-rich-black-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-row-reverse gap-3">
              <button
                type="submit"
                className="bg-amber-400 text-rich-black-900 font-semibold px-4 py-1.5 rounded-md text-sm hover:bg-amber-300 transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-rich-black-700 text-rich-black-100 font-semibold px-4 py-1.5 rounded-md text-sm hover:bg-slate-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>

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
                    value={data.password}
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
                    {showCurrentPassword ? <PiEyeDuotone className="text-rich-black-400" /> : <IoEyeOff className="text-rich-black-400" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <label htmlFor="changePassword" className="text-sm font-medium text-rich-black-400">New Password *</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    onChange={handleInputChange}
                    value={data.newPassword}
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
                    {showNewPassword ? <PiEyeDuotone className="text-rich-black-400" /> : <IoEyeOff className="text-rich-black-400" />}
                  </button>
                </div>
              </div>

              <div className="mt-2 flex flex-row-reverse gap-3 col-span-2">
                <button
                  type='submit'
                  className="bg-amber-400 text-rich-black-900 font-semibold px-4 py-1.5 rounded-md text-sm hover:bg-amber-300 transition-colors">
                  Change Password
                </button>
              </div>
            </form>
          </div>
          
          {/* --- Section 4: Delete Account --- */}
          <div className="bg-rose-900/20 border border-rose-500/30 rounded-xl p-6 flex items-start gap-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-rose-900/30 flex items-center justify-center">
              <TrashIcon />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-rich-black-100">Delete Account</h3>
              <p className="text-sm text-rich-black-400 mt-1 leading-relaxed">
                Would you like to delete your account?<br />
                This account may contain Paid Courses. Deleting your account will remove all content associated with it.
              </p>
              
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="text-sm font-semibold text-rose-400 mt-4 inline-block hover:underline"
              >
                I want to delete my account.
              </button>
            </div>
          </div>

        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccountConfirm}
        title="Are you Sure?"
        confirmText="Delete"
      >
        <p>This will permanently delete your account and all associated data. This action cannot be undone.</p>
      </Modal>
    </>
  );
}

export default Setting;