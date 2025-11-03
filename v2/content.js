// Add keyboard shortcuts for video control
document.addEventListener('keydown', (e) => {
  // Only trigger if not typing in an input field
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  
  const video = document.querySelector('video');
  if (!video) return;

  // Alt + P = Toggle PiP
  if (e.altKey && e.key === 'p') {
    e.preventDefault();
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    } else {
      video.requestPictureInPicture();
    }
  }
  
  // Alt + Left Arrow = Rewind 10s
  if (e.altKey && e.key === 'ArrowLeft') {
    e.preventDefault();
    video.currentTime = Math.max(0, video.currentTime - 10);
  }
  
  // Alt + Right Arrow = Forward 10s
  if (e.altKey && e.key === 'ArrowRight') {
    e.preventDefault();
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
  }
});