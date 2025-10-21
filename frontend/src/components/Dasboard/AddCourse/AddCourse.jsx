import React from 'react'
import { Link } from 'react-router-dom'
import { IoArrowBackCircle } from "react-icons/io5";
import { RenderSteps } from './RenderSteps';

const AddCourse = () => {
  return (
    <div className='flex justify-between w-full'>
        <div className='w-5/6'>
            <Link className='flex items-center gap-1 text-rich-Black-300 py-6 px-6 font-normal text-sm' to={'/dashboard'}><IoArrowBackCircle /> Back to Dashboard </Link>

            <RenderSteps />
        </div>
        <div className='bg-rich-black-800 h-fit border border-rich-black-700 p-6 rounded-md space-y-4 text-left my-6 mx-4'>
            <p className='text-lg'>⚡Course Upload Tips </p>
            <ul className='list-disc pl-6 space-y-3 text-xs'>
                <li>Set the Course Price option or make it free.</li>
                <li>Standard size for the course thumbnail is 1024x576.</li>
                <li>Video section controls the course overview video.</li>
                <li>Course Builder is where you create & organize a course.</li>
                <li>Add Topics in the Course Builder section to create lessons, quizzes, and assignments.</li>
                <li>Information from the Additional Data section shows up on the course single page.</li>
                <li>Make Announcements to notify any important</li>
                <li>Notes to all enrolled students at once.</li>
            </ul>
        </div>
    </div>
  )
}

export default AddCourse