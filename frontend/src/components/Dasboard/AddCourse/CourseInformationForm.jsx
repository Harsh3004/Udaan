import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useForm, Controller, Form } from 'react-hook-form';
import { FaChevronRight } from "react-icons/fa";
import { endpoints } from '../../../services/api';
import { request } from '../../../services/operations/authApi';
import toast from 'react-hot-toast';

// --- Tag Component ---
const Tag = ({ tag, onRemove }) => (
  <div className="inline-flex items-center px-3 py-1 mr-2 mb-2 text-sm rounded-full bg-gray-700 text-white shadow-md">
    {tag}
    <button
      onClick={onRemove}
      className="ml-2 text-gray-400 hover:text-white transition-colors"
      aria-label={`Remove tag: ${tag}`}
    >
      &times;
    </button>
  </div>
);

// --- Tag Input Component ---
// Note: 'field' comes from the RHF Controller's render prop
const TagInput = ({ label, placeholder, field }) => {
  // RHF sets the initial value of field.value to the default value, which should be an array
  const tags = field.value || []; 
  const [inputValue, setInputValue] = useState('');
  
  const addTags = useCallback((input) => {
    const newTags = input.split(/[\s,]+/) // Split by space or comma
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0 && !tags.includes(tag));
    
    if (newTags.length > 0) {
      // Use field.onChange to update the RHF state
      field.onChange([...tags, ...newTags]);
    }
  }, [tags, field]); // Dependency on field is crucial for RHF update
  
  const handleKeyDown = (e) => {
    // If Enter, Comma, or Tab key is pressed
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      e.preventDefault();
      addTags(inputValue);
      setInputValue('');
    }
  };
  
  const handleBlur = () => {
    addTags(inputValue);
    setInputValue('');
  };
  
  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    field.onChange(updatedTags);
  };
  
  return (
    <div className="mb-6">
      <label className="block text-sm font-normal mb-2 text-rich-black-5">
        {label}
      </label>
      
      {/* Existing Tags */}
      {tags.map((tag, index) => (
        <Tag key={index} tag={tag} onRemove={() => handleRemoveTag(tag)} />
      ))}

      <div 
        className="p-3 rounded-lg focus-within:ring-1 focus-within:ring-yellow-500 min-h-[44px] bg-rich-black-700 shadow-input-shadow text-rich-black-200"
      >
        <div className="flex flex-wrap items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="flex-grow bg-transparent outline-none text-white placeholder-rich-black-200 mt-1 min-w-[100px]"
            // RHF register is not needed here as we manage value/onChange manually and pipe updates via field.onChange
          />
        </div>
      </div>
    </div>
  );
};

const Requirement = ({ requirement, onRemove }) => (
  <div className="w-fit flex items-center px-3 py-1 mr-2 my-2 text-sm rounded-full bg-gray-700 text-white shadow-md">
    {requirement}
    <button
      onClick={onRemove}
      className="ml-2 text-gray-400 hover:text-white transition-colors"
      aria-label={`Remove tag: ${requirement}`}
    >
      &times;
    </button>
  </div>
);

const RequirementsInput = ({ label, placeholder, field }) => {
  const requirements = field.value || []; 
  const [inputValue, setInputValue] = useState('');

  const addRequirement = useCallback((input) => {
    const newRequirement = input.trim();

    if (newRequirement.length > 0)
      field.onChange([...requirements, newRequirement]);
    
  }, [requirements, field]); // Dependency on field is crucial for RHF update

  const handleKeyDown = (e) => {
    // If Enter key is pressed
    if (e.key === 'Enter') {
      e.preventDefault();
      addRequirement(inputValue);
      setInputValue('');
    }
  };

  const handleBlur = () => {
    addRequirement(inputValue);
    setInputValue('');
  };

  const handleRemoveRequirement = (requirementToRemove) => {
    const updatedRequirements = requirements.filter(requirement => requirement !== requirementToRemove);
    field.onChange(updatedRequirements);
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-normal mb-2 text-rich-black-5">
        {label}
      </label>
      

      <div 
        className="p-3 rounded-lg focus-within:ring-1 focus-within:ring-yellow-500 min-h-[44px] bg-rich-black-700 shadow-input-shadow text-rich-black-200"
        >
        <div className="flex flex-wrap items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={requirements.length === 0 ? placeholder : ''}
            className="flex-grow bg-transparent outline-none text-white placeholder-rich-black-200 mt-1 min-w-[100px]"
            />
        </div>
      </div>

      {/* Existing Requirements */}
      {requirements.map((requirement, index) => (
        <Requirement key={index} requirement={requirement} onRemove={() => handleRemoveRequirement(requirement)} />
      ))}
    </div>
  );
};

// --- File Uploader with Preview (using RHF Controller) ---
const ThumbnailUploader = ({ field, error }) => {
  const fileInputRef = useRef(null);
  const file = field.value;
  const [previewURL, setpreviewURL] = useState(null);

  useEffect(() => {
    // This effect runs whenever the File object changes
    if(file){
      const url = URL.createObjectURL(file);
      setpreviewURL(url);
      
      // Cleanup function: revoke the object URL when the component unmounts 
      // or the file changes to prevent memory leaks
      return () => {
        URL.revokeObjectURL(url);
        setpreviewURL(null);
      };
    } else {
      setpreviewURL(null);
    }
  }, [file]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      field.onChange(selectedFile);
      // UseEffect will handle preview url
    }
    else {
      field.onChange(null);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      handleFileChange({ target: { files: [droppedFile] } });
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2 text-rich-black-5">
        Course Thumbnail <span className="text-red-500">*</span>
      </label>
      <div
        className={`w-full h-64 rounded-lg border-2 border-dashed ${error ? 'border-red-500' : 'border-rich-black-600'} flex flex-col items-center justify-center p-6 cursor-pointer transition-colors duration-200 relative overflow-hidden bg-rich-black-700 text-rich-black-200`}
        onClick={handleClick}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          onClick={(e) => e.target.value = null}
        />

        {previewURL ? (
          <img 
            src={previewURL} 
            alt="Course Thumbnail Preview" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <svg 
              className="mx-auto h-12 w-12 text-rich-Black-300" 
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2zM9 13l3-3m0 0l3 3m-3-3v8" />
            </svg>
            <p className="text-sm mt-2 text-rich-Black-300">
              Drag and drop an image, or <span className="text-yellow-500 font-semibold hover:text-yellow-400">Browse</span>
            </p>
            <div className="flex justify-center text-xs mt-2 space-x-4 text-rich-Black-300">
              <span>• Aspect ratio 16:9</span>
              <span>• Recommended size 1024x576</span>
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
    </div>
  );
};

// --- Custom input component for standard text fields (using RHF register) ---
const TextInput = ({ label, name, placeholder, type = 'text', rows, register, validation, error }) => (
  <div className="mb-6">
    <label htmlFor={name} className="block text-sm font-normal mb-2 text-rich-black-5">
      {label} <span className="text-red-500">*</span>
    </label>
    {rows ? (
      <textarea
        id={name}
        placeholder={placeholder}
        rows={rows}
        className={`w-full p-3 rounded-lg outline-none resize-y bg-rich-black-700 shadow-input-shadow text-rich-black-5 ${error ? 'border-2 border-red-500' : ''}`}
        {...register(name, validation)}
      />
    ) : (
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        className={`w-full p-3 rounded-lg outline-none bg-rich-black-700 shadow-input-shadow text-rich-black-5 ${error ? 'border-2 border-red-500' : ''}`}
        {...register(name, validation)}
      />
    )}
    {error && <p className="text-xs text-red-500">{error.message}</p>}
  </div>
);


// --- Main Application Component ---
const CourseInformationForm = ({setcurrStep}) => {
  const user = useSelector((state) => state.profile);
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      price: '',
      category: 'default',
      tags: [], 
      thumbnailUrl: null, 
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
      if (data.thumbnailUrl) {
        formPayload.append("image", data.thumbnailUrl); 
      }

      const response = await request(endpoints.CREATE_COURSE_API,"POST",formPayload);
      console.log(response);
      toast.dismiss(toastID);
      toast.success("Course Created Successfully");
      setcurrStep(2);
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
        {/* Use handleSubmit from RHF */}
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">

          {/* Course Title */}
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

          {/* Course Short Description */}
          <TextInput
            label="Course Short Description"
            name="description"
            placeholder="Enter Description"
            rows={4}
            register={register}
            error={errors.description}
            validation={{ required: 'Description is required' }}
          />

          {/* Price */}
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

          {/* Category */}
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


          {/* Course Thumbnail - Controller for Custom Uploader Component */}
          <Controller
            name="thumbnailUrl"
            control={control}
            rules={{ required: 'Course Thumbnail is required' }}
            render={({ field }) => (
              <ThumbnailUploader 
                field={field}
                error={errors.thumbnailUrl}
              />
            )}
          />

          {/* Benefits of the course*/}
          <TextInput
            label="Benefits of the course"
            name="benefits"
            placeholder="Enter benefits of the course"
            rows={2}
            register={register}
            error={errors.benefits}
            validation={{ required: 'Benefits are required' }}
          />

          {/* Requirements of the course*/}
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

          {/* Next Button */}
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