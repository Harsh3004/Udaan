import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { endpoints } from '../services/api';
import { request } from '../services/operations/authApi';
import { HighlightedText } from '../components/HighlightedText';

const CourseDetails = () => {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState(null);

  const fetchCourse = async () => {
    if(!courseId) return;
    setLoading(true);
    try{
      const url = `${endpoints.GET_COURSE_DETAILS_API}/${courseId}`;
      const res = await request(url, 'GET');
      const data = await res.json();
      if(!res.ok){
        throw new Error(data.message || 'Unable to fetch course');
      }
      setCourse(data.courseDetails || data.course || null);
    }catch(error){
      toast.error(error.message || 'Failed to load course');
      setCourse(null);
    }finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  if(loading){
    return <div className='min-h-screen bg-rich-black-900 text-white flex items-center justify-center'>Loading course...</div>
  }

  if(!course){
    return <div className='min-h-screen bg-rich-black-900 text-white flex items-center justify-center'>Course not found.</div>
  }

  const cover = (typeof course.thumbnail === 'string') ? course.thumbnail : (course.thumbnail?.url || '');
  const totalSections = course.section?.length || 0;
  const totalLessons = course.section?.reduce((acc, sec) => acc + (sec.subsection?.length || 0), 0) || 0;
  const rating = course.avgRating || (course.ratingAndReviews && course.ratingAndReviews.length ? (course.ratingAndReviews.reduce((a,b)=> a + (b.rating || 0),0) / course.ratingAndReviews.length).toFixed(1) : null);
  return (
    <div className='bg-rich-black-900 min-h-screen text-white'>
      <div className='w-11/12 max-w-6xl mx-auto py-12 gap-8'>
        <div className='lg:col-span-2 space-y-4'>
          <p className='text-3xl font-semibold text-rich-black-5 flex items-center gap-2 flex-wrap'>
            {course.title}
            <HighlightedText color="bg-gradient-05 text-transparent bg-clip-text">Course</HighlightedText>
          </p>
          <p className='text-rich-black-200'>{course.desc || course.whatyouwilllearn}</p>
          <div className='flex gap-4 text-sm text-rich-black-200'>
            <span>{course.language || 'Self paced'}</span>
            <span>•</span>
            <span>{totalSections} sections</span>
            <span>•</span>
            <span>{totalLessons} lessons</span>
          </div>
        </div>

        <div className='flex box-border gap-5'>
            <div className='col-span-2 w-3/4'>
                <div className='mt-6 space-y-3'>
                <p className='text-xl font-semibold text-rich-black-5'>Curriculum</p>
                {course.section?.length ? course.section.map((sec) => {
                  const lectures = Array.isArray(sec.subsection) ? sec.subsection : [];
                  return (
                    <details key={sec._id || sec.title} className='bg-rich-black-800 rounded-lg border border-rich-black-700'>
                      <summary className='cursor-pointer px-4 py-3 font-medium text-rich-black-5'>{sec.title}</summary>
                      {lectures.length ? (
                        <ul className='px-6 py-2 list-disc text-sm text-rich-black-200'>
                          {lectures.map((sub) => (
                            <li key={sub._id || sub.topic} className='mb-1'>
                              <span className='font-medium text-rich-black-5'>{sub.title || sub.topic}</span>
                              {sub.description ? <span className='text-rich-black-300'> — {sub.description}</span> : null}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className='px-6 py-3 text-sm text-rich-black-300'>No lectures added yet.</p>
                      )}
                    </details>
                  );
                }) : <p className='text-rich-black-300 text-sm'>No curriculum added yet.</p>}
                </div>
            </div>

            <div className='bg-rich-black-800 border border-rich-black-700 rounded-xl p-6 space-y-4'>
                {cover && (
                    <div className='overflow-hidden rounded-lg border border-rich-black-700'>
                    <img src={cover} alt={course.title} className='object-cover' width={400}/>
                </div>
                )}
                <p className='text-3xl font-semibold text-yellow-50'>₹ {course.price}</p>
                <button className='w-full bg-yellow-50 text-rich-black-900 font-semibold py-3 rounded-lg hover:bg-yellow-400 transition-colors'>
                    Buy Now
                </button>
                <div className='text-sm text-rich-black-200 space-y-1'>
                    <p>{rating ? `${rating} ★` : 'No ratings yet'}</p>
                    <p>{course.category?.name || 'Uncategorized'}</p>
                    <p>Instructor: {course.instructor?.fName ? `${course.instructor.fName} ${course.instructor.lName || ''}` : 'N/A'}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
