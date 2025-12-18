import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { endpoints } from '../services/api';
import { request } from '../services/operations/authApi';
import { CourseCard } from '../components/CourseCard';
import { HighlightedText } from '../components/HighlightedText';
import { Sidebar } from '../components/Dasboard/Sidebar';

const ROW_LIMIT = 10;

const Browse = () => {
  const user = useSelector((state) => state.profile?.user);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);

  const headline = useMemo(() => {
    if (user?.fName) return `Welcome back, ${user.fName}`;
    return 'Explore Courses';
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const catRes = await request(endpoints.GET_ALL_CATEGORIES_API, 'GET');
      const catData = await catRes.json();
      if (!catRes.ok) {
        throw new Error(catData.message || 'Unable to load categories');
      }
      const categories = catData.categories || [];

      const rowsData = await Promise.all(
        categories.map(async (cat) => {
          try {
            const url = endpoints.GET_CATEGORY_COURSES_API.replace(':categoryId', cat._id);
            const res = await request(url, 'GET');
            const data = await res.json();
            if (!res.ok) {
              throw new Error(data.message || 'Unable to load courses');
            }
            return {
              _id: cat._id,
              name: cat.name,
              description: cat.description,
              courses: (data.courses || []).slice(0, ROW_LIMIT),
            };
          } catch (error) {
            toast.error(error.message || `Failed to load ${cat.name}`);
            return null;
          }
        })
      );

      const filtered = rowsData.filter((row) => row && row.courses && row.courses.length > 0);
      setRows(filtered);
    } catch (error) {
      toast.error(error.message || 'Failed to load catalog');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const renderRow = (row) => (
    <section key={row._id} className="mb-10">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xl font-semibold text-rich-black-5">{row.name}</p>
          {row.description ? (
            <p className="text-sm text-rich-black-300">{row.description}</p>
          ) : null}
        </div>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="grid grid-flow-col auto-cols-[minmax(250px,1fr)] gap-4 min-h-[320px]">
          {row.courses.map((course) => (
            <CourseCard
              key={course._id}
              title={course.title}
              description={course.desc || course.whatyouwilllearn}
              level={course.language || 'Self paced'}
              lessons={`${(course.section?.length || 0)} Sections`}
              isFeatured={course.status === 'Published'}
              rating={course.avgRating}
              reviewsCount={course.totalReviews || (course.ratingAndReviews ? course.ratingAndReviews.length : 0)}
            />
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <div className="bg-rich-black-900 min-h-screen text-white pt-6 pb-12 relative">
      {showSidebar && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 h-full bg-rich-black-800 shadow-2xl">
            <Sidebar />
          </div>
          <div
            className="flex-1 h-full bg-black bg-opacity-40"
            onClick={() => setShowSidebar(false)}
          ></div>
        </div>
      )}

      <div className="w-11/12 max-w-6xl mx-auto">
        <header className="mb-10 flex items-start justify-between gap-4">
          <button
            className="px-3 py-2 rounded-md border border-rich-black-700 text-sm text-rich-black-25 bg-rich-black-800 hover:bg-rich-black-700"
            onClick={() => setShowSidebar((prev) => !prev)}
          >
            {showSidebar ? 'Hide Menu' : 'Browse Menu'}
          </button>
          <div className="flex-1">
            <p className="text-3xl font-semibold text-rich-black-5 mb-2 flex items-center gap-2 flex-wrap">
              {headline}
              <HighlightedText color="bg-gradient-05 text-transparent bg-clip-text">
                Start Learning
              </HighlightedText>
            </p>
            <p className="text-rich-black-300">Dive into categories and find your next course.</p>
          </div>
        </header>

        {loading && <p className="text-rich-black-200">Loading courses...</p>}
        {!loading && rows.length === 0 && (
          <p className="text-rich-black-200">No courses available right now. Please check back soon.</p>
        )}
        {!loading && rows.map(renderRow)}
      </div>
    </div>
  );
};

export default Browse;
