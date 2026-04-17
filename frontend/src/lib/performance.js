/**
 * Performance monitoring utility
 * Tracks FPS, page load metrics, and component render times
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: 0,
      renderTimes: [],
    };
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    
    if (typeof window !== 'undefined') {
      this.startFPSMonitoring();
      this.measurePageLoad();
    }
  }

  // Monitor FPS
  startFPSMonitoring() {
    const updateFPS = () => {
      const now = performance.now();
      const delta = now - this.lastFrameTime;
      
      if (delta >= 1000) {
        this.metrics.fps = Math.round((this.frameCount * 1000) / delta);
        this.frameCount = 0;
        this.lastFrameTime = now;
        
        // Log FPS in development mode
        if (import.meta.env.DEV && this.metrics.fps < 55) {
          console.warn(`Low FPS detected: ${this.metrics.fps}`);
        }
      }
      
      this.frameCount++;
      requestAnimationFrame(updateFPS);
    };
    
    requestAnimationFrame(updateFPS);
  }

  // Measure page load performance
  measurePageLoad() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          
          if (perfData) {
            const metrics = {
              dns: perfData.domainLookupEnd - perfData.domainLookupStart,
              tcp: perfData.connectEnd - perfData.connectStart,
              ttfb: perfData.responseStart - perfData.requestStart,
              download: perfData.responseEnd - perfData.responseStart,
              domInteractive: perfData.domInteractive,
              domComplete: perfData.domComplete,
              loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
            };
            
            if (import.meta.env.DEV) {
              console.log('Performance Metrics:', metrics);
            }
          }
        }, 0);
      });
    }
  }

  // Measure component render time
  measureRender(componentName, callback) {
    const start = performance.now();
    callback();
    const end = performance.now();
    const duration = end - start;
    
    this.metrics.renderTimes.push({
      component: componentName,
      duration,
      timestamp: Date.now(),
    });
    
    // Warn if render takes too long
    if (import.meta.env.DEV && duration > 16) {
      console.warn(`Slow render detected in ${componentName}: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  // Get current FPS
  getFPS() {
    return this.metrics.fps;
  }

  // Get average render time for a component
  getAverageRenderTime(componentName) {
    const renders = this.metrics.renderTimes.filter(r => r.component === componentName);
    if (renders.length === 0) return 0;
    
    const sum = renders.reduce((acc, r) => acc + r.duration, 0);
    return sum / renders.length;
  }

  // Report performance summary
  getReport() {
    return {
      fps: this.metrics.fps,
      renderTimes: this.metrics.renderTimes.slice(-10), // Last 10 renders
    };
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Web Vitals reporting
export const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};
