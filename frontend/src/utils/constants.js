export const TOPICS = {
    'infinite-well': {
      name: 'Infinite Potential Well',
      subtopics: ['1.1', '1.2', '1.3','1.4','1.5']
    },
    'finite-well': {
      name: 'Finite Potential Well',
      subtopics: ['2.1', '2.2', '2.3','2.4']
    },
    'tunneling': {
      name: 'Tunnelling Effect',
      subtopics: ['3.1', '3.2', '3.3','3.4']
    }
  };

// Helper to get topic name from URL key
export const getTopicNameFromKey = (key) => {
  if (!key) return null;
  const topic = TOPICS[key];
  return topic ? topic.name : key;
};

// Helper to get topic key from name
export const getTopicKeyFromName = (name) => {
  if (!name) return null;
  const entry = Object.entries(TOPICS).find(([, topic]) => topic.name === name);
  return entry ? entry[0] : null;
};
  
  export const PLACEHOLDER_CONTENT = {
    '1.1': {
      title: 'Introduction to Infinite Potential Well',
      normal: `
        <h2>Infinite Potential Well</h2>
        <p>The infinite potential well is a fundamental concept in quantum mechanics that describes a particle confined in a box with infinitely high walls...</p>
        <h3>Mathematical Foundation</h3>
        <p>The Schrödinger equation for this system is...</p>
      `,
      simplified: `
        <h2>Understanding the Infinite Well (Simplified)</h2>
        <div class="bg-blue-50 p-4 rounded-lg my-4">
          <h3 class="text-lg font-semibold text-blue-900">Key Concept</h3>
          <p>Imagine a ball bouncing inside an unbreakable box. That's similar to what happens with particles in an infinite well!</p>
        </div>
      `,
      video_url: 'https://www.youtube.com/embed/example1'
    },
    '3.1': {
      title: 'Introduction to Quantum Tunnelling',
      normal: `
        <h2>Quantum Tunnelling Effect</h2>
        <p>Quantum tunnelling is a quantum mechanical phenomenon where particles pass through potential barriers...</p>
      `,
      simplified: `
        <h2>What is Tunnelling? (Simple Explanation)</h2>
        <div class="bg-blue-50 p-4 rounded-lg my-4">
          <h3 class="text-lg font-semibold text-blue-900">Think of it Like This</h3>
          <p>A ball rolling up a hill that doesn't have enough energy to reach the top. Normally, it would roll back down.</p>
          <p class="mt-2">But in quantum mechanics, particles can "tunnel" through the hill!</p>
        </div>
      `,
      video_url: 'https://www.youtube.com/embed/example2'
    }
  };
  
  export const ENGAGEMENT_THRESHOLD = 0.3; // Low engagement below this
  
  export const COGNITIVE_LOAD_CHECK_INTERVAL = 15000; // 15 seconds