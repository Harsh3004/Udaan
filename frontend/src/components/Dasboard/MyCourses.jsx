import React, { useEffect, useState } from 'react'
import { request } from '../../services/operations/authApi'
import { endpoints } from '../../services/api'
import toast from 'react-hot-toast'

export const MyCourses = () => {
    const [courses,setCourses] = useState([]);
    
    const fetchCourses = async () => {
        try{
            const response = await request(endpoints.GET_INSTRUCTOR_COURSES,"GET");
            if(!response.ok)
                throw new Error("Error while fetching courses");

            const data = await response.json();
            setCourses(data.courses);
        }catch(error){
            toast.error("Try Again Later")
        }
    }
    
    useEffect(() => {
        fetchCourses()
        console.log("courses: ",courses)
    }, []);

    return (
      <div className='flex w-full h-full flex-col p-8'>
          <h1 className='text-3xl font-bold mb-6'>My Courses</h1>

          {courses.length > 0 ? (
              <div className='space-y-4'>
                  {courses.map((course) => (
                      <div key={course._id} className='bg-gray-800 p-4 rounded-lg shadow-lg flex items-center'>
                          <img 
                              src={course.thumbnail.url} 
                              alt={`${course.title} thumbnail`}
                              className='w-24 h-24 object-cover rounded-md mr-4'
                          />

                          <div className='flex-1'>
                              <h2 className='text-xl font-semibold'>{course.title}</h2>
                              <p className='text-gray-400'>{course.desc}</p>
                          </div>

                          <span className={`px-3 py-1 rounded-full text-sm ${
                              course.status === 'Draft' ? 'bg-yellow-500 text-black' : 'bg-green-500 text-white'
                          }`}>
                              {course.status}
                          </span>
                      </div>
                  ))}
              </div>
          ) : (
              <div className='text-gray-500'>
                  You have not created any courses yet.
              </div>
          )}
      </div>
    )
}   