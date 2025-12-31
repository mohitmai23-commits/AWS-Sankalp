import { useState } from 'react';
import VideoPlayer from './VideoPlayer';
import AudioPlayer from './AudioPlayer';

export default function BottomActionBar({ videoUrl, subtopicId, onTakeQuiz, simplified = false }) {
  const [showVideo, setShowVideo] = useState(false);
  const [showAudio, setShowAudio] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-accent-500 text-white py-4 px-6 shadow-lg z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-around">
          <button
            onClick={() => setShowAudio(true)}
            className="flex items-center gap-2 bg-white text-accent-500 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            🎧 Audio Summary
          </button>
          
          <button
            onClick={() => setShowVideo(true)}
            className="flex items-center gap-2 bg-white text-accent-500 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            🎥 Watch Video
          </button>
          
          <button
            onClick={onTakeQuiz}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            ✅ Take {simplified ? 'Easy' : 'Hard'} Quiz
          </button>
        </div>
      </div>

      {showVideo && (
        <VideoPlayer
          videoUrl={videoUrl}
          onClose={() => setShowVideo(false)}
        />
      )}

      {showAudio && (
        <AudioPlayer
          subtopicId={subtopicId}
          onClose={() => setShowAudio(false)}
        />
      )}
    </>
  );
}