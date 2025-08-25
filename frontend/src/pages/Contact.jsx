import React from 'react'
import { TbMessages } from "react-icons/tb";
import { ContactForm } from '../components/ContactForm';
import { LiaGlobeAmericasSolid } from "react-icons/lia";
import { IoCall } from "react-icons/io5";

export const Contact = () => {
  return (
    <div className='flex justify-center w-10/12 mx-auto py-10 gap-5'>
        <div className='bg-rich-black-800 w-1/3 h-fit p-4 rounded-lg text-rich-black-5 flex flex-col gap-6 py-8'>
          <div className='relative space-x-1'>
            <div className='absolute top-4 text-xl'>
              <TbMessages />
            </div>
            <div className='pl-6'>
              <p className='text-xl font-semibold'>Chat on us</p>
              <p className='text-xs text-rich-black-200'>Our friendly team is here to help.</p>
              <p className='text-xs text-rich-black-200'>joshiharshit832@gmail.com</p>
            </div>
          </div>

          <div className='relative space-x-1'>
            <div className='absolute top-2 text-xl'>
              <LiaGlobeAmericasSolid />
            </div>
            <div className='pl-6'>
              <p className='text-xl font-semibold'>Visit us</p>
              <p className='text-xs text-rich-black-200'>Come and say hello at our office HQ.</p>
              <p className='text-xs text-rich-black-200'>Indore, Madhya Pradesh</p>
            </div>
          </div>

          <div className='relative space-x-1'>
            <div className='absolute top-2 text-xl'>
              <IoCall />
            </div>
            <div className='pl-6'>
              <p className='text-xl font-semibold'>Call us</p>
              <p className='text-xs text-rich-black-200'>Mon - Fri From 8am to 5pm</p>
              <p className='text-xs text-rich-black-200'>+123 456 7890</p>
            </div>
          </div>

          
        </div>
        <div className='w-1/2 flex flex-col border border-rich-black-700 rounded-md px-12 py-8'>
          <p className='font-semibold text-4xl text-rich-black-5'>
            Got a Idea? We’ve got the skills. Let’s team up
          </p>
          <p className='text-rich-black-600 text-left pt-2'>
            Tall us more about yourself and what you’re got in mind.
          </p>
          <ContactForm/>
        </div>
    </div>
  )
}
