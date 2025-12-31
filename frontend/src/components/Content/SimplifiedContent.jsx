import { useNavigate } from 'react-router-dom';
import { PLACEHOLDER_CONTENT } from '../../utils/constants';
import BottomActionBar from './BottomActionBar';

export default function SimplifiedContent({ topic, subtopic }) {
  const navigate = useNavigate();
  
  const content = PLACEHOLDER_CONTENT[subtopic] || {
    title: `Subtopic ${subtopic}`,
    simplified: '<p>Simplified content coming soon...</p>',
    video_url: ''
  };

  const handleTakeQuiz = () => {
    navigate(`/physics/${topic}/${subtopic}/quiz/easy`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 pb-20">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-6">
            <p className="text-blue-600 font-semibold">Let's take this at a slower pace</p>
          </div>

          <h1 className="text-2xl font-bold mb-6">{content.title}</h1>
          
          <div dangerouslySetInnerHTML={{ __html: content.simplified }} />

          <div className="mt-8 p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-gray-700 font-semibold mb-4">
              Watch video or listen to audio summary for better understanding
            </p>
          </div>
        </div>
      </div>

      <BottomActionBar
        videoUrl={content.video_url}
        subtopicId={subtopic}
        onTakeQuiz={handleTakeQuiz}
        simplified={true}
      />
    </div>
  );
}