import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { IoArrowBackCircle } from "react-icons/io5";
import { RenderSteps } from './RenderSteps';
import { useDispatch, useSelector } from 'react-redux'
import { resetCourseState } from '../../../slices/courseSlice'
import CoursePathModal from './CoursePathModal';
import DhruvChat from './DhruvChat';

/**
 * AddCourse — entry point for /dashboard/add-course
 *
 * Flow:
 *   1. Mount → CoursePathModal opens (choose Dhruv or Manual)
 *   2a. "Create with Dhruv" → DhruvChat full-screen modal opens
 *   2b. "Manual Creation"   → Modal closes, existing RenderSteps renders normally
 *   3. Dhruv success → dispatches setCourse + setStep(2) → DhruvChat closes →
 *      AddCourse now shows RenderSteps at step 2 (CourseBuilder)
 */
const AddCourse = () => {
  const dispatch = useDispatch()
  const course = useSelector((s) => s.course.course)

  // 'choosing' | 'dhruv' | 'manual'
  const [mode, setMode] = useState('choosing')

  useEffect(() => {
    // Only reset if we're not returning from Dhruv success (course already set)
    if (!course) {
      dispatch(resetCourseState())
    }
  }, [dispatch, course])

  const handleManual = () => setMode('manual')
  const handleDhruv  = () => setMode('dhruv')

  // Called when Dhruv creates the course successfully — fall through to RenderSteps
  const handleDhruvClose = () => setMode('manual')

  return (
    <>
      {/* ── Path selector modal — shown until instructor picks a path ── */}
      <CoursePathModal
        isOpen={mode === 'choosing'}
        onClose={() => setMode('manual')}  // Escape = default to manual
        onDhruv={handleDhruv}
        onManual={handleManual}
      />

      {/* ── Dhruv full-screen chat ── */}
      {mode === 'dhruv' && (
        <DhruvChat
          onClose={handleDhruvClose}
          onManualFallback={handleManual}
        />
      )}

      {/* ── Existing manual creation wizard (UNCHANGED) ── */}
      {(mode === 'manual' || mode === 'choosing') && (
        <div className='flex justify-between w-full'>
          <div className='relative w-5/6'>
            <Link
              className='flex items-center gap-1 text-rich-black-300 py-6 px-6 font-normal text-sm'
              to={'/dashboard/instructor'}
            >
              <IoArrowBackCircle /> Back to Dashboard
            </Link>
            <RenderSteps />
          </div>

          <div className='bg-rich-black-800 h-fit border border-rich-black-700 p-6 rounded-md space-y-4 text-left my-6 mx-4'>
            <p className='text-lg'>⚡Course Upload Tips</p>
            <ul className='list-disc pl-6 space-y-3 text-xs'>
              <li>Set the Course Price option or make it free.</li>
              <li>Standard size for the course thumbnail is 1024x576.</li>
              <li>Video section controls the course overview video.</li>
              <li>Course Builder is where you create &amp; organize a course.</li>
              <li>Add Topics in the Course Builder section to create lessons, quizzes, and assignments.</li>
              <li>Information from the Additional Data section shows up on the course single page.</li>
              <li>Make Announcements to notify any important</li>
              <li>Notes to all enrolled students at once.</li>
            </ul>
          </div>
        </div>
      )}
    </>
  )
}

export default AddCourse