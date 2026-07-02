import React, { useEffect, useRef } from 'react';

const VideoBackground = () => {
  const videoRef = useRef(null);
  const startTime = 12; // Start after the logo fades
  const endTime = 65;   // End before the logo grid starts

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Fast forward to startTime on load
    const handleLoadedMetadata = () => {
      video.currentTime = startTime;
    };

    // Loop logic to simulate the YouTube player behavior
    const handleTimeUpdate = () => {
      if (video.currentTime >= endTime) {
        video.currentTime = startTime;
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);

    // Also manually set it if metadata is already loaded
    if (video.readyState >= 1) {
      video.currentTime = startTime;
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-black">
      <video 
        ref={videoRef}
        src="/bg-video.mp4"
        autoPlay 
        loop 
        muted 
        playsInline
        controlsList="nodownload"
        disablePictureInPicture
        disableRemotePlayback
        className="absolute top-1/2 left-1/2 pointer-events-none transition-opacity duration-1000 object-cover opacity-80"
        style={{
          transform: 'translate(-50%, -50%)',
          width: '120vw',
          height: '67.5vw', /* 16:9 at 120% */
          minHeight: '120vh',
          minWidth: '213.33vh', /* 120 * 1.777 */
        }}
      />
      <div className="absolute inset-0 video-overlay z-10" />
    </div>
  );
};

export default VideoBackground;
