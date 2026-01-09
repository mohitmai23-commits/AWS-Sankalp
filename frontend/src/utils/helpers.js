export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Define total subtopics per topic
const TOPIC_SUBTOPIC_COUNT = {
  'Infinite Potential Well': 5,  // 1.1, 1.2, 1.3, 1.4, 1.5
  'Finite Potential Well': 4,     // 2.1, 2.2, 2.3, 2.4
  'Tunnelling Effect': 4          // 3.1, 3.2, 3.3, 3.4
};

export const calculateProgress = (progress, topic) => {
  if (!progress || progress.length === 0) {
    return 0;
  }

  // Filter progress entries for this specific topic
  const topicProgress = progress.filter(p => p.topic === topic);
  
  // Count how many are completed
  const completed = topicProgress.filter(p => p.is_completed).length;
  
  // Get total subtopics for this topic (default to 5 if not found)
  const total = TOPIC_SUBTOPIC_COUNT[topic] || 5;
  
  // Calculate percentage
  const percentage = Math.round((completed / total) * 100);
  
  console.log(`Progress calculation for "${topic}":`, {
    completed,
    total,
    percentage,
    entries: topicProgress.length
  });
  
  return percentage;
};

export const stripHtml = (html) => {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};