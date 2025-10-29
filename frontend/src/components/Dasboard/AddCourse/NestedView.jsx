import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import SubsectionModal from './SubsectionModal';
import { MdEdit } from "react-icons/md";
import { AiTwotoneDelete } from "react-icons/ai";
import { CgFormatLineHeight } from "react-icons/cg";
import { IoMdArrowDropdown, IoMdAdd } from "react-icons/io";
import { RxEyeOpen } from "react-icons/rx";
import toast from 'react-hot-toast';

const NestedView = ({seteditSectionName}) => {
    const [subsectionModalData, setSubsectionModalData] = useState(null); 
    const [confirmModal, setconfirmModal] = useState(false);

    const course = useSelector((state) => state.course.course);
    
    const handleAddSubsection = (sectionId) => {
        setSubsectionModalData({ 
            sectionId: sectionId,
            initialData: null, 
        });
    };

    const handleEditSubsection = (sectionId, subsection) => {
      setSubsectionModalData({
          sectionId: sectionId, 
          initialData: {
              _id: subsection._id,
              title: subsection.topic, 
              description: subsection.description,
              lectureVideo: subsection.file.url,
          },
      });
    };

    const deleteSection = () => {
        // Function to delete section
    }

    const handleDeleteSubsection = (subsectionId) => {
        // Function to delete subsection
        toast.error("Delete function placeholder");
    }


    return (
        <>
        <div className='flex flex-col py-4 gap-3 bg-rich-black-700 rounded-lg'>
            {
                course?.section?.map((section) => {
                    return (
                        <details key={section._id} className='px-4 text-rich-black-5'>
                            <summary className='flex justify-between items-center border-b-2 border-rich-black-600 py-3 cursor-pointer'>
                                <p className='flex items-center gap-2 font-semibold text-rich-black-50'> <CgFormatLineHeight /> {section.title}</p>
                                <div className='flex gap-4 items-center'>
                                    <div onClick={() => seteditSectionName(section._id)} className='cursor-pointer hover:text-yellow-50'>
                                        <MdEdit />
                                    </div>
                                    <div onClick={() => deleteSection(section._id)} className='cursor-pointer hover:text-red-500'>
                                        <AiTwotoneDelete />
                                    </div>
                                    <div className='bg-rich-black-50 w-[1px] h-6'></div>
                                    <IoMdArrowDropdown />
                                </div>
                            </summary>

                            {
                                section.subsection.map((subsection) => {
                                    return (
                                        <div key={subsection._id} className='flex justify-between items-center border-b border-rich-black-600 ml-5 py-3'>
                                            <p className='flex items-center gap-2 text-sm font-normal text-rich-black-200'> <CgFormatLineHeight /> {subsection.topic}</p>
                                            <div className='flex gap-4 items-center'>
                                                
                                                <div onClick={() => handleEditSubsection(section._id, subsection)} className='cursor-pointer hover:text-yellow-50' title="Edit Lecture">
                                                    <MdEdit />
                                                </div>
                                                
                                                <div onClick={() => handleDeleteSubsection(subsection._id)} className='cursor-pointer hover:text-red-500' title="Delete Lecture">
                                                    <AiTwotoneDelete />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }

                            <button onClick={() => handleAddSubsection(section._id)} className='flex items-center gap-1 py-3 font-semibold text-yellow-50 hover:text-yellow-100 transition-colors'>
                                <IoMdAdd />
                                Add Lecture
                            </button>
                        </details>
                    )
                })
            }
        </div>
        
        {
            subsectionModalData && (
                <SubsectionModal 
                    sectionId={subsectionModalData.sectionId} 
                    initialData={subsectionModalData.initialData}
                    setModal={setSubsectionModalData}
                />
            )
        }
        </>
    )
}

export default NestedView