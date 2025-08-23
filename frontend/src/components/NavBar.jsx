import React from 'react'
import { Link, Links, matchPath, matchRoutes } from 'react-router-dom'
import { navbarLinks } from '../data/NavBarLinks'
import { useLocation } from 'react-router-dom'
import logo from '../assets/U_logo1.ico'

export const NavBar = () => {
    const location = useLocation();
    const matchRoutes = (route) => {
        return matchPath({ path: route }, location.pathname)
    }

    return (
        <div className='bg-rich-black-900 text-rich-black-5 border-b border-b-rich-black-700 z-40'>
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
                                                <p>Catalog</p>
                                            )
                                            :
                                            (
                                                <Link to={link?.path}>
                                                    <p className={`${matchRoutes(link?.path) ? "text-yellow-50" : "text-rich-black-5"}`}>
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

                <div className='flex'>
                    <ul className='flex gap-5 cursor-pointer z-50'>
                        <Link to={'login'}>
                            <button className='rounded-lg py-2 px-3 border border-rich-black-800'>
                                Login
                            </button>
                        </Link>
                        <button className='rounded-lg py-2 px-3 border border-rich-black-800'>
                            <Link to={'signup'}>
                                <button>
                                    SignUp
                                </button>
                            </Link>
                        </button>
                    </ul>
                </div>
            </div>
        </div>
    )
}
