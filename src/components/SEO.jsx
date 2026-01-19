import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getYouTubeId, getOptimizedThumbnailUrl } from '../utils/youtubeUtils';

// Helper to safely parse dates from various formats (Firestore, string, Date)
const parseDate = (date) => {
  if (!date) return new Date();
  if (date.toDate) return date.toDate();
  if (date.seconds) return new Date(date.seconds * 1000);
  if (typeof date === 'string') return new Date(date);
  if (date instanceof Date) return date;
  return new Date();
};

const SEO = ({
  title = 'TubeHeadlines: Discover Trending YouTube Videos & News',
  description = 'TubeHeadlines curates the best YouTube videos from emerging and established creators. Find trending content, breaking news, educational videos, and viral content with a focus on quality over popularity.',
  path = '',
  // eslint-disable-next-line no-unused-vars
  image = '',
  videoData = null,
  articleData = null,
  faqData = null,
  videos = [],
  noindex = false,
  // eslint-disable-next-line no-unused-vars
  currentUrl = ''
}) => {
  const location = useLocation();
  const siteUrl = 'https://tubeheadlines.com';

  // Determine the canonical path:
  // 1. Use the explicitly provided 'path' prop if available.
  // 2. Otherwise, use location.pathname (which automatically strips query params like ?ref=twitter).
  // 3. Ensure we don't double-slash if path starts with /.
  const effectivePath = path || location.pathname;
  const cleanPath = effectivePath.startsWith('/') ? effectivePath : `/${effectivePath}`;

  // Remove trailing slash unless it is the root path '/'
  const canonicalPath = cleanPath === '/' ? '/' : cleanPath.replace(/\/$/, '');
  const fullUrl = `${siteUrl}${canonicalPath === '/' ? '' : canonicalPath}`;

  // Use the existing logo image for social sharing
  // For the homepage, always use the default social share image.
  // For other pages (like video detail pages), use the video's thumbnail.
  const isHomePage = effectivePath === '/' || effectivePath === '';

  // Determine the best image URL for Open Graph/Twitter
  let imageUrl;
  if (isHomePage) {
    imageUrl = `${siteUrl}/social-share.jpg`;
  } else if (videoData) {
    // If it's a video page, prioritize the custom thumbnail, then fallback to YouTube optimized thumbnail
    imageUrl = videoData.thumbnailURL || getOptimizedThumbnailUrl(getYouTubeId(videoData.youtubeURL), 'high');
  } else {
    // Default fallback
    imageUrl = `${siteUrl}/social-share.jpg`;
  }

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={fullUrl} />
      <meta name="robots" content={noindex ? "noindex" : "index, follow"} />
      <meta name="keywords" content="youtube news, trending videos, viral content, youtube headlines, breaking news, youtube trends, viral videos, youtube updates, trending news" />

      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content="TubeHeadlines" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@TubeHeadlines" />
      <meta name="twitter:creator" content="@TubeHeadlines" />
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
      {isHomePage && (
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
      )}

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
              'name': title.replace('TubeHeadlines - ', '').replace(' | TubeHeadlines', ''),
              'item': fullUrl
            }] : [])
          ]
        })}
      </script>

      {/* NewsArticle Schema */}
      {articleData && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            'mainEntityOfPage': {
              '@type': 'WebPage',
              '@id': fullUrl
            },
            'headline': articleData.headline || title,
            'image': [articleData.image || imageUrl],
            'datePublished': parseDate(articleData.datePublished).toISOString(),
            'dateModified': parseDate(articleData.dateModified || articleData.datePublished).toISOString(),
            'author': {
              '@type': 'Person',
              'name': articleData.author || 'TubeHeadlines'
            },
            'publisher': {
              '@type': 'Organization',
              'name': 'TubeHeadlines',
              'logo': {
                '@type': 'ImageObject',
                'url': `${siteUrl}/th-favicon.png`
              }
            },
            'description': description
          })}
        </script>
      )}

      {/* FAQPage Schema */}
      {faqData && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': faqData.map(faq => ({
              '@type': 'Question',
              'name': faq.question,
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': faq.answer
              }
            }))
          })}
        </script>
      )}

      {/* VideoObject Schema */}
      {videoData && (
        <script type="application/ld+json">
          {JSON.stringify((() => {
            // Always ensure we have a valid thumbnail URL
            const videoId = getYouTubeId(videoData.youtubeURL);
            const thumbnailUrl = videoData.thumbnailURL || getOptimizedThumbnailUrl(videoId, 'high');

            const schema = {
              '@context': 'https://schema.org',
              '@type': 'VideoObject',
              name: videoData.customHeadline || title,
              description,
              thumbnailUrl: [thumbnailUrl],
              image: thumbnailUrl,
              uploadDate: parseDate(videoData.publishedAt || videoData.createdAt).toISOString(),
              contentUrl: fullUrl,
              embedUrl: `https://www.youtube.com/embed/${videoId}`,
              // AI-optimized metadata
              keywords: videoData.category ? `${videoData.category}, youtube news, trending videos` : 'youtube news, trending videos',
              genre: videoData.category || 'News',
              publisher: {
                '@type': 'Organization',
                name: 'TubeHeadlines',
                logo: {
                  '@type': 'ImageObject',
                  url: `${siteUrl}/th-favicon.png`
                }
              },
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
            'itemListElement': videos.map((video, index) => {
              const videoId = getYouTubeId(video.youtubeURL);
              const thumbnailUrl = video.thumbnailURL || getOptimizedThumbnailUrl(videoId, 'medium');

              return {
                '@type': 'ListItem',
                'position': index + 1,
                'item': {
                  '@type': 'VideoObject',
                  'name': video.customHeadline || video.title,
                  'description': video.description || `${video.customHeadline || video.title} - Watch on TubeHeadlines`,
                  'thumbnailUrl': thumbnailUrl,
                  'image': thumbnailUrl,
                  'uploadDate': parseDate(video.publishedAt || video.createdAt).toISOString(),
                  'contentUrl': `${siteUrl}/video/${video.id}`,
                  'embedUrl': `https://www.youtube.com/embed/${videoId}`
                }
              };
            })
          })}
        </script>
      )}

      {/* Organization Schema for AI Authority Signals */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          'name': 'TubeHeadlines',
          'url': siteUrl,
          'logo': `${siteUrl}/th-favicon.png`,
          'description': 'Curating the best YouTube videos from emerging and established creators',
          'sameAs': [
            'https://twitter.com/TubeHeadlines'
          ]
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
