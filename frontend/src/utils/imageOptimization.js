// Image optimization utilities for better performance

/**
 * Generate optimized image URL with WebP support and compression
 * @param {string} originalUrl - Original image URL
 * @param {Object} options - Optimization options
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (originalUrl, options = {}) => {
  if (!originalUrl) return '';
  
  const {
    width = null,
    height = null,
    quality = 80,
    format = 'auto', // 'auto', 'webp', 'jpeg', 'png'
    blur = false
  } = options;

  // If it's already an ImageKit URL, add optimization parameters
  if (originalUrl.includes('imagekit.io')) {
    const url = new URL(originalUrl);
    const params = new URLSearchParams(url.search);
    
    if (width) params.set('w', width);
    if (height) params.set('h', height);
    if (quality) params.set('q', quality);
    if (format !== 'auto') params.set('f', format);
    if (blur) params.set('bl', '5');
    
    // Add WebP format for better compression
    if (format === 'auto') {
      params.set('f', 'webp');
    }
    
    url.search = params.toString();
    return url.toString();
  }
  
  // For other URLs, return as-is (could be extended for other CDNs)
  return originalUrl;
};

/**
 * Preload critical images
 * @param {Array} imageUrls - Array of image URLs to preload
 */
export const preloadImages = (imageUrls) => {
  imageUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Lazy load images with intersection observer
 * @param {string} selector - CSS selector for images to lazy load
 */
export const setupLazyLoading = (selector = 'img[data-src]') => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    document.querySelectorAll(selector).forEach(img => {
      imageObserver.observe(img);
    });
  }
};

/**
 * Generate responsive image srcset
 * @param {string} baseUrl - Base image URL
 * @param {Array} sizes - Array of sizes [320, 640, 1024, 1920]
 * @returns {string} Srcset string
 */
export const generateSrcSet = (baseUrl, sizes = [320, 640, 1024, 1920]) => {
  return sizes
    .map(size => `${getOptimizedImageUrl(baseUrl, { width: size })} ${size}w`)
    .join(', ');
};

/**
 * Get optimal image size based on container width
 * @param {number} containerWidth - Container width in pixels
 * @returns {number} Optimal image width
 */
export const getOptimalImageSize = (containerWidth) => {
  const sizes = [320, 640, 1024, 1920];
  return sizes.find(size => size >= containerWidth) || sizes[sizes.length - 1];
};
