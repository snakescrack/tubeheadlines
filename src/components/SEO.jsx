import { Helmet } from 'react-helmet-async';
import { getYouTubeId } from '../utils/youtubeUtils';

const SEO = ({
  title = 'TubeHeadlines: Discover Trending YouTube Videos & News',
  description = 'TubeHeadlines curates the best YouTube videos from emerging and established creators. Find trending content, breaking news, educational videos, and viral content with a focus on quality over popularity.',
  path = '',
  image = '',
  videoData = null,
  videos = [],
  currentUrl = ''
}) => {
  const siteUrl = 'https://tubeheadlines.com';
  const fullUrl = `${siteUrl}${path}`;
  // Use the existing logo image for social sharing
  // For the homepage, always use the default social share image.
  // For other pages (like video detail pages), use the video's thumbnail.
  const isHomePage = path === '/';
  const imageUrl = isHomePage 
    ? `${siteUrl}/social-share.jpg` 
    : videoData?.thumbnailURL || `${siteUrl}/social-share.jpg`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={fullUrl} />
      <meta name="robots" content="index, follow" />
      <meta name="keywords" content="youtube news, trending videos, viral content, youtube headlines, breaking news, youtube trends, viral videos, youtube updates, trending news" />

      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content="TubeHeadlines" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Video Meta Tags */}
      {videoData && (
        <>
          <meta property="og:video" content={videoData.youtubeURL} />
          <meta property="og:video:type" content="text/html" />
          <meta property="og:video:width" content="1280" />
          <meta property="og:video:height" content="720" />
          <meta name="twitter:player" content={videoData.youtubeURL} />
          <meta name="twitter:player:width" content="1280" />
          <meta name="twitter:player:height" content="720" />
        </>
      )}

      {/* Enhanced Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'TubeHeadlines',
          url: siteUrl,
          description: 'Your source for breaking news, trending videos, and entertainment',
          potentialAction: {
            '@type': 'SearchAction',
            'target': `${siteUrl}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        })}
      </script>
      
      {/* BreadcrumbList Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Home',
              'item': siteUrl
            },
            ...(path ? [{
              '@type': 'ListItem',
              'position': 2,
              'name': title.replace('TubeHeadlines - ', ''),
              'item': fullUrl
            }] : [])
          ]
        })}
      </script>

      {/* VideoObject Schema */}
      {videoData && (
        <script type="application/ld+json">
          {JSON.stringify((() => {
            const schema = {
              '@context': 'https://schema.org',
              '@type': 'VideoObject',
              name: videoData.customHeadline || title,
              description,
              thumbnailUrl: [videoData.thumbnailURL],
              image: videoData.thumbnailURL, // Add image property
              uploadDate: videoData.publishedAt || videoData.createdAt || new Date().toISOString(),
              contentUrl: videoData.youtubeURL,
              embedUrl: `https://www.youtube.com/embed/${getYouTubeId(videoData.youtubeURL)}`,
              interactionStatistic: {
                '@type': 'InteractionCounter',
                'interactionType': { '@type': 'WatchAction' },
                'userInteractionCount': videoData.viewCount || 0
              }
            };

            if (videoData.duration && videoData.duration !== 'PT0S' && videoData.duration !== 'PT0M0S') {
              schema.duration = videoData.duration;
            }

            return schema;
          })())}
        </script>
      )}
      
      {/* Structured Data for lists of videos (e.g., homepage) */}
      {isHomePage && videos && videos.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            'name': 'Latest Video Headlines',
            'description': 'The latest trending video headlines from YouTube.',
            'itemListElement': videos.map((video, index) => ({
              '@type': 'ListItem',
              'position': index + 1,
              'item': {
                '@type': 'VideoObject',
                'name': video.customHeadline || video.title,
                'description': video.description || `${video.customHeadline || video.title} - Watch on TubeHeadlines`,
                'thumbnailUrl': video.thumbnailURL,
                'image': video.thumbnailURL, // Add image property
                'uploadDate': video.publishedAt || video.createdAt || new Date().toISOString(),
                'contentUrl': `${siteUrl}/video/${video.id}`,
                'embedUrl': `https://www.youtube.com/embed/${getYouTubeId(video.youtubeURL)}`
              }
            }))
          })}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
