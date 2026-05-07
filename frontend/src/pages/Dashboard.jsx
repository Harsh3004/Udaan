import React, { useState } from 'react'
import { Sidebar } from '../components/Dasboard/Sidebar'
import { Outlet } from 'react-router-dom'

export const Dashboard = () => {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className='relative flex text-white min-h-screen bg-rich-black-900'>
      {/* Sidebar - Always visible on desktop */}
      <div className='hidden md:block'>
        <Sidebar />
      </div>

      {/* Mobile Sidebar Drawer with Overlay */}
      {showSidebar && (
        <>
          <div
            className='fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden'
            onClick={() => setShowSidebar(false)}
          />
          <div className='fixed inset-y-0 left-0 z-50 md:hidden'>
            <Sidebar onClose={() => setShowSidebar(false)} />
          </div>
        </>
      )}

      {/* Mobile Menu Toggle Button */}
      <button
        className='fixed top-4 left-4 z-30 p-2.5 rounded-xl bg-rich-black-800 border border-rich-black-700 text-white shadow-lg hover:bg-rich-black-700 transition-colors md:hidden'
        onClick={() => setShowSidebar(!showSidebar)}
      >
        {showSidebar ? '✕' : '☰'}
      </button>

      {/* Main Content */}
      <div className='flex-1 w-full min-w-0'>
        <Outlet/>
      </div>
    </div>
  )
}
