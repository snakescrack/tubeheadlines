// Netlify Function: Render Video (SSR)
// This function acts as a server-side renderer for /video/:id routes.

exports.handler = async (event) => {
  try {
    const pathParts = event.path.split('/');
    const videoIdIndex = pathParts.indexOf('video') + 1;
    const videoId = pathParts[videoIdIndex];

    if (!videoId) {
      return { statusCode: 404, body: 'Video ID missing' };
    }

    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;

    // Fallback if not configured: simply fetch the base index.html from the live site
    // so the React app still works, even if SEO isn't injected.
    const SITE_URL = process.env.URL || 'https://tubeheadlines.com';

    let baseHtml = '';
    try {
        const baseResp = await fetch(`${SITE_URL}/index.html`);
        if (baseResp.ok) {
            baseHtml = await baseResp.text();
        } else {
            return { statusCode: 500, body: 'Could not fetch base template' };
        }
    } catch(e) {
        return { statusCode: 500, body: 'Error fetching base template' };
    }

    if (!projectId) {
       console.error("VITE_FIREBASE_PROJECT_ID is missing");
       return { statusCode: 200, headers: {'Content-Type': 'text/html'}, body: baseHtml };
    }

    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/videos/${videoId}`;
    const response = await fetch(firestoreUrl);

    if (!response.ok) {
       if (response.status === 404) {
           return { statusCode: 404, body: 'Video not found' };
       }
       return { statusCode: 200, headers: {'Content-Type': 'text/html'}, body: baseHtml };
    }

    const data = await response.json();
    const video = {};

    // Flatten Firestore REST API format to standard object
    if (data.fields) {
        for (const [key, value] of Object.entries(data.fields)) {
            const valueType = Object.keys(value)[0]; // e.g., stringValue, booleanValue
            video[key] = value[valueType];
        }
    }

    function escapeXml(unsafe) {
      if (typeof unsafe !== 'string') return '';
      return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case '\'': return '&apos;';
          case '"': return '&quot;';
        }
      });
    }

    function getYouTubeId(url) {
      if (!url) return '';
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    }

    function getOptimizedThumbnailUrl(ytId, quality = 'high') {
        if (!ytId) return '';
        const qualities = { default: 'default.jpg', medium: 'mqdefault.jpg', high: 'hqdefault.jpg', standard: 'sddefault.jpg', maxres: 'maxresdefault.jpg' };
        return `https://img.youtube.com/vi/${ytId}/${qualities[quality] || qualities.high}`;
    }

    const ytId = getYouTubeId(video.youtubeURL);
    const thumbnailUrl = video.thumbnailURL || getOptimizedThumbnailUrl(ytId, 'high');
    const title = escapeXml(video.customHeadline || video.title || 'TubeHeadlines Video');
    const editorsTake = video.editorsTake ? video.editorsTake : '';
    const description = editorsTake || escapeXml(video.description || 'Watch this video on TubeHeadlines');
    const shortDesc = description.substring(0, 155) + (description.length > 155 ? '...' : '');
    const videoPageUrl = `${SITE_URL}/video/${videoId}`;

    const isThinContent = !video.editorsTake || video.editorsTake.trim().length < 50;
    const robotsTag = isThinContent ? 'noindex' : 'index, follow';

    // Inject Meta tags into the actual React application base HTML
    let html = baseHtml;

    html = html.replace(/<title>.*?<\/title>/i, `<title>${title} | TubeHeadlines</title>`);

    const injectMeta = (name, content, isProperty = false) => {
        const attr = isProperty ? 'property' : 'name';
        const metaTag = `<meta ${attr}="${name}" content="${content}" />`;
        if (html.includes(`${attr}="${name}"`)) {
            html = html.replace(new RegExp(`<meta[^>]*?${attr}="${name}"[^>]*?>`, 'i'), metaTag);
        } else {
            html = html.replace('</head>', `  ${metaTag}\n</head>`);
        }
    };

    injectMeta('description', shortDesc);
    injectMeta('og:title', title, true);
    injectMeta('og:description', shortDesc, true);
    injectMeta('og:url', videoPageUrl, true);
    injectMeta('og:image', thumbnailUrl, true);
    injectMeta('twitter:card', 'summary_large_image');
    injectMeta('twitter:title', title);
    injectMeta('twitter:description', shortDesc);
    injectMeta('twitter:image', thumbnailUrl);
    injectMeta('robots', robotsTag);

    // Canonical Fix
    html = html.replace(/<link rel=["']canonical["'][^>]*?>/i, `<link rel="canonical" href="${videoPageUrl}">`);

    // Inject static content into the React root div for bots, which will be overwritten on hydration
    const contentSection = editorsTake
      ? `<div style="background: #e8f4fd; border-left: 4px solid #cc0000; padding: 1.5rem; margin: 1.5rem 0; text-align: left;">
          <h2 style="margin-top: 0; color: #cc0000;">📝 Editor's Take</h2>
          <p style="line-height: 1.6; color: #333; font-size: 1.1rem; margin: 0;">${editorsTake}</p>
        </div>`
      : '';

    const staticContent = `
      <main style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif;">
        <h1 style="font-size: 2rem; margin-bottom: 2rem;">${title}</h1>
        <div style="background: #000; position: relative; padding-bottom: 56.25%; height: 0; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
          <iframe src="https://www.youtube.com/embed/${ytId}" style="position: absolute; top:0; left:0; width:100%; height:100%; border:none;" allowfullscreen></iframe>
        </div>
        ${contentSection}
      </main>`;

    html = html.replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">${staticContent}</div>`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
      body: html
    };

  } catch (error) {
    console.error("SSR Error:", error);
    // On hard failure, try to just send a simple response
    return { statusCode: 500, body: "Internal Server Error" };
  }
};
