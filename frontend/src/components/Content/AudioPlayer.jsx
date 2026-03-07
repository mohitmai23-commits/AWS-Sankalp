import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Loader2, AlertCircle, X } from 'lucide-react';
import api from '../../utils/api';

export default function AudioPlayer({ subtopicId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [simplifiedText, setSimplifiedText] = useState('');
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFallback, setIsFallback] = useState(false);

  const utteranceRef = useRef(null);

  useEffect(() => {
    generateAudio();

    return () => {
      stopAudio();
    };
  }, []);

  const generateAudio = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get content from page
      const contentElement = document.querySelector('.prose') || 
                           document.querySelector('.content-area') ||
                           document.querySelector('.whitespace-pre-line') ||
                           document.querySelector('.bg-blue-50');
      
      let content = 'Unable to extract content from page';
      
      if (contentElement) {
        // Get text content
        content = contentElement.textContent || contentElement.innerText || '';
        // Clean up extra whitespace
        content = content.trim().replace(/\s+/g, ' ');
      }
      
      console.log('📝 Sending content to API:', content.substring(0, 100) + '...');
      
      // Call API - generateAudio returns axios promise
      const response = await api.generateAudio({
        content: content,
        subtopic_id: subtopicId
      });

      console.log('✅ API Response:', response.data);

      // Extract data from response
      setSimplifiedText(response.data.simplified_text);
      setIsFallback(response.data.is_fallback || false);
      
      console.log('✅ Audio summary loaded, ready to play');
      
    } catch (err) {
      console.error('❌ Audio generation error:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Failed to generate audio summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const playAudio = () => {
    if (!simplifiedText) {
      console.warn('⚠️ No text to play');
      return;
    }

    // Stop any existing playback
    stopAudio();

    // Check if browser supports Speech Synthesis
    if (!('speechSynthesis' in window)) {
      setError('Your browser does not support text-to-speech');
      return;
    }

    console.log('🔊 Starting audio playback...');

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(simplifiedText);
    utteranceRef.current = utterance;

    // Configure voice settings
    utterance.rate = 0.9; // Slightly slower for learning
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to use a better voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && (voice.name.includes('Google') || voice.name.includes('Natural'))
    ) || voices.find(voice => voice.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
      console.log('🎙️ Using voice:', preferredVoice.name);
    }

    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
      console.log('🔊 Audio playback started');
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setProgress(0);
      console.log('✅ Audio playback ended');
    };

    utterance.onerror = (event) => {
      console.error('❌ Speech synthesis error:', event);
      setIsPlaying(false);
      setError('Audio playback failed');
    };

    utterance.onboundary = (event) => {
      // Update progress based on character position
      const progressPercent = (event.charIndex / simplifiedText.length) * 100;
      setProgress(progressPercent);
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);
  };

  const pauseAudio = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      console.log('⏸️ Audio paused');
    }
  };

  const resumeAudio = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      console.log('▶️ Audio resumed');
    }
  };

  const stopAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setProgress(0);
      console.log('⏹️ Audio stopped');
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseAudio();
    } else if (window.speechSynthesis.paused) {
      resumeAudio();
    } else {
      playAudio();
    }
  };

  const handleClose = () => {
    stopAudio();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <Volume2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">🎧 Audio Summary</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-gray-600">Generating audio-friendly summary with AI...</p>
              <p className="text-sm text-gray-500">This may take a few seconds</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && simplifiedText && (
            <>
              {isFallback && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    ℹ️ Using simplified summary due to high demand
                  </p>
                </div>
              )}

              {/* Audio Controls */}
              <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <button
                    onClick={togglePlayPause}
                    className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all hover:scale-105"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8" fill="currentColor" />
                    ) : (
                      <Play className="w-8 h-8 ml-1" fill="currentColor" />
                    )}
                  </button>
                  
                  <button
                    onClick={stopAudio}
                    disabled={!isPlaying && progress === 0}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Stop
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                <div className="text-center mt-3 text-sm font-medium text-gray-600">
                  {isPlaying ? '🔊 Playing...' : progress > 0 ? '⏸️ Paused' : '▶️ Click play to listen'}
                </div>
              </div>

              {/* Transcript */}
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  📝 Transcript:
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {simplifiedText}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            💡 Tip: Use headphones for better audio quality
          </p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}