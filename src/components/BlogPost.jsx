import React from 'react';
import { Link } from 'react-router-dom';

export default function BlogPost() {
  return (
    <div style={{maxWidth: '800px', margin: '2rem auto', padding: '2rem', fontFamily: 'Arial, sans-serif', color: '#333'}}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#0056b3', fontSize: '1.1rem' }}>
          &larr; Back to TubeHeadlines Home
        </Link>
      </div>
      <h1 style={{textAlign: 'center', marginBottom: '2rem'}}>Why I Built TubeHeadlines: A Better Way to Discover Great YouTube Videos</h1>
      
      <div style={{fontSize: '1.1rem', lineHeight: '1.7'}}>
        <p>Have you ever felt stuck in a YouTube echo chamber? You see the same big channels, the same trending videos, and the same algorithm-approved content over and over again. It’s not that the content is bad, but I always had a nagging feeling that I was missing out on something... something <em>better</em>.</p>
        
        <p>I was tired of the algorithm deciding what was "trending." I knew there were thousands of talented creators out there making incredible videos that never saw the light of day, buried under a mountain of celebrity vlogs and corporate content.</p>
        
        <p>That frustration is why I built TubeHeadlines.</p>


        <h2 style={{marginTop: '3rem', marginBottom: '1.5rem'}}>The Problem with Discovery</h2>
        
        <p>The problem isn't a lack of quality content on YouTube; it's a problem of discovery. The platform's algorithm is designed to keep you watching, which often means showing you more of what you've already seen or what's already popular. It's a system that favors established players, making it incredibly difficult for small, emerging creators to break through, no matter how brilliant their work is.</p>
        
        <p>I wanted a place where quality was the only thing that mattered. A place where a video from a creator with 100 subscribers could be featured right next to one from a creator with a million, as long as it was good.</p>

        <h2 style={{marginTop: '3rem', marginBottom: '1.5rem'}}>The Solution: TubeHeadlines</h2>
        
        <p>TubeHeadlines is my answer to this problem. It's a manually curated discovery platform with a simple mission: to surface the best and most interesting videos on YouTube, with a special focus on the hidden gems.</p>
        
        <p>Here’s what makes TubeHeadlines different:</p>

        
        <ul style={{paddingLeft: '2rem'}}>
          <li style={{marginBottom: '1rem'}}><strong>Human Curation:</strong> Every video on our site is hand-picked by a real person. We watch for great storytelling, high production value, and unique perspectives—not just view counts or subscriber numbers.</li>
          <li style={{marginBottom: '1rem'}}><strong>A Level Playing Field:</strong> We believe that great content can come from anywhere. We intentionally seek out videos from smaller, emerging creators to give them the exposure they deserve. On TubeHeadlines, quality is the only algorithm.</li>
          <li><strong>A Clean, Simple Interface:</strong> We present videos in a straightforward, headline-style format. No distractions, no clickbait—just great content waiting to be discovered.</li>
        </ul>

        <h2 style={{marginTop: '3rem', marginBottom: '1.5rem'}}>For Viewers and Creators</h2>
        
        <p>If you're a viewer who is hungry for fresh content and tired of the same old recommendations, TubeHeadlines is for you. It’s a place to find your next favorite channel.</p>
        
        <p>And if you're a creator—especially a smaller one trying to get noticed—TubeHeadlines was built specifically for you. My main goal is to help you get discovered, find a new audience, and gain traffic. We don't host your videos or put ads on them; every click sends viewers directly to your YouTube channel, helping you grow.</p>

        <h2 style={{marginTop: '3rem', marginBottom: '1.5rem'}}>The Future</h2>
        
        <p>This is just the beginning. My goal is to build a community around the idea of quality content discovery. Thank you for being here and for believing in a better way to explore YouTube.</p>
      </div>
    </div>
  );
}
