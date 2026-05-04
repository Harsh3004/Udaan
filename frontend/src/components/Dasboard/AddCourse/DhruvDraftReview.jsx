import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { IoIosArrowBack } from 'react-icons/io';
import { FiSend, FiLoader } from 'react-icons/fi';
import { setCourse, setStep } from '../../../slices/courseSlice';
import { endpoints } from '../../../services/api';
import { request } from '../../../services/operations/authApi';
import { TextInput, TagInput, BenefitsInput, RequirementsInput, ThumbnailUploader } from '../../Common/Inputs';

const DhruvDraftReview = ({ courseData, onBack, onSuccess }) => {
    const dispatch = useDispatch();
    const token = useSelector((s) => s.auth.token);
    const user = useSelector((s) => s.profile);
    const [submitting, setSubmitting] = useState(false);

    const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
        defaultValues: {
            title: courseData?.title || '',
            description: courseData?.description || '',
            language: courseData?.language || 'English',
            price: courseData?.price ?? 0,
            category: courseData?.category || '',
            tags: courseData?.tags || [],
            benefits: courseData?.whatyouwilllearn || [],
            requirements: courseData?.instructions || [],
            courseThumbnail: null,
        },
    });

    useEffect(() => {
        if (!courseData) return;
        setValue('title', courseData.title || '');
        setValue('description', courseData.description || '');
        setValue('language', courseData.language || 'English');
        setValue('price', courseData.price ?? 0);
        setValue('category', courseData.category || '');
        setValue('tags', courseData.tags || []);
        setValue('benefits', courseData.whatyouwilllearn || []);
        setValue('requirements', courseData.instructions || []);
    }, [courseData, setValue]);

    const onSubmit = async (data) => {
        if (!data.courseThumbnail) {
            toast.error('Please upload a thumbnail before creating the course.');
            return;
        }
        setSubmitting(true);
        const toastId = toast.loading('Creating your course…');
        try {
            const formPayload = new FormData();
            formPayload.append('title', data.title);
            formPayload.append('language', data.language);
            formPayload.append('desc', data.description);
            formPayload.append('price', data.price);
            formPayload.append('category', data.category);
            formPayload.append('whatyouwilllearn', JSON.stringify(data.benefits));
            formPayload.append('tags', JSON.stringify(data.tags));
            formPayload.append('instructions', JSON.stringify(data.requirements));
            formPayload.append('user', user?.user?._id);
            formPayload.append('image', data.courseThumbnail);

            const response = await request(endpoints.CREATE_COURSE_API, 'POST', formPayload, token);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Course creation failed');

            toast.dismiss(toastId);
            toast.success('Course created! Now add your sections.');
            dispatch(setCourse(result.course));
            dispatch(setStep(2)); // Jump straight to CourseBuilder

            try {
                const confetti = (await import('canvas-confetti')).default;
                confetti({ particleCount: 140, spread: 80, origin: { y: 0.55 }, colors: ['#8b5cf6', '#a78bfa', '#FFD60A', '#ffffff'] });
                setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.5 }, colors: ['#8b5cf6', '#FFD60A'] }), 300);
            } catch (_) { /* canvas-confetti optional */ }

            if (onSuccess) onSuccess(result.course);
        } catch (error) {
            toast.dismiss(toastId);
            toast.error(error.message || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full overflow-y-auto bg-rich-black-900"
        >
            <div className="sticky top-0 z-10 bg-rich-black-900/95 backdrop-blur-sm border-b border-rich-black-700 px-6 py-4 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-rich-black-5">Review Your Course</h2>
                    <p className="text-xs text-rich-Black-300 mt-0.5">Dhruv built this from your conversation — tweak anything, then create.</p>
                </div>
                <button type="button" onClick={onBack}
                    className="flex items-center gap-1.5 text-sm text-rich-Black-300 hover:text-rich-black-5 transition-colors duration-150 px-3 py-1.5 rounded-lg hover:bg-rich-black-700">
                    <IoIosArrowBack className="text-base" /> Back to Chat
                </button>
            </div>

            <div className="mx-6 mt-5 mb-2 px-4 py-3 rounded-lg bg-violet-950/40 border border-violet-800/40 flex items-center gap-2 text-sm text-violet-300">
                <span className="text-lg">✨</span>
                Fields pre-filled by Dhruv. A thumbnail upload is required before creating.
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto w-full px-6 py-6 space-y-1 pb-16">
                <TextInput label="Course Title" name="title" placeholder="Enter course title"
                    register={register} error={errors.title} validation={{ required: 'Title is required' }} />
                <TextInput label="Language" name="language" placeholder="e.g. English, Hindi"
                    register={register} error={errors.language} validation={{ required: 'Language is required' }} />
                <TextInput label="Course Description" name="description" placeholder="What is this course about?" rows={4}
                    register={register} error={errors.description} validation={{ required: 'Description is required' }} />
                <TextInput label="Price (₹ — set 0 for free)" name="price" placeholder="0" type="number"
                    register={register} error={errors.price}
                    validation={{ required: 'Price is required', min: { value: 0, message: 'Price cannot be negative' } }} />

                <div className="mb-6">
                    <label className="block text-sm font-normal mb-2 text-rich-black-5">
                        Category <span className="text-red-500">*</span>
                    </label>
                    <input {...register('category', { required: 'Category is required' })}
                        placeholder="e.g. Web Development, Data Science, Design"
                        className={`w-full p-3 rounded-lg outline-none bg-rich-black-700 shadow-input-shadow text-rich-black-5 ${errors.category ? 'border-2 border-red-500' : ''}`} />
                    {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
                </div>

                <Controller name="tags" control={control}
                    render={({ field }) => <TagInput label="Tags" placeholder="Add tags separated by comma" field={field} />} />
                <Controller name="benefits" control={control}
                    render={({ field }) => <BenefitsInput label="What Students Will Learn" placeholder="Add a learning outcome, press Enter" field={field} />} />
                <Controller name="requirements" control={control}
                    render={({ field }) => <RequirementsInput label="Prerequisites / Requirements" placeholder="Add a prerequisite, press Enter" field={field} />} />
                <Controller name="courseThumbnail" control={control}
                    render={({ field, fieldState: { error } }) => (
                        <ThumbnailUploader label="Course Thumbnail" field={field} error={error} fileType="image"
                            helperText={<><span>• Aspect ratio 16:9</span><span>• Recommended size 1024×576</span></>} />
                    )} />

                <div className="pt-6 flex gap-3">
                    <button type="button" onClick={onBack}
                        className="py-3 px-6 rounded-lg font-semibold text-rich-black-5 bg-rich-black-700 hover:bg-rich-black-600 transition-colors duration-200">
                        Back to Chat
                    </button>
                    <button type="submit" disabled={submitting}
                        className="flex-1 py-3 px-8 rounded-lg font-semibold text-rich-black-900 bg-yellow-50 hover:bg-yellow-400 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-yellow-button-shadow">
                        {submitting ? <><FiLoader className="animate-spin text-lg" /> Creating…</> : <><FiSend className="text-lg" /> Create Course</>}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default DhruvDraftReview;
