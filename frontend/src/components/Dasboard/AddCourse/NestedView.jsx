import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import AddSubsectionModal from './AddSubsectionModal';
import { MdEdit } from "react-icons/md";
import { AiTwotoneDelete } from "react-icons/ai";
import { CgFormatLineHeight } from "react-icons/cg";
import { IoMdArrowDropdown, IoMdAdd } from "react-icons/io";

const NestedView = ({seteditSectionName}) => {
  const [viewSubSection,setviewSubSection] = useState(null);
  const [editSubSection,seteditSubSection] = useState(null);
  const [addSubSection,setaddSubSection] = useState(null);
  const [confirmModal,setconfirmModal] = useState(false);

  const course = useSelector((state) => state.course.course);
  console.log('Course: ',course.section[0])
  console.log({course});
  const deleteSection = () => {
    // Function to delete section
  }

  return (
    <>
    <div className='flex flex-col py-4 gap-3 bg-rich-black-700 rounded-lg'>
      {
        course?.section.map((section) => {
          return (
          <details key={section._id} className='px-4 text-rich-black-5'>
            <summary className='flex justify-between items-center border-b-2 border-rich-black-600 py-3'>
              <p className='flex items-center gap-2 font-semibold text-rich-black-50'> <CgFormatLineHeight /> {section.title}</p>
              <div className='flex gap-4 items-center'>
                <div onClick={() => seteditSectionName(section._id)}>
                  <MdEdit />
                </div>
                <div onClick={() => deleteSection(section._id)}>
                  <AiTwotoneDelete />
                </div>
                <div className='bg-rich-black-50 w-[1px] h-6'></div>
                <IoMdArrowDropdown />
              </div>
            </summary>

            {/* // Subsection to be rendered here  */}
            {
              section.subsection.map((subsection) => {
                console.log('Subsection: ', {subsection});
                return (
                  <p>{subsection.topic}</p>
                )
              })
            }

            <button onClick={() => setaddSubSection(section._id)} className='flex items-center gap-1 py-3 font-semibold text-yellow-50'>
              <IoMdAdd />
              Add Lecture
            </button>
          </details>
        )})
      }

    </div>
    
    {
      addSubSection ? <AddSubsectionModal addSubSection={addSubSection} setaddSubSection={setaddSubSection}/> : <div></div>
    }
    </>
  )
}

export default NestedView