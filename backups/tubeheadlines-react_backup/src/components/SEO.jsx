import { Helmet } from 'react-helmet-async';

const SEO = ({
  title = 'TubeHeadlines',
  description = 'Latest YouTube Trending Headlines, Breaking News, and Viral Video Updates - Your Real-Time YouTube News Aggregator',
  path = '',
  image = '',
  videoData = null
}) => {
  const siteUrl = 'https://tubeheadlines.com';
  const fullUrl = `${siteUrl}${path}`;
  const imageUrl = image || videoData?.thumbnailURL || `${siteUrl}/logo.png`;

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

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'TubeHeadlines',
          url: siteUrl,
          description: 'Your source for breaking news, trending videos, and entertainment'
        })}
      </script>

      {videoData && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'VideoObject',
            name: videoData.customHeadline || title,
            description,
            thumbnailUrl: videoData.thumbnailURL,
            uploadDate: videoData.createdAt,
            contentUrl: videoData.youtubeURL
          })}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
