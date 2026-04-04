import React from 'react';
import { FaUserGraduate, FaBookOpen, FaStar } from 'react-icons/fa'

export const BrowseCourseCard = ({ title, description, level, lessons, isFeatured, rating, reviewsCount, thumbnail, onClick }) => {
  const metaLevel = level || 'Self paced';
  const metaLessons = lessons || 'Flexible schedule';
  const metaRating = rating ? `${rating} ★` : 'No ratings yet';
  const metaReviews = reviewsCount ? `(${reviewsCount})` : '';
  const cover = (typeof thumbnail === 'string') ? thumbnail : (thumbnail?.url || '');

  const displayDesc = description?.length > 70 
    ? description.substring(0, 70) + '... '
    : description;

  return (
    <article
      onClick={onClick}
      className={`relative w-[300px] h-[400px] flex flex-col overflow-hidden rounded-lg bg-rich-black-800 text-white shadow-lg transition-all duration-500 hover:translate-y-[-5px] hover:bg-white hover:text-rich-black-800 hover:shadow-card-shadow ${onClick ? 'cursor-pointer' : ''}`}
    >
      {cover && (
        <div className="h-44 w-full overflow-hidden shrink-0">
          <img src={cover} alt={title} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex flex-col p-5">
        <h3 className="mb-2 text-xl font-semibold line-clamp-2">{title}</h3>
        <p className="text-rich-black-400 text-sm">
          {displayDesc}
          {description?.length > 70 && (
            <span className="text-blue-400 font-medium ml-1">Read more</span>
          )}
        </p>
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between border-t border-gray-700 p-4 text-rich-black-400 text-xs gap-y-2 gap-x-1">
        <div className="flex items-center space-x-1">
          <FaStar className={`h-4 w-4 ${rating ? 'text-yellow-400' : ''}`} />
          <span>{metaRating} {metaReviews}</span>
        </div>
        <div className="flex items-center space-x-1 whitespace-nowrap">
          <FaUserGraduate className="h-4 w-4 shrink-0" />
          <span>{metaLevel}</span>
        </div>
        <div className="flex items-center space-x-1 whitespace-nowrap">
          <FaBookOpen className="h-4 w-4 shrink-0" />
          <span>{metaLessons}</span>
        </div>
      </div>
    </article>
  );
};
