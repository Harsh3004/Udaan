import React, { useState } from 'react'
import CourseInformationForm from './CourseInformationForm';
import CourseBuilder from './CourseBuilder';
import { FaCheckCircle } from "react-icons/fa";

const steps = [
    {
        id: 1,
        title: 'Course Information'
    },
    {
        id: 2,
        title: "Course Builder"
    },
    {
        id: 3,
        title: "Publish"
    }
];

export const RenderSteps = () => {
    const [currStep,setcurrStep] = useState(1);
  return (
    <>
        <div className='flex justify-evenly relative transition-all duration-200'>
            {
                steps.map((step,index)=>(
                    <div id={index} className='text-center z-30'>
                        <div className={`rounded-full border w-9 aspect-square flex justify-center items-center ${currStep >= step.id ? 'bg-yellow-900 text-yellow-50 border-yellow-50' : 'text-rich-Black-300 bg-rich-black-800 border-rich-Black-300'} mx-auto`}>
                            {step.id >= currStep ? step.id : <FaCheckCircle className='w-full h-full'/>}
                        </div>
                        
                        <span className={`${currStep >= step.id ? 'text-rich-black-5' : 'text-rich-Black-300'} text-sm`}>
                            {step.title}
                        </span>
                    </div>
                ))
            }
            <div className='absolute right-32 z-10 tracking-widest text-rich-Black-300'>       -------------------------------------------
            </div>
        </div>

        {
            currStep == 1 && <CourseInformationForm setcurrStep={setcurrStep}/>
        }
        {
            currStep == 2 && <CourseBuilder setcurrStep={setcurrStep}/>
        }
        {
            currStep == 3 && <CourseBuilder setcurrStep={setcurrStep}git />
        }
    </>
  )
}
