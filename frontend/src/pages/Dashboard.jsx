import React from 'react'
import { Sidebar } from '../components/Dasboard/Sidebar'
import { Outlet } from 'react-router-dom'

export const Dashboard = () => {
  //Here we can add loading functionality..
  
  return (
    <div className='relative w-screen h-screen flex text-white transition-all duration-200'>
      <Sidebar />
      <div className='w-3/4'>
        <Outlet/>
      </div>
    </div>
  )
}
