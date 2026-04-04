import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { endpoints } from '../services/api';
import { request } from '../services/operations/authApi';
import { BrowseCourseCard } from '../components/BrowseCourseCard';
import { HighlightedText } from '../components/HighlightedText';
import { IoSearch } from 'react-icons/io5';

const Browse = () => {
  const user = useSelector((state) => state.profile?.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const displayCourses = courses.filter((c) => {
    const query = searchQuery.toLowerCase();
    const matchesTitle = c.title?.toLowerCase().includes(query);
    const matchesDesc = c.desc?.toLowerCase().includes(query) || c.whatyouwilllearn?.toLowerCase().includes(query);
    
    // Check instructor match
    const instructorFName = c.instructor?.fName?.toLowerCase() || '';
    const instructorLName = c.instructor?.lName?.toLowerCase() || '';
    const instructorFullName = `${instructorFName} ${instructorLName}`;
    const matchesInstructor = instructorFullName.includes(query);

    return matchesTitle || matchesDesc || matchesInstructor;
  });

  const headline = useMemo(() => {
    if (user?.fName) return `Welcome back, ${user.fName}`;
    return 'Explore Courses';
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await request(endpoints.SHOW_COURSES_API, 'GET');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Unable to load courses');
      }

      const allCourses = data.courses || [];
      // If we only want published courses:
      const published = allCourses.filter(c => c.status === 'Published');
      // Showing published if they exist, otherwise all courses.
      setCourses(published.length > 0 ? published : allCourses);
    } catch (error) {
      toast.error(error.message || 'Failed to load courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="bg-rich-black-900 min-h-screen text-white pt-6 pb-12 relative">
      <div className="w-11/12 max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex-1">
            <p className="text-3xl font-semibold text-rich-black-5 mb-2 flex items-center gap-2 flex-wrap">
              {headline}
              <HighlightedText color="bg-gradient-05 text-transparent bg-clip-text">
                Start Learning
              </HighlightedText>
            </p>
            <p className="text-rich-black-300">Dive in and find your next course.</p>
          </div>
          <div className="relative w-full sm:w-auto min-w-[280px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-rich-black-400">
              <IoSearch size={20} />
            </div>
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-rich-black-800 border border-rich-black-700 rounded-lg text-rich-black-5 focus:outline-none focus:border-yellow-50 focus:ring-1 focus:ring-yellow-50 transition-colors"
            />
          </div>
        </header>

        {loading && <p className="text-rich-black-200 text-lg">Loading courses...</p>}
        {!loading && courses.length === 0 && (
          <p className="text-rich-black-200 text-lg">No courses available right now. Please check back soon.</p>
        )}
        {!loading && courses.length > 0 && displayCourses.length === 0 && (
          <p className="text-rich-black-200 text-lg">No courses found matching "{searchQuery}".</p>
        )}
        {!loading && displayCourses.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] justify-items-center gap-10 min-h-[320px]">
            {displayCourses.map((course) => (
              <BrowseCourseCard
                key={course._id}
                title={course.title}
                description={course.desc || course.whatyouwilllearn}
                level={course.language || 'Self paced'}
                lessons={`${(course.section?.length || 0)} Sections`}
                isFeatured={course.status === 'Published'}
                rating={course.avgRating}
                reviewsCount={course.totalReviews || (course.ratingAndReviews ? course.ratingAndReviews.length : 0)}
                thumbnail={course.thumbnail}
                onClick={() => navigate(`/course/${course._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;
