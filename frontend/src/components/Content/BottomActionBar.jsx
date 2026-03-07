import { useState, useRef } from 'react';
import AudioPlayer from './AudioPlayer';

// Video mapping for each subtopic - UPDATE THESE with your actual video filenames
const VIDEO_MAP = {
  '1.1': '/videos/video-1.mp4',
  '1.2': '/videos/quantum-box.mp4',
  '1.3': '/videos/wave-functions.mp4',
  '2.1': '/videos/schrodinger.mp4',
  '2.2': '/videos/operators.mp4',
  '3.1': '/videos/video-3.mp4',

  // Add more mappings as needed
  'default': '/videos/quantum-mechanics.mp4'
};

export default function BottomActionBar({
  videoUrl,
  subtopicId,
  onTakeQuiz,
  handleCompleteSubtopic,
  isCompleted = false,
  simplified = false
}) {
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  // Get the actual video URL - use mapping or fallback
  const getVideoUrl = () => {
    // If it's a valid YouTube URL, use it
    if (videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) && !videoUrl.includes('example')) {
      return videoUrl;
    }
    // Otherwise, use local video from mapping
    return VIDEO_MAP[subtopicId] || VIDEO_MAP['default'];
  };

  const actualVideoUrl = getVideoUrl();
  const isYouTube = actualVideoUrl.includes('youtube.com') || actualVideoUrl.includes('youtu.be');

  const handleVideoError = () => {
    setVideoError(true);
    console.error('Video failed to load:', actualVideoUrl);
  };

  return (
    <>
      {/* FIXED BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 border-t-4 border-gray-300 shadow-2xl z-40">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-center gap-4 flex-wrap">

            {/* AUDIO SUMMARY */}
            <button
              onClick={() => setShowAudioModal(true)}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-7 py-3 rounded-xl font-bold text-base border-3 border-purple-700 shadow-lg hover:from-purple-600 hover:to-purple-700 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 active:translate-y-0 flex items-center gap-2"
            >
              <span className="text-lg">🔊</span>
              <span>Audio Summary</span>
            </button>

            {/* WATCH VIDEO */}
            <button
              onClick={() => {
                setVideoError(false);
                setShowVideoModal(true);
              }}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-7 py-3 rounded-xl font-bold text-base border-3 border-red-700 shadow-lg hover:from-red-600 hover:to-red-700 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 active:translate-y-0 flex items-center gap-2"
            >
              <span className="text-lg">▶️</span>
              <span>Watch Video</span>
            </button>

            {/* TAKE QUIZ */}
            <button
              onClick={onTakeQuiz}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-7 py-3 rounded-xl font-bold text-base border-3 border-green-700 shadow-lg hover:from-green-600 hover:to-green-700 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 active:translate-y-0 flex items-center gap-2"
            >
              <span className="text-lg">💡</span>
              <span>{simplified ? 'Take Easy Quiz' : 'Take Quiz'}</span>
            </button>

            {/* MARK COMPLETE */}
            <button
              onClick={handleCompleteSubtopic}
              disabled={isCompleted}
              className={`px-7 py-3 rounded-xl font-bold text-base border-3 shadow-lg transition-all duration-200 flex items-center gap-2 ${
                isCompleted
                  ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-gray-600 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-700 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl hover:-translate-y-1 active:translate-y-0'
              }`}
            >
              <span className="text-lg">{isCompleted ? '✅' : ''}</span>
              <span>{isCompleted ? 'Completed!' : 'Mark Complete'}</span>
            </button>

          </div>
        </div>
      </div>

      {/* AUDIO MODAL */}
      {showAudioModal && (
        <AudioPlayer
          subtopicId={subtopicId}
          onClose={() => setShowAudioModal(false)}
        />
      )}

      {/* VIDEO MODAL */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold">Video Lecture</h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl px-3"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video bg-black">
              {videoError ? (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center p-8">
                    <p className="text-xl mb-2">⚠️ Video not available</p>
                    <p className="text-sm text-gray-400">Path: {actualVideoUrl}</p>
                    <p className="text-sm text-gray-400 mt-4">
                      Add your video files to: <br />
                      <code className="bg-gray-800 px-2 py-1 rounded">frontend/public/videos/</code>
                    </p>
                  </div>
                </div>
              ) : isYouTube ? (
                <iframe
                  src={actualVideoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  ref={videoRef}
                  controls
                  autoPlay
                  className="w-full h-full"
                  onError={handleVideoError}
                >
                  <source src={actualVideoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}