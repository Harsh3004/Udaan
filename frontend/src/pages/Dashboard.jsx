import React, { useState } from 'react'
import { Sidebar } from '../components/Dasboard/Sidebar'
import { Outlet, useLocation } from 'react-router-dom'

export const Dashboard = () => {
  //Here we can add loading functionality..
  const [showSidebar, setShowSidebar] = useState(true);
  const location = useLocation();
  
  const hideSidebar = location.pathname === '/dashboard/instructor' || location.pathname === '/dashboard/my-courses';
  const isSidebarVisible = showSidebar && !hideSidebar;

  return (
    <div className='relative flex text-white transition-all duration-200 min-h-screen bg-rich-black-900'>
      {isSidebarVisible && (
        <div className='hidden md:block w-2/12 min-w-[220px] border-r border-rich-black-700 bg-rich-black-800'>
          <Sidebar />
        </div>
      )}

      {(!showSidebar && !hideSidebar) && (
        <button
          className='fixed top-4 left-4 z-40 px-3 py-2 rounded-md border border-rich-black-700 text-sm text-rich-black-25 bg-rich-black-800 hover:bg-rich-black-700'
          onClick={() => setShowSidebar(true)}
        >
          Open Menu
        </button>
      )}

      {isSidebarVisible && (
        <button
          className='fixed top-4 left-4 z-40 px-3 py-2 rounded-md border border-rich-black-700 text-sm text-rich-black-25 bg-rich-black-800 hover:bg-rich-black-700 md:hidden'
          onClick={() => setShowSidebar(false)}
        >
          Close
        </button>
      )}

      <div className='flex-1 w-full'>
        <Outlet/>
      </div>
    </div>
  )
}
