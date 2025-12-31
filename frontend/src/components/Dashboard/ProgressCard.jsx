export default function ProgressCard({ lastTopic, lastSubtopic, onContinue }) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Continue Learning</h2>
        
        {lastTopic && lastSubtopic ? (
          <div>
            <p className="text-gray-600 mb-4">
              Last studied: <span className="font-semibold">{lastTopic} - {lastSubtopic}</span>
            </p>
            <button
              onClick={onContinue}
              className="w-full bg-accent-500 hover:bg-accent-600 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Continue Learning →
            </button>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">
              Start your quantum mechanics journey today!
            </p>
            <button
              onClick={onContinue}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Browse Topics
            </button>
          </div>
        )}
      </div>
    );
  }