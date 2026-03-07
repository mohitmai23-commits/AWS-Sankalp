import { useState } from 'react';

export default function AttentionPopup({ question, onAnswer }) {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleSubmit = () => {
    if (selectedOption !== null) {
      const isCorrect = selectedOption === question.correct_index;
      onAnswer(isCorrect);
    }
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4">
        <h3 className="text-2xl font-bold mb-4 text-center">
          Quick Attention Check! 🎯
        </h3>

        <p className="text-lg mb-6">{question.text}</p>

        <div className="space-y-3 mb-6">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedOption(index)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                selectedOption === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <span className="font-semibold mr-2">
                {String.fromCharCode(65 + index)})
              </span>
              {option}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={selectedOption === null}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
}