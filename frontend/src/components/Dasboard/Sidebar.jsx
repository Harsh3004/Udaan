import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../services/functions/auth'
import { SidebarLink } from './SidebarLink';
import { sidebarLinks } from '../../data/sidebar';
import { Modal } from '../Modal';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VscSignOut } from 'react-icons/vsc';
import { Link } from 'react-router-dom';

export const Sidebar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {user} = useSelector((state) => state.profile);
    const [modal, setModal] = useState(null);

    return (
      <>
          <div className='flex flex-col min-w-[222px] border-r-[1px] border-r-rich-black-700 bg-rich-black-800 py-10 items-center z-40'>
              <div className='w-full'>
                  {
                    sidebarLinks.map((link,index) => {
                        if(link.type && user?.role !== link.type) 
                          return null;

                        return <SidebarLink key={link.id} data={link}/>
                    })
                  }
              </div>

              <div className='w-5/6 my-6 h-[1px] bg-rich-black-5 rounded-full'></div>

              <div className='w-full'>
                <SidebarLink data={{
                    name: "Setting",
                    icon: 'VscSettingsGear',
                    path: "/dashboard/setting"
                }}/>

                <button onClick={() => {
                    setModal({
                        heading: 'Are you Sure?',
                        text: 'You will be logout of your Account',
                        btn1: 'Logout',
                        btn2: 'Cancel',
                        handler1: () => dispatch(logout(dispatch,navigate)),
                        handler2: () => setModal(null)
                    })
                }}

                    className='w-full flex py-2 px-8 cursor-pointer z-50'
                >
                    <div className='flex items-center gap-5 cursor-pointer'>
                        <VscSignOut />
                        Logout
                    </div>
                </button>

              </div>
          </div>

          { modal && <Modal modalData={modal}/> }
      </>
    )
}
