import React from 'react';
import { FaUserGraduate, FaBookOpen } from 'react-icons/fa'

export const CourseCard = ({ title, description, level, lessons, isFeatured }) => {
  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-lg bg-rich-black-800 text-white shadow-lg transition-all duration-500 hover:translate-y-[-5px] hover:bg-white hover:text-rich-black-800  hover:shadow-card-shadow`}
    >
      <div className="flex-grow p-5 pb-10">
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="text-rich-black-400">{description}</p>
      </div>
      <div className="flex items-center justify-between border-t border-gray-700 p-4 text-rich-black-400">
        <div className="flex items-center space-x-2">
          <FaUserGraduate className="h-5 w-5" />
          <span>{level}</span>
        </div>
        <div className="flex items-center space-x-2">
          <FaBookOpen className="h-5 w-5" />
          <span>{lessons}</span>
        </div>
      </div>
    </article>
  );
};