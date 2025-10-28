import { IoCloseCircle } from "react-icons/io5";
import { useForm, Controller } from 'react-hook-form';
import { TextInput, ThumbnailUploader } from '../../Common/Inputs';

const AddSubsectionModal = ({ setaddSubSection }) => {

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      lectureVideo: null,
    },
  });

  const submitHandler = (data) => {
    console.log(`Submitting data`);
    console.log("Data: ", data);

    // Creating subsection API CALL

    setaddSubSection(false);
  }
  
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50"></div>

      <div className='text-white fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
        bg-rich-black-800 rounded-lg w-11/12 max-w-2xl lg:w-2/4 
        flex flex-col max-h-[90vh]'> 
        
        <div className='bg-rich-black-700 py-4 px-6 flex justify-between border-b border-b-rich-black-600 rounded-t-lg flex-shrink-0'>
          <p className="text-lg font-semibold">Adding Lecture</p>
          <button onClick={() => setaddSubSection(false)}>
            <IoCloseCircle size={24} className="text-rich-black-300 hover:text-white" />
          </button>
        </div>

        <form 
          id="subsection-form"
          onSubmit={handleSubmit(submitHandler)} 
          className='flex flex-col p-6 md:p-8 flex-1 overflow-y-auto'
        >
          <Controller
            name="lectureVideo"
            control={control}
            rules={{ required: "Lecture video is required" }} 
            render={({ field, fieldState: { error } }) => (
              <ThumbnailUploader
                label="Lecture Video"
                field={field}
                error={error}
                fileType="video"
                helperText={
                  <span>• Max file size 500MB. Recommended format: .mp4</span>
                }
              />
            )}
          />

          <TextInput
            label="Lecture Title"
            name="title"
            placeholder="Enter Lecture Title"
            register={register}
            error={errors.title}
            validation={{ required: 'Lecture Title is required' }}
          />

          <TextInput
            label="Lecture Description"
            name="description"
            placeholder="Enter Lecture Description..."
            rows={4}
            register={register}
            error={errors.description}
            validation={{ required: 'Subsection Description is required' }}
          />
        </form>

        <div className="flex justify-end gap-3 md:gap-5 p-4 bg-rich-black-700 border-t border-rich-black-600 rounded-b-lg flex-shrink-0">
          <button
            type="button"
            onClick={() => setaddSubSection(false)}
            className="flex justify-center items-center gap-2 py-2 px-5 rounded-lg font-semibold text-rich-black-5 transition-colors duration-200 bg-rich-black-600
            shadow-button-shadow hover:bg-rich-black-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="subsection-form"
            className="flex justify-center items-center gap-2 py-2 px-5 rounded-lg font-semibold text-rich-black-900 transition-colors duration-200 hover:bg-yellow-400 bg-yellow-50 shadow-button-shadow"
          >
            Save Edits
          </button>
        </div>
      </div>
    </>
  )
}

export default AddSubsectionModal