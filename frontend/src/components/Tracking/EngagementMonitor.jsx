import { useEffect, useRef } from 'react';
import Webcam from 'react-webcam';

export default function EngagementMonitor({ onEngagementUpdate }) {
  const webcamRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Start monitoring every 3 seconds
    intervalRef.current = setInterval(() => {
      captureAndAnalyze();
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const captureAndAnalyze = async () => {
    if (!webcamRef.current) return;

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      // Convert base64 to blob
      const blob = await fetch(imageSrc).then(r => r.blob());
      
      // In production, send to backend for engagement detection
      // For now, simulate engagement score
      const simulatedScore = 0.5 + Math.random() * 0.5; // 0.5 to 1.0
      
      onEngagementUpdate(simulatedScore);
    } catch (error) {
      console.error('Engagement monitoring error:', error);
    }
  };

  return (
    <div className="hidden">
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          width: 640,
          height: 480,
          facingMode: "user"
        }}
      />
    </div>
  );
}