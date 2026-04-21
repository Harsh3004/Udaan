import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { endpoints } from '../services/api';
import { request } from '../services/operations/authApi';
import { BrowseCourseCard } from '../components/BrowseCourseCard';
import SkeletonCard from '../components/SkeletonCard';
import { HighlightedText } from '../components/HighlightedText';
import { IoSearch } from 'react-icons/io5';
import { FiSliders } from 'react-icons/fi';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const Browse = () => {
  const user = useSelector((state) => state.profile?.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = useMemo(() => {
    const cats = courses.map((c) => c.category?.name).filter(Boolean);
    return ['All', ...Array.from(new Set(cats))];
  }, [courses]);

  const displayCourses = useMemo(() => {
    return courses.filter((c) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        c.title?.toLowerCase().includes(query) ||
        c.desc?.toLowerCase().includes(query) ||
        `${c.instructor?.fName ?? ''} ${c.instructor?.lName ?? ''}`.toLowerCase().includes(query);
      const matchesCategory = activeCategory === 'All' || c.category?.name === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchQuery, activeCategory]);

  const headline = useMemo(() => {
    if (user?.fName) return `Welcome back, ${user.fName}!`;
    return 'Explore Courses';
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await request(endpoints.SHOW_COURSES_API, 'GET');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Unable to load courses');
      const allCourses = data.courses || [];
      const published = allCourses.filter((c) => c.status === 'Published');
      setCourses(published.length > 0 ? published : allCourses);
    } catch (error) {
      toast.error(error.message || 'Failed to load courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className='bg-rich-black-900 min-h-screen text-white flex flex-col'>
      <div className='flex-1'>
        {/* Hero Banner */}
        <div className='bg-gradient-to-b from-rich-black-800/60 to-rich-black-900 border-b border-rich-black-800'>
          <div className='w-11/12 max-w-6xl mx-auto py-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6'>
            <div className='flex-1'>
              <p className='text-xs font-bold text-yellow-50/70 uppercase tracking-widest mb-2'>Course Catalogue</p>
              <h1 className='text-3xl md:text-4xl font-extrabold text-white tracking-tight'>
                {headline}&nbsp;
                <HighlightedText color='bg-gradient-05 text-transparent bg-clip-text'>Start Learning</HighlightedText>
              </h1>
              <p className='text-rich-black-300 mt-2 text-sm'>
                {courses.length > 0 ? `${courses.length} course${courses.length !== 1 ? 's' : ''} available` : 'Discover your next skill'}
              </p>
            </div>
            <div className='relative w-full sm:w-auto sm:min-w-[300px]'>
              <IoSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-rich-black-400' size={18} />
              <input
                type='text'
                placeholder='Search courses or instructors…'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full pl-11 pr-4 py-3 bg-rich-black-800 border border-rich-black-700 rounded-xl text-sm text-rich-black-5 placeholder:text-rich-black-500 focus:outline-none focus:border-yellow-50/50 focus:ring-1 focus:ring-yellow-50/20 transition-all'
              />
            </div>
          </div>
        </div>

        <div className='w-11/12 max-w-6xl mx-auto py-8'>
          {/* Category Filter Chips */}
          {!loading && categories.length > 1 && (
            <div className='flex items-center gap-2 flex-wrap mb-8'>
              <FiSliders size={14} className='text-rich-black-400 flex-shrink-0' />
              {categories.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                    activeCategory === cat
                      ? 'bg-yellow-50 text-rich-black-900 border-yellow-50'
                      : 'bg-transparent text-rich-black-200 border-rich-black-700 hover:border-rich-black-500 hover:text-white'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Skeleton Grid */}
          {loading && (
            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Empty States */}
          {!loading && courses.length === 0 && (
            <div className='flex flex-col items-center justify-center py-24 gap-4 text-center'>
              <div className='w-16 h-16 rounded-2xl bg-rich-black-800 flex items-center justify-center text-rich-black-500'><IoSearch size={28} /></div>
              <p className='text-rich-black-200 font-semibold'>No courses available right now.</p>
              <p className='text-rich-black-500 text-sm'>Check back soon — new content is on the way!</p>
            </div>
          )}
          {!loading && courses.length > 0 && displayCourses.length === 0 && (
            <div className='flex flex-col items-center justify-center py-24 gap-4 text-center'>
              <div className='w-16 h-16 rounded-2xl bg-rich-black-800 flex items-center justify-center text-rich-black-500'><IoSearch size={28} /></div>
              <p className='text-rich-black-200 font-semibold'>No results for "{searchQuery}"</p>
              <button onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} className='text-sm text-yellow-50 hover:underline'>Clear filters</button>
            </div>
          )}

          {/* Course Grid */}
          {!loading && displayCourses.length > 0 && (
            <motion.div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
              initial='hidden' animate='visible'
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}>
              {displayCourses.map((course) => (
                <motion.div key={course._id}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.35 }}>
                  <BrowseCourseCard
                    title={course.title}
                    description={course.desc || (Array.isArray(course.whatyouwilllearn) ? course.whatyouwilllearn.join(', ') : course.whatyouwilllearn)}
                    level={course.language || 'Self Paced'}
                    lessons={`${course.section?.length || 0} Section${course.section?.length !== 1 ? 's' : ''}`}
                    rating={course.avgRating}
                    reviewsCount={course.totalReviews || course.ratingAndReviews?.length || 0}
                    thumbnail={course.thumbnail}
                    price={course.price}
                    instructor={course.instructor}
                    onClick={() => navigate(`/course/${course._id}`)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Browse;
