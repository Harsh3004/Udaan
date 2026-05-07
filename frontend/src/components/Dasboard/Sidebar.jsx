import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../services/functions/auth';
import { resetCourseState } from '../../slices/courseSlice';
import { Modal } from '../Modal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  VscAccount, VscBook, VscAdd, VscHome, VscSettingsGear,
  VscSignOut, VscChevronRight, VscChevronLeft, VscMail, VscMenu
} from 'react-icons/vsc';

const iconMap = {
  VscAccount, VscBook, VscAdd, VscHome, VscSettingsGear,
  VscSignOut, VscMail
};

const instructorLinks = [
  { id: 'dashboard', name: 'Dashboard', path: '/dashboard/instructor', icon: 'VscHome' },
  { id: 'my-courses', name: 'My Courses', path: '/dashboard/my-courses', icon: 'VscBook' },
  { id: 'add-course', name: 'Create Course', path: '/dashboard/add-course', icon: 'VscAdd' },
  { id: 'messages', name: 'Messages', path: '/dashboard/messages', icon: 'VscMail' },
];

const studentLinks = [
  { id: 'enrolled', name: 'My Learning', path: '/dashboard/enrolled-courses', icon: 'VscBook' },
  { id: 'messages', name: 'Messages', path: '/dashboard/messages', icon: 'VscMail' },
];

const bottomLinks = [
  { id: 'settings', name: 'Settings', path: '/dashboard/setting', icon: 'VscSettingsGear' },
  { id: 'my-profile', name: 'My Profile', path: '/dashboard/my-profile', icon: 'VscAccount' },
];

export const SidebarLink = ({ data, onClick, collapsed }) => {
  const Icon = iconMap[data.icon] || VscAccount;
  const dispatch = useDispatch();

  const handleClick = () => {
    if (data.path === '/dashboard/add-course') {
      dispatch(resetCourseState());
    }
    if (onClick) onClick();
  };

  return (
    <NavLink
      to={data.path}
      onClick={handleClick}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-yellow-50 text-rich-black-900 shadow-[0_4px_15px_rgba(255,214,10,0.25)]'
            : 'text-rich-black-300 hover:text-white hover:bg-rich-black-700/50'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`${isActive ? 'text-rich-black-900' : 'text-rich-black-400 group-hover:text-yellow-50'} transition-colors flex-shrink-0`}>
            <Icon size={20} />
          </span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-1 overflow-hidden whitespace-nowrap"
              >
                {data.name}
              </motion.span>
            )}
          </AnimatePresence>
          {isActive && !collapsed && (
            <motion.span
              layoutId="sidebar-active-dot"
              className="w-2 h-2 rounded-full bg-rich-black-900 flex-shrink-0"
            />
          )}
        </>
      )}
    </NavLink>
  );
};

export const Sidebar = ({ onClose, collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.profile);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogoutConfirm = () => {
    dispatch(logout(dispatch, navigate));
  };

  const roleColor = {
    Student: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    Instructor: 'bg-yellow-50/15 text-yellow-50 border-yellow-50/20',
    Admin: 'bg-red-500/15 text-red-400 border-red-500/20',
  };

  const navLinks = user?.role === 'Instructor' ? instructorLinks : studentLinks;

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex flex-col bg-rich-black-800 border-r border-rich-black-700 h-screen sticky top-0 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-rich-black-700">
          <AnimatePresence>
            {!collapsed && (
              <motion.img
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                src={user?.profileImage}
                alt={user?.fName}
                onError={(e) => {
                  if (!e.target.dataset.fallback) {
                    e.target.dataset.fallback = 'true';
                    e.target.src = `https://api.dicebear.com/7.x/initials/png?seed=${user?.fName || 'U'}${user?.lName || ''}&size=128`;
                  }
                }}
                className="w-11 h-11 rounded-xl object-cover ring-2 ring-yellow-50/30 flex-shrink-0"
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0 flex-1"
              >
                <p className="text-sm font-semibold text-white truncate">
                  {user?.fName} {user?.lName}
                </p>
                <span className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleColor[user?.role] || 'bg-rich-black-700 text-rich-black-300 border-rich-black-600'}`}>
                  {user?.role}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={onCollapse}
            className="p-2 rounded-lg hover:bg-rich-black-700 text-rich-black-400 hover:text-white transition-colors flex-shrink-0"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <VscMenu size={18} /> : <VscChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
          <div>
            {!collapsed && (
              <p className="px-4 text-[10px] font-bold text-rich-black-500 uppercase tracking-widest mb-2">
                Main Menu
              </p>
            )}
            <div className="space-y-1">
              {navLinks.map((link) => (
                <SidebarLink
                  key={link.id}
                  data={link}
                  onClick={handleLinkClick}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>

          <div>
            {!collapsed && (
              <p className="px-4 text-[10px] font-bold text-rich-black-500 uppercase tracking-widest mb-2">
                Settings
              </p>
            )}
            <div className="space-y-1">
              {bottomLinks.map((link) => (
                <SidebarLink
                  key={link.id}
                  data={link}
                  onClick={handleLinkClick}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-rich-black-700">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rich-black-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
            title={collapsed ? 'Logout' : undefined}
          >
            <VscSignOut className="text-lg group-hover:text-red-400 transition-colors flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Logout Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Logout"
      >
        <p>Are you sure you want to logout? You will need to sign in again to access your account.</p>
      </Modal>
    </>
  );
};