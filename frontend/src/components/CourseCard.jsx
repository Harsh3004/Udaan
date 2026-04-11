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
      className={`relative w-[310px] h-[460px] flex flex-col overflow-hidden rounded-xl bg-rich-black-800 text-white shadow-xl transition-all duration-300 hover:scale-[1.02] border border-rich-black-700/50 ${onClick ? 'cursor-pointer' : ''}`}
    >
      {cover && (
        <div className="h-44 w-full shrink-0 overflow-hidden">
          <img src={cover} alt={title} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex-grow p-6 flex flex-col gap-3">
        <h3 className="text-xl font-bold line-clamp-2 leading-tight h-[3.5rem]">{title}</h3>
        <p className="text-rich-black-300 text-sm line-clamp-3 leading-relaxed">
          {description}
        </p>
      </div>
      <div className="flex items-center justify-between border-t border-rich-black-700 p-5 bg-rich-black-900/40 text-rich-black-400 text-xs font-medium">
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