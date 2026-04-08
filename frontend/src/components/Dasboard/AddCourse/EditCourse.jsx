import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { setCourse, setEditCourse, setStep } from '../../../slices/courseSlice'
import { request } from '../../../services/operations/authApi'
import { endpoints } from '../../../services/api'
import toast from 'react-hot-toast'
import { RenderSteps } from './RenderSteps'

export default function EditCourse() {
  const dispatch = useDispatch()
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFullCourseDetails = async () => {
      setLoading(true)
      try {
        const response = await request(`${endpoints.GET_COURSE_DETAILS_API}/${courseId}`, 'GET')
        const data = await response.json()
        
        if (data?.success) {
          dispatch(setEditCourse(true)) 
          dispatch(setCourse(data.courseDetails)) 
          
          dispatch(setStep(1)) 
        } else {
          toast.error("Could not fetch course details")
          navigate("/dashboard/my-courses")
        }
      } catch (error) {
        console.error(error)
        toast.error("Error fetching course details")
      }
      setLoading(false)
    }

    if (courseId) {
      fetchFullCourseDetails()
    }
  }, [courseId, dispatch, navigate])

  if (loading) {
    return (
      <div className="grid flex-1 place-items-center h-[calc(100vh-3.5rem)]">
        <div className="text-white text-xl">Loading Course Data...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-11/12 max-w-[1000px] py-10">
      <h1 className="mb-14 text-3xl font-medium text-rich-black-5">
        Edit Course
      </h1>
      
      <div className="mx-auto max-w-[600px]">
        <RenderSteps/>
      </div>
    </div>
  )
}