import React from 'react'
import { IoIosArrowBack } from 'react-icons/io'
import { useDispatch, useSelector } from 'react-redux';
import { setStep } from '../../../slices/courseSlice';
import toast from 'react-hot-toast';
import { request } from '../../../services/operations/authApi';
import { endpoints } from '../../../services/api';

export const Publish = () => {
  const dispatch = useDispatch();
  const course = useSelector((state) => state.course.course);
  const token = useSelector((state) => state.auth.token);

  const gotoBack = () => {
    console.log("Back");
    dispatch(setStep(2))
  }

  const PublishHandler = () => {
    if(!course?._id){
      toast.error('Create course details first');
      dispatch(setStep(1));
      return;
    }

    const toastId = toast.loading('Publishing course...');
    request(
      endpoints.UPDATE_COURSE_API.replace(':courseId', course._id),
      'PUT',
      { status: 'Published' },
      token
    )
    .then(async (response) => {
      const data = await response.json();
      if(!response.ok){
        throw new Error(data.message || 'Publish failed');
      }
      toast.success('Course published');
    })
    .catch((error) => {
      toast.error(error.message || 'Publish failed');
    })
    .finally(() => {
      toast.dismiss(toastId);
    });
  }

  return (
    <div className='z-40 bg-rich-black-800 max-w-xl mx-auto p-6 rounded-xl border border-rich-black-700 mt-6 flex flex-col gap-6'>
        <p className='font-semibold text-2xl text-rich-black-5'>Publish Settings</p>

        <div className='flex gap-3 justify-end'>
          <div className='flex items-center gap-1 shadow-button-shadow bg-rich-black-800 px-6 py-3 rounded-lg font-medium text-rich-black-5'
          onClick={gotoBack}
          >
            <IoIosArrowBack /> Back
          </div>
          <div className='flex items-center gap-1 shadow-yellow-button-shadow bg-yellow-50 text-rich-black-900 px-6 py-3 rounded-lg font-medium'
          onClick={PublishHandler}
          >
            Publish 
          </div>
        </div>
    </div>
  )
}