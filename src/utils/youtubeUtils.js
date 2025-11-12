// Helper function to extract YouTube video ID from URL
export function getYouTubeId(url) {
  if (!url) return '';
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11)
    ? match[2]
    : '';
}

/**
 * Returns an optimized YouTube thumbnail URL.
 * @param {string} videoId - The YouTube video ID.
 * @param {string} quality - The desired quality ('high', 'medium', 'default').
 * @returns {string} The thumbnail URL.
 */
export function getOptimizedThumbnailUrl(videoId, quality = 'medium') {
  if (!videoId) return '';

  switch (quality) {
    case 'high':
      return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`; // High quality (480x360)
    case 'medium':
      return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`; // Medium quality (320x180)
    case 'default':
      return `https://i.ytimg.com/vi/${videoId}/default.jpg`;   // Default quality (120x90)
    default:
      return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
  }
}
