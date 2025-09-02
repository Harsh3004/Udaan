import React from 'react'

export const Modal = ({modalData}) => {
  console.log(modalData.heading)
  return (
    <div className='w-1/3 absolute top-1/4 right-1/3 transform bg-rich-black-800 text-rich-black-5 z-50 p-4 rounded-lg flex flex-col gap-2 border border-rich-black-600'>
        <p className='font-semibold text-2xl'>{modalData.heading}</p>
        <p>{modalData.text}</p>

        <div className='flex gap-10 mt-4 justify-evenly'>
            <button 
            onClick={modalData.handler1}
            className={`flex w-fit items-center gap-2 rounded-md px-4 py-2 font-medium text-base leading-6 tracking-normal text-center cursor-pointer transition-colors duration-300 bg-yellow-50 text-rich-black-900 shadow-inner-light' `}>
                {modalData.btn1}
            </button>

            <button onClick={modalData.handler2}
            className={`flex w-fit items-center gap-2 rounded-md px-4 py-2 font-medium text-base leading-6 tracking-normal text-center cursor-pointer transition-colors duration-300 bg-yellow-50 text-rich-black-900 shadow-inner-light' `}>
              {modalData.btn2}
            </button>
        </div>
    </div>
  )
}
