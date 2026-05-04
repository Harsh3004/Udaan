import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../services/functions/auth';
import { SidebarLink } from './SidebarLink';
import { sidebarLinks } from '../../data/sidebar';
import { Modal } from '../Modal';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VscSignOut } from 'react-icons/vsc';

export const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.profile);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogoutConfirm = () => { dispatch(logout(dispatch, navigate)); };

  const roleColor = {
    Student: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    Instructor: 'bg-yellow-50/15 text-yellow-50 border-yellow-50/20',
    Admin: 'bg-red-500/15 text-red-400 border-red-500/20',
  };

  return (
    <>
      <div className='flex flex-col min-w-[222px] border-r border-rich-black-700 bg-rich-black-800 z-40 h-full'>
        {/* ── User Identity Card ── */}
        {user && (
          <div className='flex items-center gap-3 px-5 py-5 border-b border-rich-black-700 bg-rich-black-900/40'>
                <img 
                    src={user.profileImage} 
                    alt='avatar' 
                    onError={(e) => {
                        if (!e.target.dataset.fallback) {
                            e.target.dataset.fallback = 'true';
                            e.target.src = `https://api.dicebear.com/7.x/initials/png?seed=${user?.fName || 'U'}${user?.lName || ''}&size=128`;
                        }
                    }}
                    className='w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-yellow-50/20' 
                />
            <div className='min-w-0'>
              <p className='text-sm font-semibold text-rich-black-5 truncate'>{user.fName} {user.lName}</p>
              <span className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleColor[user.role] ?? 'bg-rich-black-700 text-rich-black-300 border-rich-black-600'}`}>
                {user.role}
              </span>
            </div>
          </div>
        )}

        {/* ── Nav Links ── */}
        <div className='flex flex-col flex-1 pt-4 overflow-y-auto'>
          <div className='w-full'>
            {sidebarLinks.map((link) => {
              if (link.type && user?.role !== link.type) return null;
              return <SidebarLink key={link.id} data={link} />;
            })}
          </div>
          <div className='w-5/6 mx-auto my-4 h-px bg-rich-black-700 rounded-full' />
          <div className='w-full pb-4'>
            <SidebarLink data={{ name: 'Setting', icon: 'VscSettingsGear', path: '/dashboard/setting' }} />
            <button onClick={() => setIsLogoutModalOpen(true)}
              className='w-full flex items-center gap-3 px-6 py-3 text-sm font-medium text-rich-black-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 group'>
              <VscSignOut className='text-lg group-hover:text-red-400 transition-colors' />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm} title='Are you sure?' confirmText='Logout'>
        <p>You will be logged out of your account.</p>
      </Modal>
    </>
  );
};