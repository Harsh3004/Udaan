import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller, Form } from 'react-hook-form';
import { FaChevronRight } from "react-icons/fa";
import { endpoints } from '../../../services/api';
import { request } from '../../../services/operations/authApi';
import toast from 'react-hot-toast';
import { setCourse, setStep } from '../../../slices/courseSlice';
import { TagInput, RequirementsInput, ThumbnailUploader, TextInput } from '../../Common/Inputs';

const CourseInformationForm = () => {
  const user = useSelector((state) => state.profile);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      price: '',
      category: 'default',
      tags: [], 
      courseThumbnail: null, 
      benefits: [], 
      requirements: '',
    },

    // We can add a 'mode' here like 'onBlur' for better performance
  });
  
  const categories = [
    { value: 'default', label: 'Choose a Category' },
    { value: 'programming', label: 'Programming' },
    { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' },
  ];
  
  const submitHandler = async (data) => {
    const toastID = toast.loading('Creating Course');
    console.log( 'Form Data:', data);
    try{
      const formPayload = new FormData();
      formPayload.append("title", data.title);
      formPayload.append("language", data.language);
      formPayload.append("desc", data.description);
      formPayload.append("price", data.price);
      formPayload.append("category", data.category);
      formPayload.append("whatyouwilllearn", data.benefits);

      // For arrays (tags and requirements), we need to stringify them or append individually
      // Stringifying as JSON is generally cleaner for array data
      formPayload.append("tags", JSON.stringify(data.tags)); 
      formPayload.append("instructions", JSON.stringify(data.requirements));
      formPayload.append("user", user.user._id)
      if (data.courseThumbnail) {
        formPayload.append("image", data.courseThumbnail); 
      }

      const response = await request(endpoints.CREATE_COURSE_API,"POST",formPayload,token);
      const result = await response.json();
      if(!response.ok){
        throw new Error(data.message);
      }
      
      console.log(response);
      dispatch(setCourse(result.course));
      toast.dismiss(toastID);
      toast.success("Course Created Successfully");
      dispatch(setStep(2));
    }catch(error){
      toast.dismiss(toastID);
      toast.error(error.message || "Course Creation Failed")
      console.log("Error while Creating Course...", error);
    }
  }

  return (
    <div className="sm:p-8 md:py-6 md:px-2 z-40">
      {/* Form Container */}
      <div className="max-w-xl mx-auto p-6 rounded-xl border border-rich-black-700 bg-rich-black-800" >
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">

          <TextInput
            label="Course Title"
            name="title"
            placeholder="Enter Course Title"
            register={register}
            error={errors.title}
            validation={{ required: 'Course Title is required' }}
          />

          <TextInput
            label="Language"
            name="language"
            placeholder="Enter Course Language"
            register={register}
            error={errors.language}
            validation={{ required: 'Course Language is required' }}
          />

          <TextInput
            label="Course Short Description"
            name="description"
            placeholder="Enter Description"
            rows={4}
            register={register}
            error={errors.description}
            validation={{ required: 'Description is required' }}
          />

          <TextInput
            label="Price"
            name="price"
            placeholder="Enter Price"
            type="number"
            register={register}
            error={errors.price}
            validation={{ 
              required: 'Price is required',
            }}
          />

          <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-medium mb-2 text-rich-black-5">
              Category 
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="category"
                className={`w-full p-3 rounded-lg appearance-none cursor-pointer bg-rich-black-700 shadow-input-shadow text-rich-black-5 ${errors.category ? 'border-2 border-red-500' : ''}`}
                {...register("category", { 
                  required: 'Please select a category',
                  validate: value => value !== 'default' || 'Please select a valid category'
                })}
              >
                {categories.map(cat => (
                  <option 
                    key={cat.value} 
                    value={cat.value}
                    disabled={cat.value === 'default'}
                    className='text-rich-black-5 bg-rich-black-700'
                  >
                    {cat.label}
                  </option>
                ))}
              </select>
              {/* Custom arrow for select box */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <svg className="h-4 w-4 text-rich-Black-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
          </div>

          {/* Tags - Controller for Custom TagInput Component */}
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <TagInput
                label="Tags"
                placeholder="Add tags (e.g., react, javascript, ui) separated by space or comma"
                field={field}
              />
            )}
          />
          {errors.tags && <p className="text-xs text-red-500 mt-1 mb-6">{errors.tags.message}</p>}

          <Controller
            name="courseThumbnail"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <ThumbnailUploader
                label="Course Thumbnail"
                field={field}
                error={error}
                fileType="image"
                helperText={
                  <>
                    <span>• Aspect ratio 16:9</span>
                    <span>• Recommended size 1024x576</span>
                  </>
                }
              />
            )}
          />

          <TextInput
            label="Benefits of the course"
            name="benefits"
            placeholder="Enter benefits of the course"
            rows={2}
            register={register}
            error={errors.benefits}
            validation={{ required: 'Benefits are required' }}
          />

          <Controller
            name="requirements"
            control={control}
            render={({ field }) => (
              <RequirementsInput
                label="Requirements/Instructions"
                placeholder="Enter Requirements/Instructions"
                field={field}
              />
            )}
          />
          {errors.requirements && <p className="text-xs text-red-500 mt-1 mb-6">{errors.requirements.message}</p>}

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex justify-center items-center gap-2 py-3 px-5 rounded-lg font-semibold text-black transition-colors duration-200 hover:bg-yellow-400 bg-yellow-50"
            >
              Next
              <FaChevronRight/>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CourseInformationForm;