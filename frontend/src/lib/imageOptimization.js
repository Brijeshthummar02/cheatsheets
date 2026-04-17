/**
 * Image optimization utility
 * Handles lazy loading and WebP conversion
 */

/**
 * Lazy load images using Intersection Observer
 */
export const lazyLoadImages = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Load the image
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
          
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    // Observe all lazy images
    document.querySelectorAll('img.lazy').forEach((img) => {
      imageObserver.observe(img);
    });
  }
};

/**
 * Check if WebP is supported
 */
export const supportsWebP = () => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
};

/**
 * Get optimized image URL
 */
export const getOptimizedImageUrl = (url, width = null) => {
  if (!url) return '';
  
  // If WebP is supported, try to use WebP version
  const webpSupported = supportsWebP();
  let optimizedUrl = url;
  
  if (webpSupported && !url.endsWith('.webp')) {
    // Replace extension with .webp
    optimizedUrl = url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }
  
  // Add width parameter if supported by your CDN
  if (width) {
    optimizedUrl += `?w=${width}`;
  }
  
  return optimizedUrl;
};

/**
 * Preload critical images
 */
export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Create responsive srcset
 */
export const createSrcSet = (baseUrl, widths = [320, 640, 960, 1280, 1920]) => {
  return widths.map(width => {
    return `${getOptimizedImageUrl(baseUrl, width)} ${width}w`;
  }).join(', ');
};
