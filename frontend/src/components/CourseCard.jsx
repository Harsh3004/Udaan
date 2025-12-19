import React from 'react';
import { FaUserGraduate, FaBookOpen, FaStar } from 'react-icons/fa'

export const CourseCard = ({ title, description, level, lessons, isFeatured, rating, reviewsCount, thumbnail, onClick }) => {
  const metaLevel = level || 'Self paced';
  const metaLessons = lessons || 'Flexible schedule';
  const metaRating = rating ? `${rating} ★` : 'No ratings yet';
  const metaReviews = reviewsCount ? `(${reviewsCount})` : '';
  const cover = (typeof thumbnail === 'string') ? thumbnail : (thumbnail?.url || '');
  return (
    <article
      onClick={onClick}
      className={`relative md:w-[300px] lg:min-h-[300px] flex flex-col overflow-hidden rounded-lg bg-rich-black-800 text-white shadow-lg transition-all duration-500 hover:translate-y-[-5px] hover:bg-white hover:text-rich-black-800  hover:shadow-card-shadow ${onClick ? 'cursor-pointer' : ''}`}
    >
      {cover && (
        <div className="h-40 w-full overflow-hidden">
          <img src={cover} alt={title} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex-grow p-5 pb-10">
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="text-rich-black-400">{description}</p>
      </div>
      <div className="flex items-center justify-between border-t border-gray-700 p-4 text-rich-black-400">
        <div className="flex items-center space-x-2">
          <FaStar className={`h-5 w-5 ${rating ? 'text-yellow-400' : ''}`} />
          <span>{metaRating} {metaReviews}</span>
        </div>
        <div className="flex items-center space-x-2">
          <FaUserGraduate className="h-5 w-5" />
          <span>{metaLevel}</span>
        </div>
        <div className="flex items-center space-x-2">
          <FaBookOpen className="h-5 w-5" />
          <span>{metaLessons}</span>
        </div>
      </div>
    </article>
  );
};