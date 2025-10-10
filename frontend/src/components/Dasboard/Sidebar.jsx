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

  const handleLogoutConfirm = () => {
    dispatch(logout(dispatch, navigate));
  };

  return (
    <>
      <div className='flex flex-col min-w-[222px] border-r-[1px] border-r-rich-black-700 bg-rich-black-800 py-10 z-40'>
        <div className='flex flex-col items-center w-full'>
          <div className='w-full'>
            {sidebarLinks.map((link) => {
              if (link.type && user?.role !== link.type) {
                return null;
              }
              return <SidebarLink key={link.id} data={link} />;
            })}
          </div>

          <div className='w-5/6 my-6 h-[1px] bg-rich-black-5 rounded-full'></div>

          <div className='w-full'>
            <SidebarLink data={{
              name: "Setting",
              icon: 'VscSettingsGear',
              path: "/dashboard/setting"
            }} />

            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className='w-full text-sm font-medium text-rich-black-300 py-2 px-8 transition-all duration-200 hover:text-rich-black-25 hover:bg-rich-black-700'
            >
              <div className='flex items-center gap-4'>
                <VscSignOut className="text-lg" />
                <span className='text-base'>Logout</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Are you Sure?"
        confirmText="Logout"
      >
        <p>You will be logged out of your account.</p>
      </Modal>
    </>
  );
};