import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { IoAddCircleOutline } from "react-icons/io5";
import { FaEdit } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { setStep } from '../../../slices/courseSlice';
import NestedView from './NestedView';
import { request } from '../../../services/operations/authApi';
import { endpoints } from '../../../services/api';
import { setCourse } from '../../../slices/courseSlice';

// Delete Section Pending

const CourseBuilder = () => {
  const {register, handleSubmit, setValue, formState: {errors}} = useForm();
  const dispatch = useDispatch();
  const course = useSelector((state) => state.course.course);
  const [editSectionName, seteditSectionName] = useState(null);
  console.log("Course: ",course);
  console.log("EditSection: ", editSectionName);

  const cancelEdit = () => {
    seteditSectionName(null);
    setValue("");
  }

  const gotoBack = () => {
    dispatch(setStep(1))
    seteditSectionName(null)
  }
  
  const gotoNext = () => {
    if(course.section.length == 0){
      toast.error("Atleast one section in the Course is required...");
      return ;
    }
    dispatch(setStep(3))
    seteditSectionName(null)
  }

  const sectionHandler = async (data) => {
    const toastId = toast.loading("Creating Section");
    data['courseId'] = course._id;
    console.log("Section Details: ",data);

    try{
      if(editSectionName){
        data['sectionId'] = editSectionName;
        const response = await request(endpoints.UPDATE_SECTION_API, "PUT", data);
        console.log(response);

        if(!response.ok)
          throw new Error("Error while editing section");

        try{
          const courseRequest = await request(`${endpoints.GET_COURSE_DETAILS_API}/${course._id}`,'GET');
          if(!courseRequest.ok)
            throw new Error("Error while fetching course")
          
          const courseResponse = await courseRequest.json();
          dispatch(setCourse(courseResponse.courseDetails));
        }catch(error){
          console.log(error.message);
        }
        
        toast.dismiss(toastId);
        toast.success("Course Edited Successfully");
      }
      else{
        const response = await request(endpoints.CREATE_SECTION_API,"POST",data);
        console.log(response);

        if(!response.ok)
          throw new Error("Error while creating section..");
        
        try {
            const courseRequest = await request(`${endpoints.GET_COURSE_DETAILS_API}/${course._id}`, 'GET');
            if (!courseRequest.ok)
                throw new Error("Error while fetching course");
            
            const courseResponse = await courseRequest.json();
            dispatch(setCourse(courseResponse.courseDetails));
        } catch (error) {
            console.error("Error re-fetching course:", error.message);
        }
        toast.dismiss(toastId);
        toast.success("Section Created Successfully");
      }
    }catch(error){
      toast.dismiss(toastId);
      toast.error("Try Again Later");
    }
  }

  const handleChangeEditSectionName = () => {
    if(editSectionName === sectionId){
      cancelEdit();
      return ;
    }

    seteditSectionName(sectionId);
    setValue("sectionName",sectionName);
  }

  return (
    <div className='z-40 bg-rich-black-800 max-w-xl mx-auto p-6 rounded-xl border border-rich-black-700 mt-6 flex flex-col gap-6'>
      <form onSubmit={handleSubmit(sectionHandler)} className='flex flex-col gap-6'>
        <p className='text-2xl font-semibold'>Course Builder</p>
        <div className='w-full'>
          <label htmlFor="sectionName" className='block text-sm font-normal mb-2 text-rich-black-5'>
            Section Name <sup className='text-red-500'>*</sup>
          </label>
          <input
           type="text"
           name='sectionName'
           placeholder='Add a section to build your course'
           {...register("title",{required: true,minLength:{value: 2,message: 'Empty String is Invalid'}})}
           className='w-full bg-rich-black-700 rounded-lg p-3 shadow-input-shadow outline-none'
          />
          {errors.sectionName && <p className="text-xs text-red-500">Section Name is Required</p>}
        </div>

        <div className='flex items-end gap-5'>
          {editSectionName ? 
            <>
              <button 
                type='submit'
                className='flex items-center gap-2 font-medium text-yellow-50 border rounded-lg px-6 py-3 w-fit border-yellow-50'
              >
                <FaEdit className='text-lg'/>
                <span className='text-lg'>Edit Section Name</span>
              </button>
              <div onClick={cancelEdit} className='text-rich-Black-300 border-b'>
                Cancel Edit
              </div>
            </>
          : (
            <button 
              type='submit'
              className='flex items-center gap-2 font-medium text-yellow-50 border rounded-lg px-6 py-3 w-fit border-yellow-50'
            >
              <IoAddCircleOutline className='text-lg'/>
              <span className='text-lg'>Create Section</span>
            </button>
          )}
        </div>
      </form>

      {
        course?.section.length > 0 &&
        <NestedView seteditSectionName={seteditSectionName}/>
      }

      <div className='flex gap-3 justify-end'>
        <div className='flex items-center gap-1 shadow-button-shadow bg-rich-black-800 px-6 py-3 rounded-lg font-medium text-rich-black-5'
        onClick={gotoBack}
        >
          <IoIosArrowBack /> Back
        </div>
        <div className='flex items-center gap-1 shadow-yellow-button-shadow bg-yellow-50 text-rich-black-900 px-6 py-3 rounded-lg font-medium'
        onClick={gotoNext}
        >
          Next <IoIosArrowForward /> 
        </div>
      </div>
    </div>
  )
}

export default CourseBuilder