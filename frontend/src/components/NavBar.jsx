import React, { useRef, useState, useEffect } from 'react'
import { Link, matchPath } from 'react-router-dom'
import { navbarLinks } from '../data/navbarLinks'
import logo from '../assets/U_logo1.ico'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaShoppingCart } from "react-icons/fa"
import { logout } from '../services/functions/auth'
import { RiLogoutBoxRLine } from "react-icons/ri"
import { CgProfile } from "react-icons/cg"
import { VscBook, VscSettingsGear } from "react-icons/vsc"
import { FiMenu, FiX, FiMessageCircle } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { endpoints } from '../services/api'
import { request } from '../services/operations/authApi'

export const NavBar = () => {
    const { token } = useSelector((state) => state.auth)
    const { user } = useSelector((state) => state.profile)
    const { totalItems } = useSelector((state) => state.cart)
    const [profileOpen, setProfileOpen] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [unreadMessages, setUnreadMessages] = useState(0)
    const [messagesOpen, setMessagesOpen] = useState(false)

    const location = useLocation()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const dropDownRef = useRef(null)

    const matchRoutes = (route) => matchPath({ path: route }, location.pathname)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropDownRef.current && !dropDownRef.current.contains(e.target)) {
                setProfileOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => { setMobileOpen(false) }, [location.pathname])

    // Fetch unread messages count
    useEffect(() => {
        const fetchUnreadMessages = async () => {
            if (!token || !user) return;
            try {
                const endpoint = user.role === 'Instructor'
                    ? endpoints.CHAT_INSTRUCTOR_CONVERSATIONS
                    : endpoints.CHAT_STUDENT_CONVERSATIONS;
                const res = await request(endpoint, 'GET', null, token);
                const data = await res.json();
                if (data.success && data.conversations) {
                    const totalUnread = data.conversations.reduce((sum, conv) => {
                        return sum + (user.role === 'Instructor' ? conv.instructorUnreadCount : conv.studentUnreadCount);
                    }, 0);
                    setUnreadMessages(totalUnread);
                }
            } catch (error) {
                console.error('Error fetching unread messages:', error);
            }
        };

        fetchUnreadMessages();
        const interval = setInterval(fetchUnreadMessages, 30000);
        return () => clearInterval(interval);
    }, [token, user]);

    const logoutHandler = () => {
        setProfileOpen(false)
        setMobileOpen(false)
        logout(dispatch, navigate)
    }

    const navLinks = navbarLinks.filter(link => !link.type || link.type === user?.role)

    const getLinkPath = (link) => {
        if (link.title === 'CoursesOrDashboard')
            return user?.role === 'Instructor' ? '/dashboard/instructor' : '/browse'
        return link?.path
    }

    const getLinkLabel = (link) => {
        if (link.title === 'CoursesOrDashboard')
            return user?.role === 'Instructor' ? 'Dashboard' : 'Courses'
        return link.title
    }

    return (
        <div className={`sticky top-0 z-[100] bg-rich-black-900/90 backdrop-blur-xl border-b border-rich-black-700 transition-shadow duration-300 ${scrolled ? 'nav-scrolled' : ''}`}>
            <div className='w-11/12 max-w-7xl flex justify-between items-center mx-auto py-3'>

                {/* Logo */}
                <Link to='/' className='z-50 flex-shrink-0'>
                    <img src={logo} alt='Udaan Logo' width={60} />
                </Link>

                {/* Desktop Nav Links */}
                <nav className='hidden lg:flex'>
                    <ul className='flex gap-8 items-center'>
                        {navLinks.map((link, i) => {
                            const path = getLinkPath(link)
                            const label = getLinkLabel(link)
                            const isActive = !!matchRoutes(path)
                            return (
                                <li key={i}>
                                    <Link
                                        to={path}
                                        className={`relative text-sm font-medium transition-colors duration-200 py-1 ${isActive ? 'text-yellow-50' : 'text-rich-black-100 hover:text-white'}`}
                                    >
                                        {label}
                                        {isActive && (
                                            <motion.span
                                                layoutId='nav-underline'
                                                className='absolute -bottom-1 left-0 right-0 h-0.5 bg-yellow-50 rounded-full'
                                            />
                                        )}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                {/* Desktop Right Side */}
                <div className='hidden lg:flex items-center gap-4'>
                    {token === null ? (
                        <div className='flex items-center gap-3'>
                            <Link to='login'>
                                <button className='text-sm font-semibold text-rich-black-100 border border-rich-black-600 hover:border-rich-black-400 hover:text-white px-4 py-2 rounded-lg transition-all duration-200'>
                                    Log In
                                </button>
                            </Link>
                            <Link to='signup'>
                                <button className='text-sm font-semibold text-rich-black-900 bg-yellow-50 hover:opacity-90 px-4 py-2 rounded-lg transition-all duration-200 glow-yellow'>
                                    Sign Up
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className='flex items-center gap-5'>
                            {user && (
                                <button
                                    onClick={() => navigate('/dashboard/cart')}
                                    className='relative text-rich-black-200 hover:text-white transition-colors'
                                >
                                    <FaShoppingCart size={20} />
                                    {totalItems > 0 && (
                                        <span className='absolute -top-2 -right-2 w-4 h-4 bg-yellow-50 text-rich-black-900 text-[10px] font-bold rounded-full flex items-center justify-center'>
                                            {totalItems}
                                        </span>
                                    )}
                                </button>
                            )}

                            {user && (
                                <button
                                    onClick={() => navigate('/dashboard/messages')}
                                    className='relative text-rich-black-200 hover:text-white transition-colors'
                                >
                                    <FiMessageCircle size={22} />
                                    {unreadMessages > 0 && (
                                        <span className='absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse'>
                                            {unreadMessages > 9 ? '9+' : unreadMessages}
                                        </span>
                                    )}
                                </button>
                            )}

                            {user && (
                                <div className='relative' ref={dropDownRef}>
                                    <button
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className='flex items-center gap-2 rounded-full ring-2 ring-transparent hover:ring-yellow-50/40 transition-all duration-200'
                                    >
                                        <img
                                            src={user?.profileImage}
                                            alt='profile'
                                            width={38}
                                            height={38}
                                            className='rounded-full object-cover'
                                            referrerPolicy='no-referrer'
                                        />
                                    </button>

                                    <AnimatePresence>
                                        {profileOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                                transition={{ duration: 0.15 }}
                                                className='absolute top-[calc(100%+12px)] right-0 z-50'
                                            >
                                                <div className='absolute -top-1.5 right-4 w-3 h-3 bg-rich-black-800 border-l border-t border-rich-black-600 rotate-45 rounded-tl-sm' />
                                                <div className='bg-rich-black-800 border border-rich-black-600 rounded-xl w-52 overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.6)]'>
                                                    <div className='px-4 py-3 border-b border-rich-black-700'>
                                                        <p className='text-sm font-semibold text-white truncate'>{user.fName} {user.lName}</p>
                                                        <p className='text-[11px] text-rich-black-400 truncate'>{user.email}</p>
                                                    </div>

                                                    <Link to='/dashboard/my-profile' onClick={() => setProfileOpen(false)}
                                                        className='flex items-center gap-3 px-4 py-2.5 text-sm text-rich-black-100 hover:bg-rich-black-700 hover:text-yellow-50 transition-colors group'>
                                                        <CgProfile className='group-hover:text-yellow-50 transition-colors' />
                                                        My Profile
                                                    </Link>

                                                    {user?.role === 'Student' && (
                                                        <Link to='/dashboard/enrolled-courses' onClick={() => setProfileOpen(false)}
                                                            className='flex items-center gap-3 px-4 py-2.5 text-sm text-rich-black-100 hover:bg-rich-black-700 hover:text-yellow-50 transition-colors group'>
                                                            <VscBook className='group-hover:text-yellow-50 transition-colors' />
                                                            Enrolled Courses
                                                        </Link>
                                                    )}

                                                    <Link to='/dashboard/setting' onClick={() => setProfileOpen(false)}
                                                        className='flex items-center gap-3 px-4 py-2.5 text-sm text-rich-black-100 hover:bg-rich-black-700 hover:text-yellow-50 transition-colors group'>
                                                        <VscSettingsGear className='group-hover:text-yellow-50 transition-colors' />
                                                        Settings
                                                    </Link>

                                                    <div className='border-t border-rich-black-700' />

                                                    <button onClick={logoutHandler}
                                                        className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors'>
                                                        <RiLogoutBoxRLine />
                                                        Logout
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile hamburger */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className='lg:hidden p-2 text-rich-black-100 hover:text-white transition-colors'
                    aria-label='Toggle menu'
                >
                    {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className='lg:hidden overflow-hidden bg-rich-black-900 border-t border-rich-black-800'
                    >
                        <div className='px-6 py-6 flex flex-col gap-1'>
                            {navLinks.map((link, i) => {
                                const path = getLinkPath(link)
                                const label = getLinkLabel(link)
                                const isActive = !!matchRoutes(path)
                                return (
                                    <Link key={i} to={path}
                                        className={`flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-yellow-50/10 text-yellow-50' : 'text-rich-black-100 hover:bg-rich-black-800 hover:text-white'}`}>
                                        {label}
                                    </Link>
                                )
                            })}

                            <div className='border-t border-rich-black-800 mt-4 pt-4'>
                                {token === null ? (
                                    <div className='flex flex-col gap-3'>
                                        <Link to='login'>
                                            <button className='w-full text-sm font-semibold text-rich-black-100 border border-rich-black-600 py-3 rounded-xl hover:border-rich-black-400 transition-all'>Log In</button>
                                        </Link>
                                        <Link to='signup'>
                                            <button className='w-full text-sm font-semibold text-rich-black-900 bg-yellow-50 py-3 rounded-xl hover:opacity-90 transition-all'>Sign Up Free</button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className='flex flex-col gap-1'>
                                        <div className='flex items-center gap-3 px-4 py-3'>
                                            <img src={user?.profileImage} alt='profile' width={36} className='rounded-full' 
                                                onError={(e) => {
                                                    if (!e.target.dataset.fallback) {
                                                        e.target.dataset.fallback = 'true';
                                                        e.target.src = `https://api.dicebear.com/7.x/initials/png?seed=${user?.fName || 'U'}${user?.lName || ''}&size=128`;
                                                    }
                                                }}
                                            />
                                            <div>
                                                <p className='text-sm font-semibold text-white'>{user?.fName} {user?.lName}</p>
                                                <p className='text-[11px] text-rich-black-400'>{user?.role}</p>
                                            </div>
                                        </div>
                                        <Link to='/dashboard/my-profile' className='flex items-center gap-3 py-3 px-4 rounded-xl text-sm text-rich-black-100 hover:bg-rich-black-800 hover:text-white transition-all'><CgProfile /> My Profile</Link>
                                        {user?.role === 'Student' && (
                                            <Link to='/dashboard/enrolled-courses' className='flex items-center gap-3 py-3 px-4 rounded-xl text-sm text-rich-black-100 hover:bg-rich-black-800 hover:text-white transition-all'><VscBook /> Enrolled Courses</Link>
                                        )}
                                        <Link to='/dashboard/setting' className='flex items-center gap-3 py-3 px-4 rounded-xl text-sm text-rich-black-100 hover:bg-rich-black-800 hover:text-white transition-all'><VscSettingsGear /> Settings</Link>
                                        <button onClick={logoutHandler} className='flex items-center gap-3 py-3 px-4 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all w-full text-left'><RiLogoutBoxRLine /> Logout</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
