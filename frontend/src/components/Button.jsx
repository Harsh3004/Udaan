import React from 'react'

export const Button = ({active,children}) => {
  return (
    <div
      className={`
        flex w-fit items-center gap-2 rounded-md p-4 font-medium text-base leading-6 tracking-normal text-center cursor-pointer transition-colors duration-300
        ${active === 1 ? 'bg-yellow-50 text-rich-black-900 shadow-inner-light' : 'bg-slate-800 text-white shadow-white-inset'}
      `}
    >
      {children}
    </div>
  )
}
