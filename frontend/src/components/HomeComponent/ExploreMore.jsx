import React, { useState } from 'react'
import { HomePageExplore } from '../../data/exploreCourses';
import { HighlightedText } from '../HighlightedText';
import { CourseCard } from '../CourseCard';

const tabsName = [
    "Free",
    "New to coding",
    "Most Popular",
    "Skill Paths",
    "Career Path"
];

export const ExploreMore = () => {
    const [currentTab, setCurrentTab] = useState(tabsName[0]);
    const [courses , setCourses] = useState(HomePageExplore[0].courses);

    const setMyCards = (value) => {
        setCurrentTab(value);
        const result = HomePageExplore.filter((course) => course.tag === value);
        setCourses(result[0].courses);
    };

  return (
    <div className='flex flex-col items-center md:pb-56 text-white py-20'>
        <div className='flex flex-col gap-2 items-center text-rich-black-5'>
            <p className='text-4xl font-semibold'>
                Unlock the 
                <HighlightedText color='bg-gradient-05 text-transparent bg-clip-text'>
                    Power of Code 
                </HighlightedText>
            </p>
            <p className='text-rich-Black-300 font-medium'> 
                Learn to Build Anything You Can Imagine
            </p>
        </div>

        <div className='flex justify-center items-center bg-rich-black-800 w-fit mx-auto rounded-full mt-5 border border-rich-black-5 border-opacity-20'>
            {
                tabsName.map((element,index) => {
                    return (
                        <div 
                        className={`text-base rounded-full transition-all duration-200 cursor-pointer hover:bg-rich-black-800 px-2 lg:px-5 py-2 
                        ${currentTab === element ? "bg-rich-black-900 text-rich-black-5 font-medium" : "bg-rich-black-800 text-rich-black-5 font-light"} 
                        `}
                        key={index}
                        onClick={() => setMyCards(element)}
                        >
                            {element}
                        </div>
                    )
                })

            }

        </div>

        <div className="lg:absolute flex flex-col lg:flex-row justify-center gap-10 md:mt-40 py-10 w-4/5">
                {courses.map((course, index) => (
                    <CourseCard
                      key={index}
                      title={course.title}
                      description={course.description}
                      level={course.level}
                      lessons={course.lessons}
                      isFeatured={course.isFeatured}
                    />
                ))}
        </div>
    </div>
  )
}
