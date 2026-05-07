import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { FaRegEdit } from "react-icons/fa";
import { Modal } from '../Modal';
import { logout } from '../../services/functions/auth';
import { NavLink, useNavigate } from 'react-router-dom';

export const Profile = () => {
    const {user} = useSelector((state) => state.profile);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    return (
        <div className='text-white flex flex-col items-center justify-center mt-10 gap-2'>
            <div className='flex bg-rich-black-800 p-6 justify-between items-center rounded-lg border border-rich-black-700 w-3/4 z-40'>
                <div className='flex items-center gap-5'>
                    <img 
                        src={user?.profileImage} 
                        alt="profile_image" 
                        width={40} 
                        className='rounded-full'
                        onError={(e) => {
                            if (!e.target.dataset.fallback) {
                                e.target.dataset.fallback = 'true';
                                e.target.src = `https://api.dicebear.com/7.x/initials/png?seed=${user?.fName || 'U'}${user?.lName || ''}&size=128`;
                            }
                        }}
                    />
                    <div>
                        <p className='font-semibold text-xl'>{user?.fName + " " + user?.lName}</p>
                        <p className='text-rich-black-200'>{user?.email}</p>
                    </div>
                </div>
                <NavLink to='/dashboard/setting' className='bg-yellow-50 px-4 py-2 text-rich-black-900 flex items-center gap-2 rounded-lg'>
                    <FaRegEdit/>
                    Edit
                </NavLink>
            </div>

            <div className='bg-rich-black-800 px-6 py-2 rounded-lg border border-rich-black-700 w-3/4'>
                    <div className='flex justify-between items-center'>
                        <p className='font-semibold text-lg'>About</p>
                        <NavLink to='/dashboard/setting' className='bg-yellow-50 px-4 py-2 text-rich-black-900 flex items-center gap-2 rounded-lg'>
                            <FaRegEdit/>
                            Edit
                        </NavLink>
                    </div>

                    <div className='pt-5 grid grid-rows-2 grid-cols-2 space-y-2'>
                        <div>
                            <p>{(user.additionalDetails.bio) ? user.additionalDetails.bio : "Add Bio"}</p>
                        </div>
                    </div>
            </div>

            <div className='bg-rich-black-800 px-6 py-2  rounded-lg border border-rich-black-700 z-40 w-3/4'>
                    <div className='flex justify-between items-center'>
                        <p className='font-semibold text-lg'>Personal Details</p>
                        <NavLink to='/dashboard/setting' className='bg-yellow-50 px-4 py-2 text-rich-black-900 flex items-center gap-2 rounded-lg'>
                            <FaRegEdit/>
                            Edit
                        </NavLink>
                    </div>

                    <div className='pt-5 grid grid-rows-2 grid-cols-2 space-y-5 justify-center items-start'>
                        <div>
                            <p className='font-normal text-sm text-rich-black-600 pt-5'>First Name</p>
                            <p>{user.fName}</p>
                        </div>
                        <div>
                            <p className='font-normal text-sm self-center text-rich-black-600'>Last Name</p>
                            <p>{user.lName}</p>
                        </div>
                        <div>
                            <p className='font-normal text-sm text-rich-black-600'>Email</p>
                            <p>{user.email}</p>
                        </div>
                        <div>
                            <p className='font-normal text-sm text-rich-black-600'>Phone Number</p>
                            <p>{user.additionalDetails.mobile ? user.additionalDetails.mobile : "Add Contact Number"}</p>
                        </div>
                        <div>
                            <p className='font-normal text-sm text-rich-black-600'>Gender</p>
                            <p>{user.additionalDetails.gender ? user.additionalDetails.gender : "Add Gender"}</p>
                        </div>
                        <div>
                            <p className='font-normal text-sm text-rich-black-600'>Date of Birth</p>
                            <p>{user.additionalDetails.dob ? user.additionalDetails.dob : "Add date of Birth"}</p>
                        </div>
                    </div>
            </div>

            {user.role === 'Instructor' && (
              <div className='bg-rich-black-800 px-6 py-2 rounded-lg border border-rich-black-700 w-3/4'>
                      <div className='flex justify-between items-center'>
                          <p className='font-semibold text-lg'>Bank Account Details</p>
                          <NavLink to='/dashboard/setting' className='bg-yellow-50 px-4 py-2 text-rich-black-900 flex items-center gap-2 rounded-lg'>
                              <FaRegEdit/>
                              Edit
                          </NavLink>
                      </div>

                      <div className='pt-5 grid grid-rows-2 grid-cols-2 space-y-2'>
                          <div>
                              <p className='font-normal text-sm text-rich-black-600 pt-5'>Account Holder Name</p>
                              <p>{user.additionalDetails.accountHolderName ? user.additionalDetails.accountHolderName : "Add Account Holder Name"}</p>
                          </div>
                          <div>
                              <p className='font-normal text-sm text-rich-black-600'>Account Number</p>
                              <p>{user.additionalDetails.accountNumber ? user.additionalDetails.accountNumber : "Add Account Number"}</p>
                          </div>
                          <div>
                              <p className='font-normal text-sm text-rich-black-600'>Bank Name</p>
                              <p>{user.additionalDetails.bankName ? user.additionalDetails.bankName : "Add Bank Name"}</p>
                          </div>
                          <div>
                              <p className='font-normal text-sm text-rich-black-600'>IFSC Code</p>
                              <p>{user.additionalDetails.ifscCode ? user.additionalDetails.ifscCode : "Add IFSC Code"}</p>
                          </div>
                          {user.additionalDetails.branchName && (
                            <div>
                                <p className='font-normal text-sm text-rich-black-600'>Branch Name</p>
                                <p>{user.additionalDetails.branchName}</p>
                            </div>
                          )}
                      </div>
              </div>
            )}

        </div>
    )
}
