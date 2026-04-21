import React from 'react';
import { FaStar, FaRegStar, FaUserTie } from 'react-icons/fa';
import { FiBookOpen, FiLayers } from 'react-icons/fi';

const StarRating = ({ rating }) => {
  const stars = Math.round(rating || 0);
  return (
    <div className='flex items-center gap-0.5'>
      {[1, 2, 3, 4, 5].map((s) =>
        s <= stars
          ? <FaStar key={s} className='text-yellow-50 w-3 h-3' />
          : <FaRegStar key={s} className='text-rich-black-600 w-3 h-3' />
      )}
    </div>
  );
};

export const BrowseCourseCard = ({
  title, description, level, lessons, rating, reviewsCount,
  thumbnail, price, instructor, onClick,
}) => {
  const cover = (typeof thumbnail === 'string') ? thumbnail : (thumbnail?.url || '');
  const displayDesc = description?.length > 80 ? description.substring(0, 80) + '…' : description;
  const displayPrice = price !== undefined && price !== null
    ? (price === 0 ? 'Free' : `₹${Number(price).toLocaleString()}`) : null;
  const instructorName = instructor
    ? `${instructor.fName || ''} ${instructor.lName || ''}`.trim() : null;

  return (
    <article
      onClick={onClick}
      className={`relative flex flex-col w-full bg-rich-black-800 border border-rich-black-700 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-yellow-50/30 hover:shadow-[0_12px_40px_rgba(255,214,10,0.1)] ${onClick ? 'cursor-pointer' : ''} group`}
    >
      <div className='relative h-44 w-full overflow-hidden flex-shrink-0 bg-rich-black-700'>
        {cover ? (
          <img src={cover} alt={title} className='h-full w-full object-cover group-hover:scale-105 transition-transform duration-500' />
        ) : (
          <div className='h-full w-full flex items-center justify-center text-rich-black-500'><FiBookOpen size={36} /></div>
        )}
        {displayPrice && (
          <div className='absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-rich-black-900/80 backdrop-blur-sm text-yellow-50 border border-yellow-50/20'>
            {displayPrice}
          </div>
        )}
        <div className='absolute inset-0 bg-gradient-to-t from-rich-black-800/60 via-transparent to-transparent' />
      </div>

      <div className='flex flex-col flex-1 p-5 gap-3'>
        <h3 className='text-base font-semibold text-rich-black-5 line-clamp-2 leading-snug group-hover:text-yellow-50 transition-colors duration-200'>
          {title}
        </h3>
        {instructorName && (
          <div className='flex items-center gap-1.5 text-xs text-rich-black-300'>
            <FaUserTie className='text-rich-black-400' size={11} />
            <span>{instructorName}</span>
          </div>
        )}
        {displayDesc && (
          <p className='text-xs text-rich-black-300 line-clamp-2 leading-relaxed'>{displayDesc}</p>
        )}
        {rating ? (
          <div className='flex items-center gap-2 mt-auto'>
            <StarRating rating={rating} />
            <span className='text-xs font-semibold text-yellow-50'>{Number(rating).toFixed(1)}</span>
            {reviewsCount > 0 && <span className='text-xs text-rich-black-400'>({reviewsCount})</span>}
          </div>
        ) : (
          <p className='text-xs text-rich-black-500 mt-auto'>No ratings yet</p>
        )}
      </div>

      <div className='flex items-center justify-between border-t border-rich-black-700 px-5 py-3 text-rich-black-400 text-xs gap-2'>
        <div className='flex items-center gap-1.5'><FiLayers size={12} /><span>{level || 'Self Paced'}</span></div>
        <div className='flex items-center gap-1.5'><FiBookOpen size={12} /><span>{lessons || 'Flexible'}</span></div>
      </div>
    </article>
  );
};
