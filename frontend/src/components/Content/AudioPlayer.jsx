import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { stripHtml } from '../../utils/helpers';

export default function AudioPlayer({ subtopicId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [audioUrl, setAudioUrl] = useState(null);
  const [simplifiedText, setSimplifiedText] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    generateAudio();
  }, []);

  const generateAudio = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get content from page (simplified approach)
      const content = stripHtml(document.querySelector('.content-area')?.innerHTML || '');
      
      const response = await api.generateAudio({
        content,
        subtopic_id: subtopicId
      });

      setAudioUrl(response.data.audio_url);
      setSimplifiedText(response.data.simplified_text);
    } catch (err) {
      setError('Failed to generate audio summary');
      console.error('Audio generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-4">🎧 Audio Summary</h2>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating audio summary with AI...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {audioUrl && (
          <div>
            <audio controls className="w-full mb-6">
              <source src={audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Transcript:</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {simplifiedText}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}