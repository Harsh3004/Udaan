import React, { useState } from 'react'
import { Sidebar } from '../components/Dasboard/Sidebar'
import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { VscMenu } from 'react-icons/vsc'

export const Dashboard = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className='relative flex text-white min-h-screen bg-rich-black-900'>
      {/* Sidebar - Desktop with Collapse Feature */}
      <div className='hidden md:block'>
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Collapsed Sidebar Expand Button - Desktop */}
      <AnimatePresence>
        {sidebarCollapsed && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => setSidebarCollapsed(false)}
            className='hidden md:flex fixed left-4 top-4 z-50 w-12 h-12 bg-yellow-50 text-rich-black-900 rounded-xl items-center justify-center shadow-[0_4px_15px_rgba(255,214,10,0.3)] hover:scale-105 transition-transform'
            title="Expand Sidebar"
          >
            <VscMenu size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Drawer with Overlay */}
      {showSidebar && (
        <>
          <div
            className='fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden'
            onClick={() => setShowSidebar(false)}
          />
          <div className='fixed inset-y-0 left-0 z-50 md:hidden'>
            <Sidebar
              onClose={() => setShowSidebar(false)}
              collapsed={false}
              onCollapse={() => setShowSidebar(false)}
            />
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
      <div className={`flex-1 w-full min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-0' : ''}`}>
        <Outlet/>
      </div>
    </div>
  )
}