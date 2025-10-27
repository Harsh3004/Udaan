import React from 'react'
import { Sidebar } from '../components/Dasboard/Sidebar'
import { Outlet } from 'react-router-dom'

export const Dashboard = () => {
  //Here we can add loading functionality..
  
  return (
    <div className='relative flex text-white transition-all duration-200'>
      <Sidebar className='w-2/12'/>
      <div className='w-full'>
        <Outlet/>
      </div>
    </div>
  )
}
