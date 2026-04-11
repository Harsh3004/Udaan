import { useState, useCallback, useRef, useEffect } from 'react';

// --- Tag Component ---
export const Tag = ({ tag, onRemove }) => (
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
export const TagInput = ({ label, placeholder, field }) => {
  const tags = field.value || []; 
  const [inputValue, setInputValue] = useState('');
  
  const addTags = useCallback((input) => {
    const newTags = input.split(/[\s,]+/)
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0 && !tags.includes(tag));
    
    if (newTags.length > 0) {
      field.onChange([...tags, ...newTags]);
    }
  }, [tags, field]); 
  
  const handleKeyDown = (e) => {
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
      
      <div 
        className="p-3 rounded-lg focus-within:ring-1 focus-within:ring-yellow-500 min-h-[44px] bg-rich-black-700 shadow-input-shadow text-rich-black-200"
      >
        <div className="flex flex-wrap items-center">
          {/* Existing Tags */}
          {tags.map((tag, index) => (
            <Tag key={index} tag={tag} onRemove={() => handleRemoveTag(tag)} />
          ))}

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="flex-grow bg-transparent outline-none text-white placeholder-rich-black-200 mt-1 min-w-[100px]"
          />
        </div>
      </div>
    </div>
  );
};

// --- Requirement Component ---
export const Requirement = ({ requirement, onRemove }) => (
  <div className="inline-flex items-center px-3 py-1 mr-2 mb-2 text-sm rounded-full bg-gray-700 text-white shadow-md">
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

// --- Requirements Input Component ---
export const RequirementsInput = ({ label, placeholder, field }) => {
  const requirements = field.value || []; 
  const [inputValue, setInputValue] = useState('');

  const addRequirement = useCallback((input) => {
    const newRequirement = input.trim();

    if (newRequirement.length > 0)
      field.onChange([...requirements, newRequirement]);
    
  }, [requirements, field]); 

  const handleKeyDown = (e) => {
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
      {/* CHANGED: Added a 'div' with 'flex flex-wrap' here.
        This ensures that the list of requirements will wrap to new
        lines on smaller screens, just like the tags do.
      */}
      <div className="flex flex-wrap mt-3">
        {requirements.map((requirement, index) => (
          <Requirement key={index} requirement={requirement} onRemove={() => handleRemoveRequirement(requirement)} />
        ))}
      </div>
    </div>
  );
};

// --- Benefit Component ---
export const Benefit = ({ benefit, onRemove }) => (
  <div className="inline-flex items-center px-3 py-1 mr-2 mb-2 text-sm rounded-full bg-gray-700 text-white shadow-md">
    {benefit}
    <button
      onClick={onRemove}
      className="ml-2 text-gray-400 hover:text-white transition-colors"
      aria-label={`Remove tag: ${benefit}`}
    >
      &times;
    </button>
  </div>
);

// --- Benefits Input Component ---
export const BenefitsInput = ({ label, placeholder, field }) => {
  const benefits = field.value || []; 
  const [inputValue, setInputValue] = useState('');

  const addBenefit = useCallback((input) => {
    const newBenefit = input.trim();

    if (newBenefit.length > 0)
      field.onChange([...benefits, newBenefit]);
    
  }, [benefits, field]); 

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBenefit(inputValue);
      setInputValue('');
    }
  };

  const handleBlur = () => {
    addBenefit(inputValue);
    setInputValue('');
  };

  const handleRemoveBenefit = (benefitToRemove) => {
    const updatedBenefits = benefits.filter(benefit => benefit !== benefitToRemove);
    field.onChange(updatedBenefits);
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
            placeholder={benefits.length === 0 ? placeholder : ''}
            className="flex-grow bg-transparent outline-none text-white placeholder-rich-black-200 mt-1 min-w-[100px]"
            />
        </div>
      </div>

      <div className="flex flex-wrap mt-3">
        {benefits.map((benefit, index) => (
          <Benefit key={index} benefit={benefit} onRemove={() => handleRemoveBenefit(benefit)} />
        ))}
      </div>
    </div>
  );
};


// --- Thumbnail Uploader Component ---
export const ThumbnailUploader = ({ 
  label, 
  field, 
  error, 
  fileType = 'image', 
  helperText 
}) => {
  const fileInputRef = useRef(null);
  const file = field.value;
  const [previewURL, setPreviewURL] = useState(null);

  const acceptType = fileType === 'image' ? 'image/*' : 'video/*';
  const validationPrefix = fileType === 'image' ? 'image/' : 'video/';

  useEffect(() => {
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      setPreviewURL(url);

      return () => {
        URL.revokeObjectURL(url);
        setPreviewURL(null);
      };
    } 
    else if (typeof file === 'string' && file.length > 0) {
      setPreviewURL(file); 
    } 
    else {
      setPreviewURL(null);
    }
  }, [file]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith(validationPrefix)) {
      field.onChange(selectedFile);
    } else {
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
    if (droppedFile && droppedFile.type.startsWith(validationPrefix)) {
      handleFileChange({ target: { files: [droppedFile] } });
    } else {
      field.onChange(null);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2 text-rich-black-5">
        {label} <span className="text-red-500">*</span>
      </label>
      <div
        className={`w-full rounded-lg border-2 border-dashed ${
          error ? 'border-red-500' : 'border-rich-black-600'
        } flex flex-col items-center justify-center p-6 cursor-pointer transition-colors duration-200 relative overflow-hidden bg-rich-black-700 text-rich-black-200 min-h-[220px]`}
        onClick={handleClick}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={acceptType} 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          onClick={(e) => (e.target.value = null)} 
        />

        {previewURL ? (
          fileType === 'image' ? (
            <img
              src={previewURL}
              alt="File Preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <video
              src={previewURL} 
              controls 
              className="absolute inset-0 w-full h-full object-cover"
            />
          )
        ) : (
          <div className="text-center z-10">
            <svg
              className="mx-auto h-12 w-12 text-rich-Black-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2zM9 13l3-3m0 0l3 3m-3-3v8"
              />
            </svg>

            <p className="text-sm mt-2 text-rich-Black-300">
              Drag and drop a {fileType}, or{' '}
              <span className="text-yellow-500 font-semibold hover:text-yellow-400">
                Browse
              </span>
            </p>
            {helperText && (
              <div className="flex flex-wrap justify-center text-xs mt-2 gap-x-4 gap-y-1 text-rich-Black-300">
                {helperText}
              </div>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
    </div>
  );
};

export const TextInput = ({ label, name, placeholder, type = 'text', rows, register, validation, error }) => (
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