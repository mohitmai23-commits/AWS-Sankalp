import { useEffect, useRef } from 'react';

export default function IntersectionObserverWrapper({ children, onInteractionUpdate }) {
  const containerRef = useRef(null);
  const scrollData = useRef({ depth: 0, speed: 0, backForth: 0 });
  const hoverData = useRef({ totalHoverTime: 0, hoverCount: 0, avgDuration: 0 });
  const mouseData = useRef({ movements: [], erraticScore: 0 });
  const lastMousePos = useRef({ x: 0, y: 0, time: Date.now() });
  
  const viewingData = useRef({
    currentlyViewing: new Set(),
    sectionStartTimes: new Map(),
    sectionTotalTimes: new Map(),
    totalReadingTime: 0,
    lastUpdateTime: Date.now()
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    console.log('✅ Tracker initialized');

    // Scroll tracking
    let lastScrollY = window.scrollY;
    let lastScrollTime = Date.now();
    let scrollDirection = 'down';
    let directionChanges = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      const timeDiff = (currentTime - lastScrollTime) / 1000;

      if (timeDiff > 0.05) {
        const distance = Math.abs(currentScrollY - lastScrollY);
        const speed = distance / timeDiff;

        const newDirection = currentScrollY > lastScrollY ? 'down' : 'up';
        if (newDirection !== scrollDirection && distance > 20) {
          directionChanges++;
        }

        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const depth = (currentScrollY / maxScroll) * 100;

        scrollData.current = {
          depth: Math.min(Math.max(depth, 0), 100),
          speed: Math.min(speed, 1000),
          backForth: directionChanges
        };

        lastScrollY = currentScrollY;
        lastScrollTime = currentTime;
        scrollDirection = newDirection;
      }
    };

    // Mouse tracking
    const handleMouseMove = (e) => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastMousePos.current.time;
      
      if (timeDiff > 50) {
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speed = distance / (timeDiff / 1000);

        mouseData.current.movements.push({ speed, time: currentTime });

        if (mouseData.current.movements.length > 30) {
          mouseData.current.movements.shift();
        }

        if (mouseData.current.movements.length > 5) {
          const speeds = mouseData.current.movements.map(m => m.speed);
          const avgSpeed = speeds.reduce((a, b) => a + b) / speeds.length;
          const variance = speeds.reduce((sum, s) => sum + Math.pow(s - avgSpeed, 2), 0) / speeds.length;
          mouseData.current.erraticScore = Math.min(Math.sqrt(variance) / 500, 1);
        }

        lastMousePos.current = { x: e.clientX, y: e.clientY, time: currentTime };
      }
    };

    // Hover tracking
    let hoverStartTime = null;

    const handleMouseEnter = (e) => {
      if (e.target.textContent && e.target.textContent.trim().length > 20) {
        hoverStartTime = Date.now();
      }
    };

    const handleMouseLeave = (e) => {
      if (hoverStartTime) {
        const duration = Date.now() - hoverStartTime;
        if (duration > 200 && duration < 30000) {
          hoverData.current.totalHoverTime += duration;
          hoverData.current.hoverCount++;
          hoverData.current.avgDuration = hoverData.current.totalHoverTime / hoverData.current.hoverCount;
        }
        hoverStartTime = null;
      }
    };

    // Update reading time
    const updateReadingTime = () => {
      const now = Date.now();
      const timeSinceLastUpdate = now - viewingData.current.lastUpdateTime;
      
      if (timeSinceLastUpdate < 2000) {
        viewingData.current.currentlyViewing.forEach(sectionId => {
          const currentTotal = viewingData.current.sectionTotalTimes.get(sectionId) || 0;
          viewingData.current.sectionTotalTimes.set(sectionId, currentTotal + timeSinceLastUpdate);
        });
        
        if (viewingData.current.currentlyViewing.size > 0) {
          viewingData.current.totalReadingTime += timeSinceLastUpdate;
        }
      }
      
      viewingData.current.lastUpdateTime = now;
      
      const viewedSections = Array.from(viewingData.current.sectionTotalTimes.keys());
      const sectionsViewed = viewedSections.length;
      
      let avgTime = 0;
      if (sectionsViewed > 0) {
        const totalSectionTime = Array.from(viewingData.current.sectionTotalTimes.values())
          .reduce((sum, time) => sum + time, 0);
        avgTime = totalSectionTime / sectionsViewed;
      }
      
      return {
        totalReadingTime: viewingData.current.totalReadingTime,
        avgTime: avgTime / 1000,
        sectionsViewed
      };
    };

    // CRITICAL FIX: Very strict intersection observer
    // Only mark as "viewing" if >70% visible and in center 60% of viewport
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        const element = entry.target;
        if (!element.textContent || element.textContent.trim().length < 30) return;
        
        const sectionId = element.dataset.sectionId;
        
        // STRICT: Element must be >70% visible to count
        const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.7;
        
        if (isVisible) {
          if (!viewingData.current.currentlyViewing.has(sectionId)) {
            viewingData.current.currentlyViewing.add(sectionId);
            
            if (!viewingData.current.sectionStartTimes.has(sectionId)) {
              viewingData.current.sectionStartTimes.set(sectionId, Date.now());
            }
            if (!viewingData.current.sectionTotalTimes.has(sectionId)) {
              viewingData.current.sectionTotalTimes.set(sectionId, 0);
            }
            
            console.log(`👁️  Viewing: ${sectionId}`);
          }
        } else {
          if (viewingData.current.currentlyViewing.has(sectionId)) {
            viewingData.current.currentlyViewing.delete(sectionId);
            console.log(`👋 Stopped: ${sectionId}`);
          }
        }
      });
      
      if (viewingData.current.currentlyViewing.size > 0) {
        console.log(`📖 Currently viewing ${viewingData.current.currentlyViewing.size} sections`);
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: [0, 0.3, 0.5, 0.7, 0.9, 1.0],
      // CRITICAL: This ensures sections are well within viewport
      rootMargin: '-100px 0px -100px 0px'  // 100px from top and bottom
    });

    // Observe paragraphs and h3 only
    setTimeout(() => {
      const elements = container.querySelectorAll('p, h3');
      console.log(`📝 Observing ${elements.length} elements`);
      
      elements.forEach((el, index) => {
        const text = el.textContent.trim();
        if (text.length > 30) {
          el.dataset.sectionId = `section-${index}`;
          observer.observe(el);
        }
      });
    }, 500);

    // Update every 500ms
    const readingTimer = setInterval(() => {
      const timeData = updateReadingTime();
      
      onInteractionUpdate({
        scroll: { ...scrollData.current },
        hover: { ...hoverData.current },
        time: timeData,
        mouse: { ...mouseData.current }
      });
    }, 500);

    // Event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    container.addEventListener('mouseenter', handleMouseEnter, true);
    container.addEventListener('mouseleave', handleMouseLeave, true);

    // Cleanup
    return () => {
      clearInterval(readingTimer);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter, true);
      container.removeEventListener('mouseleave', handleMouseLeave, true);
      observer.disconnect();
      console.log('🛑 Tracker stopped');
    };
  }, [onInteractionUpdate]);

  return <div ref={containerRef}>{children}</div>;
}