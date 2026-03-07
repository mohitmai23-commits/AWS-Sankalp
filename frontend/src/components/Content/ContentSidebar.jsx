import { TOPICS } from '../../utils/constants';

export default function ContentSidebar({ topic, currentSubtopic }) {
  const topicData = TOPICS[topic];
  
  if (!topicData) return null;

  return (
    <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h3 className="font-semibold text-sm text-gray-500 mb-2">
          {topicData.name}
        </h3>
        <ul className="space-y-1">
          {topicData.subtopics.map((subtopic) => (
            <li key={subtopic}>
              <a
                href={`/physics/${topic}/${subtopic}`}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  subtopic === currentSubtopic
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Subtopic {subtopic}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}