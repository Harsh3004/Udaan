import React, { useEffect, useState } from 'react'
import { request } from '../../services/operations/authApi'
import { endpoints } from '../../services/api'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { logout } from '../../services/functions/auth'
import { useNavigate } from 'react-router-dom'
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { BsCheckCircleFill, BsFillCircleFill } from 'react-icons/bs';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { IoAddCircleOutline } from 'react-icons/io5'
import { Modal } from '../Modal'

export const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleEditCourse = (courseId) => {
    navigate(`/dashboard/edit-course/${courseId}`);
  };

  const handleManageCourse = (courseId) => {
    navigate(`/dashboard/manage-course/${courseId}`);
  };
  
  const handleDeleteBtnClick = (courseId) => {
    setCourseToDelete(courseId);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;

    setIsModalOpen(false); 
    
    const toastId = toast.loading("Deleting Course..");
    try {
      const response = await request(`${endpoints.DELETE_COURSE_API}/${courseToDelete}`, 'DELETE');
      const data = await response.json();
  
      if (data.success) {
        toast.dismiss(toastId);
        toast.success("Course deleted successfully!");
        setCourses((prevCourses) => prevCourses.filter((course) => course._id !== courseToDelete));
      } else {
        toast.dismiss(toastId);
        toast.error(data.message);
      }
    } catch (error) {
      toast.dismiss(toastId); 
      toast.error("Failed to delete course.");
      console.error(error);
    }

    // Reset the tracked course
    setCourseToDelete(null);
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
    setCourseToDelete(null);
  };

  const fetchCourses = async () => {
    try{
      const response = await request(endpoints.GET_INSTRUCTOR_COURSES,"GET");
      if(response.status === 401)
        dispatch(logout(dispatch,navigate,false));
      else if(!response.ok)
        throw new Error("Error while fetching courses");
      else{
        const data = await response.json();
        setCourses(data.courses);
      }
      setLoading(false);
    }catch(error){
      setLoading(false); 
      toast.error("Try Again Later")
    }
  }
  
  useEffect(() => {
    fetchCourses()
  }, []);

  return (
    <div className='flex w-9/12 mx-auto min-h-screen flex-col py-8 text-rich-black-900'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold mb-6 text-rich-black-5'>
          My Courses
        </h1>

        <button 
          type='submit'
          className='flex items-center gap-2 font-medium bg-yellow-50 text-rich-black-900 border rounded-lg px-6 py-3 w-fit'
          onClick={() => navigate('/dashboard/add-course')}
        >
          <IoAddCircleOutline className='text-lg'/>
          <span className='text-lg'>Add Course</span>
        </button>
      </div>
      
      {loading ? (
        <div className='text-center text-gray-500 text-lg mt-10'>
          Loading your courses...
        </div>
      ) : courses.length > 0 ? (
        <Table className='w-full border-separate border-spacing-y-4'>
          
          <Thead className='hidden md:table-header-group'>
            <Tr className='text-sm font-medium text-gray-500 uppercase'>
              <Th className='py-3 text-left pl-5'>Courses</Th>
              <Th className='py-3 text-left'>Duration</Th>
              <Th className='py-3 text-left'>Price</Th>
              <Th className='py-3 text-left'>Actions</Th>
            </Tr>
          </Thead>

          <Tbody>
            {courses.map((course) => (
              <Tr key={course._id} className="cursor-pointer" onClick={() => handleManageCourse(course._id)}>
                
                <Td className='p-4 bg-rich-black-800 shadow-md rounded-l-lg align-top'>
                  <div className='flex items-start space-x-5'>
                    <img 
                      src={course.thumbnail.url} 
                      alt={`${course.title} thumbnail`}
                      className='w-48 h-32 object-cover rounded-md' 
                    />
                    <div className='flex flex-col'>
                      <h2 className='text-lg font-semibold text-rich-black-5'>{course.title}</h2>
                      <p className='text-rich-black-50 text-sm mt-1'>{course.desc}</p>
                      <span className={`mt-4 inline-flex items-center gap-x-2 px-3 py-1 rounded-full text-xs font-medium w-fit ${
                        course.status === 'Draft' 
                        ? 'bg-pink-100 text-pink-700'
                        : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {course.status === 'Draft' 
                          ? <BsFillCircleFill className='text-pink-700' />
                          : <BsCheckCircleFill className='text-yellow-800' />
                        }
                        {course.status}
                      </span>
                    </div>
                  </div>
                </Td>

                <Td className='p-4 bg-rich-black-800 shadow-md align-top'>
                  <span className='text-rich-black-5 text-sm'>
                    {course.duration || 'N/A'}
                  </span>
                </Td>

                <Td className='p-4 bg-rich-black-800 shadow-md align-top'>
                  <span className='text-rich-black-50 text-sm'>
                    ₹{course.price || 0}
                  </span>
                </Td>

                <Td className='p-4 bg-rich-black-800 shadow-md rounded-r-lg align-top'>
                  <div className='flex items-center space-x-4'>
                    <button className='text-rich-black-50 hover:text-blue-600 transition-colors' title="Edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCourse(course._id);
                    }}
                    >
                      <FaPencilAlt />
                    </button>
                    <button 
                      className={`${
                        course.studentEnrolled?.length > 0 
                          ? 'text-rich-black-500 cursor-not-allowed' 
                          : 'text-rich-black-50 hover:text-red-600'
                      } transition-colors`} 
                      title={course.studentEnrolled?.length > 0 ? "Cannot delete course with enrolled students" : "Delete"}
                      disabled={course.studentEnrolled?.length > 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBtnClick(course._id);
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </Td>
                
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <div className='text-center text-gray-500 text-lg mt-10'>
          You have not created any courses yet.
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={cancelDelete} 
        onConfirm={confirmDelete} 
        title="Delete Course"
      >
        Are you sure you want to delete this course? All sections, videos, and student progress associated with it will be permanently removed.
      </Modal>

    </div>
  );
}