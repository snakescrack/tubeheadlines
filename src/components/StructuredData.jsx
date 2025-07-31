import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Component for adding structured data to the website
 * This helps search engines understand the content better
 */
const StructuredData = ({ videos, currentUrl }) => {
  // Base URL for the website
  const baseUrl = 'https://tubeheadlines.com';
  
  // Create website schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'TubeHeadlines',
    'url': baseUrl,
    'description': 'Top Headlines from Video Creators',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
  
  // Create breadcrumb schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': baseUrl
      }
    ]
  };
  
  // Add section to breadcrumb if we're on a specific section
  if (currentUrl && currentUrl.includes('#')) {
    const section = currentUrl.split('#')[1];
    let sectionName = '';
    
    switch(section) {
      case 'featured':
        sectionName = 'Featured';
        break;
      case 'breaking':
        sectionName = 'Breaking News';
        break;
      case 'trending':
        sectionName = 'Trending Now';
        break;
      case 'entertainment':
        sectionName = 'Entertainment';
        break;
      default:
        sectionName = section.charAt(0).toUpperCase() + section.slice(1);
    }
    
    breadcrumbSchema.itemListElement.push({
      '@type': 'ListItem',
      'position': 2,
      'name': sectionName,
      'item': `${baseUrl}/#${section}`
    });
  }
  
  // Create video schema array for all videos
  const videoSchemas = videos && videos.length > 0 
    ? videos.map(video => ({
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        'name': video.customHeadline || video.title,
        'description': video.description || `${video.customHeadline || video.title} - Watch on TubeHeadlines`,
        'thumbnailUrl': video.thumbnailURL,
        'uploadDate': video.publishedAt || new Date().toISOString(),
        'contentUrl': video.youtubeURL,
        'embedUrl': `https://www.youtube.com/embed/${getYouTubeId(video.youtubeURL)}`,
        'duration': video.duration || 'PT0M0S',
        'interactionStatistic': {
          '@type': 'InteractionCounter',
          'interactionType': { '@type': 'WatchAction' },
          'userInteractionCount': video.viewCount || 0
        }
      }))
    : [];
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      {videoSchemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

// Helper function to extract YouTube video ID from URL
function getYouTubeId(url) {
  if (!url) return '';
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11)
    ? match[2]
    : '';
}

export default StructuredData;
