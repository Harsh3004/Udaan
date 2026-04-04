import React, { useRef, useState, useEffect } from 'react'
import { Link, Links, matchPath } from 'react-router-dom'
import { navbarLinks } from '../data/navbarLinks'
import logo from '../assets/U_logo1.ico'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaShoppingCart } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import { logout } from '../services/functions/auth'
import { useNavigate } from 'react-router-dom'
import { RiLogoutBoxRLine } from "react-icons/ri";
import { CgProfile } from "react-icons/cg";
import { VscBook, VscSettingsGear } from "react-icons/vsc";

export const NavBar = () => {
    const { token } = useSelector((state) => state.auth);
    const { user } = useSelector((state) => state.profile);
    const { totalItems } = useSelector((state) => state.cart);
    const [modal, setModal] = useState(null);

    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const matchRoutes = (route) => {
        return matchPath({ path: route }, location.pathname)
    }

    const [isOpen, setisOpen] = useState(false);
    const dropDownRef = useRef(null);

    useEffect(() => {
        console.log(`user: ${user}`);
        console.log(token);
        function handleClickOutside(event) {
            if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
                setisOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const logoutHandler = () => {
        setisOpen(!isOpen);
        logout(dispatch, navigate);
    }

    return (
        <div className='bg-rich-black-900 text-rich-black-100 border-b border-b-rich-black-700 z-40'>
            <div className='w-9/12 flex justify-between items-center mx-auto '>
                <div className='z-50'>
                    <Link to={'/'}>
                        <img src={logo} alt="Logo" width={70} />
                    </Link>
                </div>

                <nav className='lg:ml-28 hidden lg:flex'>
                    <ul className='flex gap-5 justify-center'>
                        {
                            navbarLinks
                                .filter(link => !link.type || link.type === user?.role)
                                .map((link, index) => (
                                    <li key={index} className='cursor-pointer z-40'>
                                        {
                                            link.title === "CoursesOrDashboard" ?
                                                (
                                                    <Link to={user?.role === "Instructor" ? "/dashboard/instructor" : "/browse"}>
                                                        <p className={`${matchRoutes(user?.role === "Instructor" ? "/dashboard/instructor" : "/browse") ? "text-yellow-50" : "text-rich-black-100"}`}>
                                                            {user?.role === "Instructor" ? "Dashboard" : "Courses"}
                                                        </p>
                                                    </Link>
                                                ) :
                                                (
                                                    <Link to={link?.path}>
                                                        <p className={`${matchRoutes(link?.path) ? "text-yellow-50" : "text-rich-black-100"}`}>
                                                            {link.title}
                                                        </p>
                                                    </Link>
                                                )
                                        }
                                    </li>
                                ))
                        }
                    </ul>
                </nav>

                {
                    token === null ?
                        (
                            <div className='flex'>
                                <ul className='flex gap-5 cursor-pointer z-50'>
                                    <Link to={'login'}>
                                        <button className='rounded-lg py-2 px-3 border border-rich-black-800'>
                                            Login
                                        </button>
                                    </Link>
                                    <Link to={'signup'}>
                                        <button className='rounded-lg py-2 px-3 border border-rich-black-800'>
                                            SignUp
                                        </button>
                                    </Link>
                                </ul>
                            </div>
                        ) :
                        (
                            <div className='flex items-center gap-6'>
                                {
                                    user && (
                                        <div className='flex gap-5'>
                                            {/* <IoSearch/> */}
                                            <FaShoppingCart />
                                        </div>
                                    )
                                }
                                {
                                    user && (
                                        <div className='relative' ref={dropDownRef}>
                                            <button onClick={() => setisOpen(!isOpen)}>
                                                <img src={user?.profileImage} alt="profile_image" width={40} className='rounded-full' />
                                            </button>

                                            {
                                                isOpen && (
                                                    <div className='absolute top-[125%] right-0 z-50 mt-1 transition-all duration-200 ease-in-out origin-top-right'>
                                                        {/* Dropdown Pointer */}
                                                        <div className='absolute -top-1.5 right-4 w-4 h-4 bg-rich-black-800 border-l border-t border-rich-black-600 transform rotate-45 rounded-tl-sm'></div>

                                                        {/* Dropdown Content */}
                                                        <div className='relative bg-rich-black-800 text-rich-black-5 rounded-lg w-48 flex flex-col overflow-hidden border border-rich-black-600 shadow-[0_10px_40px_-5px_rgba(0,0,0,0.5)]'>
                                                            <Link
                                                                to='/dashboard/my-profile'
                                                                className='flex items-center gap-3 px-4 py-3 hover:bg-rich-black-700/80 hover:text-yellow-50 transition-colors duration-200 group'
                                                                onClick={() => setisOpen(false)}
                                                            >
                                                                <CgProfile className='text-xl text-rich-black-100 group-hover:text-yellow-50 transition-colors duration-200' />
                                                                <span className='font-medium text-[15px] whitespace-nowrap'>My Profile</span>
                                                            </Link>

                                                            <div className='h-[1px] bg-rich-black-700 w-[90%] mx-auto'></div>

                                                            {user?.role === "Student" && (
                                                                <>
                                                                    <Link
                                                                        to='/dashboard/enrolled-courses'
                                                                        className='flex items-center gap-3 px-4 py-3 hover:bg-rich-black-700/80 hover:text-yellow-50 transition-colors duration-200 group'
                                                                        onClick={() => setisOpen(false)}
                                                                    >
                                                                        <VscBook className='text-xl text-rich-black-100 group-hover:text-yellow-50 transition-colors duration-200' />
                                                                        <span className='font-medium text-[15px] whitespace-nowrap'>Enrolled Courses</span>
                                                                    </Link>
                                                                    <div className='h-[1px] bg-rich-black-700 w-[90%] mx-auto'></div>
                                                                </>
                                                            )}

                                                            <Link
                                                                to='/dashboard/setting'
                                                                className='flex items-center gap-3 px-4 py-3 hover:bg-rich-black-700/80 hover:text-yellow-50 transition-colors duration-200 group'
                                                                onClick={() => setisOpen(false)}
                                                            >
                                                                <VscSettingsGear className='text-xl text-rich-black-100 group-hover:text-yellow-50 transition-colors duration-200' />
                                                                <span className='font-medium text-[15px]'>Settings</span>
                                                            </Link>

                                                            <div className='h-[1px] bg-rich-black-700 w-[90%] mx-auto'></div>

                                                            <Link
                                                                to='/login'
                                                                onClick={logoutHandler}
                                                                className='flex items-center gap-3 px-4 py-3 hover:bg-rich-black-700/80 hover:text-yellow-50 transition-colors duration-200 group'
                                                            >
                                                                <RiLogoutBoxRLine className='text-xl text-rich-black-100 group-hover:text-yellow-50 transition-colors duration-200' />
                                                                <span className='font-medium text-[15px]'>Logout</span>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    )
                                }
                            </div>
                        )
                }

            </div>
        </div>
    )
}
