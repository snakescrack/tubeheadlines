import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaArrowLeft } from 'react-icons/fa';
import './ArticlePage.css';

const EssentialEquipment = () => {
  return (
    <div className="article-container">
      <Helmet>
        <title>Essential Equipment for YouTube Beginners - TubeHeadlines</title>
        <meta name="description" content="A guide to the essential, budget-friendly equipment you need to start a successful YouTube channel." />
      </Helmet>

      <article className="article-content">
        <Link to="/youtube-resources" className="back-link">
          <FaArrowLeft /> Back to YouTube Resources
        </Link>
        
        <header className="article-header">
          <span className="article-category">Getting Started</span>
          <h1>Essential Equipment for YouTube Beginners</h1>
          <div className="article-meta">
            <span>Published: October 24, 2025</span>
          </div>
        </header>

        <div className="article-body">
          <h2>You Don't Need to Spend a Fortune</h2>
          <p>Starting a YouTube channel doesn't require a Hollywood budget. Here’s a breakdown of the essential gear you need, focusing on affordable options that deliver great quality.</p>
          
          <h3 id="camera">1. Camera: Your Smartphone is Your Best Friend</h3>
          <p>Modern smartphones have incredible cameras that are more than capable of shooting high-quality 1080p or even 4K video. Before you invest in a dedicated camera, master using the one in your pocket.</p>
          <ul>
            <li><strong>Tip:</strong> Always shoot in landscape (horizontal) mode.</li>
            <li><strong>Cost:</strong> Free (if you own a smartphone).</li>
          </ul>

          <h3 id="audio">2. Audio: The Most Important Upgrade</h3>
          <p>Viewers will forgive mediocre video quality, but they won’t tolerate bad audio. A dedicated microphone is the single most important investment you can make.</p>
          <ul>
            <li><strong>Budget Option:</strong> A lavalier (lapel) mic that clips onto your shirt. Prices range from $15-$30.</li>
            <li><strong>Desktop Option:</strong> A USB microphone like the Blue Yeti or a similar model. Great for voiceovers and podcasts.</li>
          </ul>

          <h3 id="lighting">3. Lighting: Make Yourself Shine</h3>
          <p>Good lighting makes you look more professional and keeps your video clear. You don't need complex setups to start.</p>
          <ul>
            <li><strong>Free Option:</strong> Sit facing a window to use natural daylight. It's the best light source available.</li>
            <li><strong>Budget Option:</strong> A simple ring light. They provide soft, even light and are very affordable ($25-$50).</li>
          </ul>

          <h3 id="tripod">4. Stability: A Simple Tripod</h3>
          <p>Shaky footage is distracting. A tripod will keep your shots stable and professional.</p>
          <ul>
            <li><strong>For Smartphones:</strong> A small, flexible tripod is perfect and costs around $15-$25.</li>
          </ul>

          <h3 id="editing">5. Editing Software: Powerful and Free</h3>
          <p>You don't need to pay for expensive software to edit your videos.</p>
          <ul>
            <li><strong>DaVinci Resolve:</strong> A professional-grade editor with a powerful free version.</li>
            <li><strong>iMovie (for Mac users):</strong> Simple, intuitive, and comes free with every Mac.</li>
          </ul>
        </div>

        <footer className="article-footer">
          <div className="related-articles">
            <h3>You might also like:</h3>
            <ul>
              <li><Link to="/youtube-resources/getting-started/how-to-start-channel">How to Start a YouTube Channel in 2025</Link></li>
            </ul>
          </div>
        </footer>
      </article>

      <aside className="article-sidebar">
        <div className="sidebar-widget">
          <h3>In this guide:</h3>
          <nav className="table-of-contents">
            <ul>
              <li><a href="#camera">Camera</a></li>
              <li><a href="#audio">Audio</a></li>
              <li><a href="#lighting">Lighting</a></li>
              <li><a href="#tripod">Tripod</a></li>
              <li><a href="#editing">Editing Software</a></li>
            </ul>
          </nav>
        </div>
      </aside>
    </div>
  );
};

export default EssentialEquipment;
