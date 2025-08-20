import React from 'react';
import videoSource from '../assets/pexels-tea-oebel-6804109.mp4';
import backdrop from '../assets/white.png';

const VideoComponent = () => {
  return (
      <>
        <img src={backdrop} className=' absolute top-8 left-10'/>
        <video width="100%" height="auto" autoPlay muted className='relative z-10'>
          <source src={videoSource} type="video/mp4"/>
        </video>
      </>
  );
};

export default VideoComponent;