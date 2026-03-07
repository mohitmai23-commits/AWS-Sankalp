const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export class CognitiveMonitoringService {
  constructor(userId) {
    this.userId = userId;
    this.ws = null;
    this.videoStream = null;
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.video = document.createElement('video');
    this.isCapturing = false;
  }

  connect(onDataReceived) {
    this.ws = new WebSocket(`${WS_URL}/ws/cognitive/${this.userId}`);
    
    this.ws.onopen = () => {
      console.log('✅ Connected to cognitive monitoring');
      this.startCapture();
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('📊 Cognitive data:', data);
      onDataReceived(data);
    };
    
    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };
    
    this.ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      this.isCapturing = false;
    };
  }

  async startCapture() {
    try {
      // Request camera access
      this.videoStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      this.video.srcObject = this.videoStream;
      await this.video.play();
      
      console.log('📹 Camera started');
      this.isCapturing = true;
      
      // Capture and send frames every 2 seconds
      this.interval = setInterval(() => {
        if (this.isCapturing) {
          this.captureAndSendFrame();
        }
      }, 2000);
      
    } catch (error) {
      console.error('📹 Camera access error:', error);
      console.log('⚠️  Falling back to dummy data (no camera access)');
      
      // Fallback: Send dummy data if camera not available
      this.interval = setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            image: null,
            timestamp: Date.now()
          }));
        }
      }, 2000);
    }
  }

  captureAndSendFrame() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    if (!this.video.videoWidth || !this.video.videoHeight) return;
    
    try {
      // Set canvas size to match video
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      
      // Draw current video frame to canvas
      this.context.drawImage(this.video, 0, 0);
      
      // Convert to base64 JPEG
      const imageData = this.canvas.toDataURL('image/jpeg', 0.7);
      
      // Send to backend
      this.ws.send(JSON.stringify({
        image: imageData,
        timestamp: Date.now()
      }));
      
      console.log('📸 Frame sent to backend');
      
    } catch (error) {
      console.error('📸 Frame capture error:', error);
    }
  }

  disconnect() {
    console.log('🛑 Stopping cognitive monitoring...');
    
    this.isCapturing = false;
    
    if (this.interval) {
      clearInterval(this.interval);
    }
    
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
    }
    
    if (this.ws) {
      this.ws.close();
    }
    
    console.log('✅ Cognitive monitoring stopped');
  }
}