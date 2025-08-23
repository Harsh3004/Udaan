import React from 'react';
import videoSource from '../assets/pexels-tea-oebel-6804109.mp4';
import backdrop from '../assets/white.png';
import { useState } from 'react';

const VideoComponent = () => {
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  return (
      <>
        <div className={`absolute inset-0 w-full h-full bg-gradient-blue rounded-full blur-2xl transition-opacity duration-1000 ease-in-out ${isVideoLoaded ? 'opacity-40' : 'opacity-0'}`}></div>
        <video width="100%" height="auto" autoPlay muted className={`relative z-10 transition-all duration-500 ease-in-out ${isVideoLoaded ? 'opacity-100 shadow-shadow-custom' : 'opacity-0'}`}
        onCanPlay={() => setIsVideoLoaded(true)}>
          <source src={videoSource} type="video/mp4"/>
        </video>
      </>
  );
};

export default VideoComponent;