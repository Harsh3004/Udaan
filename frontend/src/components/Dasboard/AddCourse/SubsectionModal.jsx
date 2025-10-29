import React from 'react';
import { IoCloseCircle } from "react-icons/io5";
import { useForm, Controller } from 'react-hook-form';
import { TextInput, ThumbnailUploader } from '../../Common/Inputs';
import { endpoints } from "../../../services/api";
import { request } from "../../../services/operations/authApi";
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from "react-redux";
import { setCourse } from "../../../slices/courseSlice";

const SubsectionModal = ({ initialData, sectionId, setModal }) => {
    const course = useSelector((state) => state.course.course);
    const dispatch = useDispatch();

    const isEdit = !!initialData;
    const isAdd = !initialData;
    
    const modalTitle = isEdit ? "Editing Lecture" : "Adding New Lecture";
    const submitButtonText = isEdit ? "Save Changes" : "Save";

    const initialFormValue = initialData || {
        title: '',
        description: '',
        lectureVideo: null,
    };

    const { 
        register, 
        handleSubmit, 
        control, 
        formState: { errors } 
    } = useForm({
        defaultValues: initialFormValue,
        mode: 'onChange'
    });
    
    const submitHandler = async (data) => {
        const actionText = isEdit ? "Updating" : "Creating";
        const toastId = toast.loading(`${actionText} Lecture...`);
        try {
            const formPayload = new FormData();

            formPayload.append("topic", data.title); 
            formPayload.append("description", data.description);

            let apiEndpoint = '';
            let method = '';
            
            if (isAdd) {
                formPayload.append("sectionId", sectionId);
                formPayload.append("lectureVideo", data.lectureVideo); 
                apiEndpoint = endpoints.CREATE_SUBSECTION_API;
                method = "POST";
            } else {
                formPayload.append("subsectionId", initialData._id);
                if (data.lectureVideo instanceof File) {
                    formPayload.append("lectureVideo", data.lectureVideo);
                }
                
                apiEndpoint = endpoints.UPDATE_SUBSECTION_API; 
                method = "PUT"; 
            }

            const response = await request(apiEndpoint, method, formPayload);
            
            if (!response.ok)
                throw new Error(`Error while ${actionText.toLowerCase()} lecture`);

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
            toast.success(`Lecture ${isEdit ? "Updated" : "Created"} Successfully`);
            setModal(null);
        } catch (error) {
            toast.dismiss(toastId);
            console.error("Submission Error: ", error);
            toast.error("An error occurred. Please try again.");
        }
    };
    
    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50"></div>
            <div className='text-white fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                bg-rich-black-800 rounded-lg w-11/12 max-w-2xl lg:w-2/4 
                flex flex-col max-h-[90vh]'> 
                
                <div className='bg-rich-black-700 py-4 px-6 flex justify-between border-b border-b-rich-black-600 rounded-t-lg flex-shrink-0'>
                    <p className="text-lg font-semibold">{modalTitle}</p>
                    <button onClick={() => setModal(null)}>
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
                        rules={{ required: isAdd ? "Lecture video is required" : false }} 
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
                        onClick={() => setModal(null)}
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
                        {submitButtonText}
                    </button>
                </div>
            </div>
        </>
    );
}

export default SubsectionModal;