import React, { useEffect, useState } from 'react';
import { request } from '../../services/operations/authApi';
import { endpoints } from '../../services/api';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../services/functions/auth';
import { useNavigate, Link } from 'react-router-dom';
import { FaBook, FaUsers, FaRupeeSign, FaArrowRight, FaPlus } from 'react-icons/fa';
import { FiTrendingUp, FiBarChart2, FiSettings } from 'react-icons/fi';
import { motion } from 'framer-motion';

const SkeletonStat = () => (
  <div className='rounded-2xl bg-rich-black-800 border border-rich-black-700 p-6 space-y-4'>
    <div className='flex items-center gap-4'>
      <div className='w-12 h-12 skeleton rounded-xl' />
      <div className='h-4 w-28 skeleton rounded-md' />
    </div>
    <div className='h-8 w-20 skeleton rounded-md' />
  </div>
);

const StatCard = ({ icon: Icon, label, value, colorClass, borderClass }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className={`relative overflow-hidden flex flex-col justify-center rounded-2xl bg-rich-black-800 border border-rich-black-700 p-6 shadow-lg transition-transform duration-300 hover:-translate-y-1 group ${borderClass}`}>
    <div className='absolute -right-4 -top-4 opacity-[0.04] pointer-events-none group-hover:scale-110 transition-transform duration-500'>
      <Icon className='text-9xl text-white' />
    </div>
    <div className='flex items-center gap-4 mb-4'>
      <div className={`p-3 rounded-xl ${colorClass}`}><Icon className='text-2xl' /></div>
      <h2 className='text-base font-semibold text-rich-black-200'>{label}</h2>
    </div>
    <p className='text-4xl font-extrabold text-rich-black-5 tracking-tight'>{value}</p>
  </motion.div>
);

export const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const response = await request(endpoints.GET_INSTRUCTOR_COURSES, 'GET');
      if (response.status === 401) { dispatch(logout(dispatch, navigate, false)); }
      else if (!response.ok) { throw new Error('Error fetching instructor courses'); }
      else { const data = await response.json(); setCourses(data.courses || []); }
    } catch (error) { toast.error('Failed to load dashboard data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCourses(); }, []);

  const totalCourses  = courses.length;
  const totalStudents = courses.reduce((acc, c) => acc + (c.studentEnrolled?.length || 0), 0);
  const totalIncome   = courses.reduce((acc, c) => acc + ((c.studentEnrolled?.length || 0) * (c.price || 0)), 0);
  const recentCourses = [...courses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

  return (
    <div className='flex w-full min-h-screen flex-col p-6 md:p-8 text-rich-black-5'>
      {/* Header */}
      <div className='mb-8'>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className='text-3xl md:text-4xl font-extrabold text-white tracking-tight'>
          Welcome back, {user?.fName || 'Instructor'} 👋
        </motion.h1>
        <p className='text-rich-black-300 mt-1 font-medium'>Here's what's happening with your courses today.</p>
      </div>

      {/* Quick Actions */}
      <div className='flex flex-wrap gap-3 mb-8'>
        <Link to='/dashboard/add-course'>
          <button className='flex items-center gap-2 px-4 py-2.5 bg-yellow-50 text-rich-black-900 text-sm font-bold rounded-xl hover:opacity-90 transition-all glow-yellow'>
            <FaPlus size={13} /> New Course
          </button>
        </Link>
        <Link to='/dashboard/my-courses'>
          <button className='flex items-center gap-2 px-4 py-2.5 bg-rich-black-700 text-rich-black-100 text-sm font-semibold rounded-xl border border-rich-black-600 hover:border-rich-black-500 hover:text-white transition-all'>
            <FiBarChart2 size={14} /> View All
          </button>
        </Link>
        <Link to='/dashboard/setting'>
          <button className='flex items-center gap-2 px-4 py-2.5 bg-rich-black-700 text-rich-black-100 text-sm font-semibold rounded-xl border border-rich-black-600 hover:border-rich-black-500 hover:text-white transition-all'>
            <FiSettings size={14} /> Settings
          </button>
        </Link>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-10'><SkeletonStat /><SkeletonStat /><SkeletonStat /></div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-10'>
          <StatCard icon={FaBook}       label='Total Courses'  value={totalCourses}                     colorClass='bg-blue-500/15 text-blue-400'   borderClass='stat-card-courses' />
          <StatCard icon={FaUsers}      label='Total Students' value={totalStudents}                    colorClass='bg-pink-500/15 text-pink-400'   borderClass='stat-card-students' />
          <StatCard icon={FaRupeeSign}  label='Total Income'   value={`₹${totalIncome.toLocaleString()}`} colorClass='bg-yellow-50/15 text-yellow-50' borderClass='stat-card-income' />
        </div>
      )}

      {/* Recent Courses */}
      <div className='bg-rich-black-800 rounded-2xl border border-rich-black-700 shadow-lg p-6 w-full'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-bold text-white flex items-center gap-2'><FiTrendingUp className='text-yellow-50' size={20} />Recent Courses</h2>
          <Link to='/dashboard/my-courses' className='flex items-center gap-1.5 text-sm text-yellow-50 hover:text-yellow-100 font-medium transition-colors'>View all <FaArrowRight size={12} /></Link>
        </div>

        {loading ? (
          <div className='space-y-4'>
            {[0,1,2].map((i) => (
              <div key={i} className='flex gap-4'>
                <div className='w-[180px] h-[100px] skeleton rounded-xl flex-shrink-0' />
                <div className='flex-1 space-y-3 py-1'>
                  <div className='h-4 w-3/4 skeleton rounded-md' />
                  <div className='h-3 w-full skeleton rounded-md' />
                  <div className='h-3 w-1/3 skeleton rounded-md' />
                </div>
              </div>
            ))}
          </div>
        ) : recentCourses.length === 0 ? (
          <div className='text-center py-12'>
            <div className='w-14 h-14 bg-rich-black-700 rounded-2xl flex items-center justify-center mx-auto mb-4'><FaBook className='text-rich-black-500 text-2xl' /></div>
            <p className='text-rich-black-300 mb-4'>No courses yet. Create your first one!</p>
            <Link to='/dashboard/add-course' className='inline-flex items-center gap-2 bg-yellow-50 text-rich-black-900 px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all glow-yellow'><FaPlus size={13} /> Create Course</Link>
          </div>
        ) : (
          <div className='flex flex-col divide-y divide-rich-black-700'>
            {recentCourses.map((course, i) => (
              <motion.div key={course._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className='flex flex-col md:flex-row gap-5 py-5 hover:bg-rich-black-700/30 rounded-xl px-3 transition-all cursor-pointer group'
                onClick={() => navigate(`/dashboard/edit-course/${course._id}`)}>
                <img src={course.thumbnail?.url} alt={course.title} className='w-full md:w-[200px] h-[110px] object-cover rounded-xl flex-shrink-0 group-hover:brightness-110 transition-all' />
                <div className='flex flex-col justify-center flex-1 gap-2'>
                  <div className='flex items-start justify-between gap-3'>
                    <h3 className='text-base font-bold text-rich-black-5 group-hover:text-yellow-50 transition-colors line-clamp-1'>{course.title}</h3>
                    <span className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      course.status === 'Published' ? 'bg-greenish-500/20 text-greenish-300 border-greenish-500/30'
                      : 'bg-rich-black-700 text-rich-black-300 border-rich-black-600'}`}>{course.status}</span>
                  </div>
                  <p className='text-sm text-rich-black-300 line-clamp-2'>{course.desc}</p>
                  <div className='flex items-center gap-6 mt-1'>
                    <div className='flex items-center gap-1.5 text-sm text-rich-black-200'><FaUsers size={13} className='text-rich-black-400' /><span className='font-semibold'>{course.studentEnrolled?.length || 0}</span><span className='text-rich-black-400'>students</span></div>
                    <div className='flex items-center gap-1.5 text-sm text-rich-black-200'><FaRupeeSign size={13} className='text-rich-black-400' /><span className='font-semibold'>₹{course.price?.toLocaleString() || 0}</span></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
