import React, { useState, useEffect } from 'react'
import { FiPlayCircle, FiCheckCircle, FiClock } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

// Dummy Data for Enrolled Courses
const DUMMY_ENROLLED_COURSES = [
  {
    _id: "course_1",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000&auto=format&fit=crop",
    courseName: "The Complete Full-Stack Web Development Bootcamp",
    courseDescription: "Learn full-stack web development from scratch with hands-on projects.",
    totalDuration: "32h 45m",
    progressPercentage: 45,
    status: "In Progress"
  },
  {
    _id: "course_2",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop",
    courseName: "Advanced React patterns and Performance Optimization",
    courseDescription: "Master advanced React concepts including hooks, context, state management.",
    totalDuration: "18h 20m",
    progressPercentage: 12,
    status: "In Progress"
  },
  {
    _id: "course_3",
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?q=80&w=1000&auto=format&fit=crop",
    courseName: "UX/UI Design Principles & Figma Mastery",
    courseDescription: "Create stunning user interfaces and intuitive user experiences.",
    totalDuration: "24h 15m",
    progressPercentage: 100,
    status: "Completed"
  }
];

const EnrolledCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Simulating API call fetching enrolled courses
    setTimeout(() => {
      setEnrolledCourses(DUMMY_ENROLLED_COURSES)
    }, 1200)
  }, [])

  return (
    <div className='flex w-full min-h-screen flex-col p-8 text-rich-black-900 z-10'>
      <div className='flex flex-col gap-2 mb-8'>
        <h1 className='text-3xl font-bold text-rich-black-5'>Enrolled Courses</h1>
        <p className='text-rich-black-100'>Track your enrolled courses and pick up where you left off.</p>
      </div>

      {!enrolledCourses ? (
        <div className='flex justify-center items-center h-[50vh]'>
           <div className='w-12 h-12 border-4 border-yellow-50 border-t-transparent rounded-full animate-spin'></div>
        </div>
      ) : enrolledCourses.length === 0 ? (
        <div className='flex flex-col justify-center items-center h-[50vh] gap-4'>
           <p className='text-rich-black-100 text-lg'>You haven't enrolled in any courses yet.</p>
           <button 
             onClick={() => navigate('/browse')}
             className='bg-yellow-50 text-rich-black-900 font-semibold px-6 py-3 rounded-md hover:scale-95 transition-all duration-200'
           >
             Browse Courses
           </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {enrolledCourses.map((course) => (
            <div 
              key={course._id} 
              className='flex flex-col bg-rich-black-800 rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(255,214,10,0.1)] hover:shadow-[12px_12px_0px_0px_rgba(255,214,10,0.2)] hover:-translate-y-1 transition-all duration-300 border border-rich-black-700 cursor-pointer group'
              onClick={() => navigate(`/course/${course._id}`)}
            >
              <div className='relative w-full h-48 overflow-hidden'>
                <img 
                  src={course.thumbnail} 
                  alt={course.courseName}
                  className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-rich-black-900/90 to-transparent flex flex-col justify-end p-4 opacity-100 transition-opacity duration-300'>
                   <span className={`w-max px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md ${
                        course.status === 'Completed' 
                        ? 'bg-greenish-500/90 text-white'
                        : 'bg-yellow-50/90 text-rich-black-900'
                      }`}>
                     {course.status === 'Completed' ? <FiCheckCircle size={14} /> : <FiPlayCircle size={14} />}
                     {course.status}
                   </span>
                </div>
              </div>

              <div className='flex flex-col p-6 h-full justify-between'>
                <div>
                  <h2 className='text-xl font-semibold text-rich-black-5 line-clamp-2 mb-2 group-hover:text-yellow-50 transition-colors duration-300'>
                    {course.courseName}
                  </h2>
                  <p className='text-sm text-rich-black-100 line-clamp-2 mb-5'>
                    {course.courseDescription}
                  </p>
                </div>

                <div className='flex flex-col gap-3 mt-auto'>
                  <div className='flex items-center justify-between text-sm text-rich-black-100 font-medium'>
                    <div className='flex items-center gap-1.5 text-rich-black-50'>
                       <FiClock size={16} />
                       <span>{course.totalDuration}</span>
                    </div>
                    <span>{course.progressPercentage}% Completed</span>
                  </div>
                  
                  {/* Progress Bar Container */}
                  <div className='w-full h-2.5 bg-rich-black-700 rounded-full overflow-hidden shadow-inner'>
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                         course.status === 'Completed' ? 'bg-greenish-500' : 'bg-yellow-50'
                      }`}
                      style={{ width: `${course.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EnrolledCourses