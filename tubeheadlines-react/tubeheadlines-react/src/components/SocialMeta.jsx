import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Component for adding optimized social media metadata
 * This improves appearance when content is shared on social platforms
 */
const SocialMeta = ({ 
  title = 'TubeHeadlines', 
  description = 'Top Headlines from Video Creators',
  image = '/social-share.jpg', // Default image path
  url = 'https://tubeheadlines.com',
  type = 'website'
}) => {
  // Ensure image is a full URL
  const fullImageUrl = image.startsWith('http') 
    ? image 
    : `https://tubeheadlines.com${image}`;
    
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content="TubeHeadlines" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImageUrl} />
      
      {/* WhatsApp specific */}
      <meta property="whatsapp:title" content={title} />
      <meta property="whatsapp:description" content={description} />
    </Helmet>
  );
};

export default SocialMeta;
