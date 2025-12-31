import { useEffect, useRef } from 'react';

export default function IntersectionObserverWrapper({ children, onInteractionUpdate }) {
  const containerRef = useRef(null);
  const scrollData = useRef({ depth: 0, speed: 0, backForth: 0 });
  const hoverData = useRef({ elements: {}, avgDuration: 0 });
  const timeData = useRef({ sections: {}, avgTime: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scroll tracking
    let lastScrollY = 0;
    let lastScrollTime = Date.now();
    let scrollDirection = 'down';
    let directionChanges = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      const timeDiff = (currentTime - lastScrollTime) / 1000;

      // Calculate scroll speed
      const distance = Math.abs(currentScrollY - lastScrollY);
      const speed = distance / timeDiff;

      // Track direction changes (back-forth scrolling)
      const newDirection = currentScrollY > lastScrollY ? 'down' : 'up';
      if (newDirection !== scrollDirection) {
        directionChanges++;
      }

      scrollData.current = {
        depth: (currentScrollY / document.documentElement.scrollHeight) * 100,
        speed: Math.min(speed, 1000), // Cap at 1000px/s
        backForth: directionChanges
      };

      lastScrollY = currentScrollY;
      lastScrollTime = currentTime;
      scrollDirection = newDirection;

      updateInteraction();
    };

    // Hover tracking
    const handleMouseEnter = (e) => {
      const element = e.target;
      const elementId = element.dataset.trackId || element.tagName;
      
      hoverData.current.elements[elementId] = {
        startTime: Date.now()
      };
    };

    const handleMouseLeave = (e) => {
      const element = e.target;
      const elementId = element.dataset.trackId || element.tagName;
      
      if (hoverData.current.elements[elementId]) {
        const duration = Date.now() - hoverData.current.elements[elementId].startTime;
        hoverData.current.elements[elementId].duration = duration;
        
        // Calculate average hover duration
        const durations = Object.values(hoverData.current.elements)
          .filter(e => e.duration)
          .map(e => e.duration);
        
        hoverData.current.avgDuration = durations.length > 0
          ? durations.reduce((a, b) => a + b, 0) / durations.length
          : 0;
      }

      updateInteraction();
    };

    // Intersection Observer for time per section
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        const sectionId = entry.target.dataset.sectionId || entry.target.id;
        
        if (entry.isIntersecting) {
          timeData.current.sections[sectionId] = {
            startTime: Date.now()
          };
        } else if (timeData.current.sections[sectionId]?.startTime) {
          const duration = Date.now() - timeData.current.sections[sectionId].startTime;
          timeData.current.sections[sectionId].duration = duration;
          
          // Calculate average time per section
          const durations = Object.values(timeData.current.sections)
            .filter(s => s.duration)
            .map(s => s.duration);
          
          timeData.current.avgTime = durations.length > 0
            ? durations.reduce((a, b) => a + b, 0) / durations.length
            : 0;
          
          updateInteraction();
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.5
    });

    // Observe all paragraphs and sections
    const sections = container.querySelectorAll('p, section, div[data-section-id]');
    sections.forEach((section) => observer.observe(section));

    window.addEventListener('scroll', handleScroll);
    container.addEventListener('mouseenter', handleMouseEnter, true);
    container.addEventListener('mouseleave', handleMouseLeave, true);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      container.removeEventListener('mouseenter', handleMouseEnter, true);
      container.removeEventListener('mouseleave', handleMouseLeave, true);
      observer.disconnect();
    };
  }, []);

  const updateInteraction = () => {
    onInteractionUpdate({
      scroll: scrollData.current,
      hover: hoverData.current,
      time: timeData.current,
      mouse: { erratic_score: Math.random() * 0.5 } // Simplified
    });
  };

  return (
    <div ref={containerRef} className="content-area">
      {children}
    </div>
  );
}