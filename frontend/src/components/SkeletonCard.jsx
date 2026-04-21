import React from 'react';

const SkeletonCard = () => (
  <div className='flex flex-col w-full bg-rich-black-800 border border-rich-black-700 rounded-2xl overflow-hidden'>
    {/* Thumbnail skeleton */}
    <div className='h-44 w-full skeleton' />

    {/* Body */}
    <div className='flex flex-col gap-3 p-5'>
      <div className='h-4 w-3/4 skeleton rounded-md' />
      <div className='h-3 w-1/3 skeleton rounded-md' />
      <div className='h-3 w-full skeleton rounded-md' />
      <div className='h-3 w-5/6 skeleton rounded-md' />
      <div className='h-3 w-1/4 skeleton rounded-md mt-1' />
    </div>

    {/* Footer */}
    <div className='flex justify-between border-t border-rich-black-700 px-5 py-3 gap-4'>
      <div className='h-3 w-1/3 skeleton rounded-md' />
      <div className='h-3 w-1/3 skeleton rounded-md' />
    </div>
  </div>
);

export default SkeletonCard;
