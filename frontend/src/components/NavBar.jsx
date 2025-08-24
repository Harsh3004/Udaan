import React, { useState } from 'react'
import { Link, Links, matchPath } from 'react-router-dom'
import { navbarLinks } from '../data/navbarLinks'
import logo from '../assets/U_logo1.ico'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FaShoppingCart } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";

export const NavBar = () => {
    const {token} = useSelector((state) => state.auth);
    const {user} = useSelector((state) => state.profile);
    const {totalItems} = useSelector((state) => state.cart); 

    const location = useLocation();
    const matchRoutes = (route) => {
        return matchPath({ path: route }, location.pathname)
    }

    const [subLinks, setsubLinks] = useState([
        {
            "title": "Python",
            "path" : "/python"
        },
        {
            "title": "Web Development",
            "path" : "/python"
        }
    ]);

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
                            navbarLinks.map((link, index) => (
                                <li key={index} className='cursor-pointer z-40'>
                                    {
                                        link.title === "Catalog" ?
                                            (
                                                <div className='group relative'>
                                                    <span className='flex items-center gap-[2px]'>
                                                        Catalog
                                                        <span className='relative top-[2px]'>
                                                            <IoIosArrowDown />
                                                        </span>
                                                    </span>
                                                    <div className='absolute invisible group-hover:visible group-hover:opacity-100 bg-rich-black-5 text-rich-black-900 transition-all duration-100 rounded-md z-50 px-1 w-44 -right-10 top-8 flex flex-col font-normal gap-1 py-1'>
                                                        <div className='absolute bg-rich-black-5 rounded-sm z-40 px-2 w-1 aspect-square right-10 -top-1 rotate-45'>
                                                        </div>
                                                        {
                                                            subLinks.map((link,index) => 
                                                                <Link to={link.path}className='hover:bg-rich-black-400 hover:text-white py-1 px-2 z-50 rounded-sm w-full'>
                                                                {link.title}
                                                                </Link>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                             
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
                    (<div className='flex'>
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
                    </div>) : 
                    (
                        <div>
                            {
                                user && user?.role === 'Student' && (
                                    <div className='flex gap-5'>
                                        <IoSearch/>
                                        <FaShoppingCart />
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
