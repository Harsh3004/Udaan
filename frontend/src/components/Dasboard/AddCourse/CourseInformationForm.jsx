import React, { useState, useEffect } from 'react';
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
  const { course, editCourse } = useSelector((state) => state.course);
  const dispatch = useDispatch();

  const { register, handleSubmit, control, formState: { errors }, setValue, getValues } = useForm({
    defaultValues: {
      title: '',
      description: '',
      price: '',
      category: '',
      tags: [], 
      courseThumbnail: null, 
      benefits: [], 
      requirements: '',
    },

    // We can add a 'mode' here like 'onBlur' for better performance
  });
  
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      setCategoryLoading(true);
      try{
        const response = await request(endpoints.GET_ALL_CATEGORIES_API,"GET");
        const data = await response.json();
        if(!response.ok){
          throw new Error(data.message || 'Unable to fetch categories');
        }
        const fetched = data.categories || [];
        setCategories(fetched);
        if(fetched.length === 0){
          setCategoryError('No categories found. Enter a name to create one.');
          setValue('category', '');
        }else{
          setCategoryError('');
          setValue('category', fetched[0].name || '');
        }
      }catch(error){
        console.error('Failed to load categories', error);
        setCategoryError(error.message || 'Failed to load categories');
        toast.error(error.message || 'Failed to load categories');
      }finally{
        setCategoryLoading(false);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    if (editCourse && course) {
      setValue('title', course.title);
      setValue('language', course.language);
      setValue('description', course.desc);
      setValue('price', course.price);
      setValue('category', course.category?.name || course.category);
      setValue('tags', course.tags || []); 
      setValue('requirements', course.instructions || []);
      setValue('courseThumbnail', course.thumbnail?.url || null);
      setValue('benefits', course.whatyouwilllearn);
    }
  }, [editCourse, course, setValue]);
  
  const submitHandler = async (data) => {
    if (editCourse) {
      const currentValues = getValues();
      const isChanged = 
        currentValues.title !== course.title ||
        currentValues.language !== course.language ||
        currentValues.description !== course.desc ||
        currentValues.price != course.price ||
        currentValues.category !== (course.category?.name || course.category) ||
        currentValues.benefits !== course.whatyouwilllearn ||
        data.courseThumbnail instanceof File;

      if (!isChanged && !(data.courseThumbnail instanceof File)) {
        toast.error("No changes made to the form");
        dispatch(setStep(2));
        return;
      }
    }

    const toastID = toast.loading(editCourse ? 'Updating Course...' : 'Creating Course...');
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
      if (data.courseThumbnail instanceof File) {
        formPayload.append("image", data.courseThumbnail); 
      }

      let response;
      if (editCourse) {
        response = await request(`${endpoints.UPDATE_COURSE_API.replace(':courseId', course._id)}`,"PUT",formPayload,token);
      } else {
        response = await request(endpoints.CREATE_COURSE_API,"POST",formPayload,token);
      }

      const result = await response.json();
      if(!response.ok){
        throw new Error(data.message || result.message);
      }
      
      console.log(response);
      if (editCourse) {
        const fetchCourse = await request(`${endpoints.GET_COURSE_DETAILS_API}/${course._id}`, 'GET');
        const fetchResult = await fetchCourse.json();
        if (fetchResult.success) {
           dispatch(setCourse(fetchResult.courseDetails));
        }
      } else {
        dispatch(setCourse(result.course));
      }

      toast.dismiss(toastID);
      toast.success(editCourse ? "Course Updated Successfully" : "Course Created Successfully");
      dispatch(setStep(2));
    }catch(error){
      toast.dismiss(toastID);
      toast.error(error.message || (editCourse ? "Course Update Failed" : "Course Creation Failed"))
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
              <input
                id="category"
                list="category-options"
                placeholder={categoryLoading ? 'Loading categories...' : 'Type or choose a category'}
                className={`w-full p-3 rounded-lg bg-rich-black-700 shadow-input-shadow text-rich-black-5 ${errors.category ? 'border-2 border-red-500' : ''}`}
                disabled={categoryLoading}
                {...register("category", {
                  required: 'Please enter a category',
                  validate: value => value.trim() !== '' || 'Please enter a valid category'
                })}
              />
              <datalist id="category-options">
                {categories.map(cat => (
                  <option key={cat._id} value={cat.name} />
                ))}
              </datalist>
            </div>
            {categoryError && <p className="text-xs text-red-500 mt-1">{categoryError}</p>}
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
            {(!categoryLoading && categories.length === 0) && (
              <p className="text-xs text-rich-black-200 mt-2">
                No categories yet. Enter a new category name to create one.
              </p>
            )}
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