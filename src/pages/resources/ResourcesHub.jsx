import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaYoutube, FaLightbulb, FaChartLine, FaDollarSign } from 'react-icons/fa';
import './ResourcesHub.css';

const ResourcesHub = () => {
  const categories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <FaYoutube className="resource-category-icon" />,
      description: 'Essential guides for new YouTubers',
      articles: [
        { id: 'how-to-start-channel', title: 'How to Start a YouTube Channel in 2025', slug: 'how-to-start-channel' },
        { id: 'essential-equipment', title: 'Essential Equipment for Beginners', slug: 'essential-equipment' },
        { id: 'choose-niche', title: 'How to Choose Your Niche', slug: 'choose-niche' }
      ]
    },
    {
      id: 'optimization',
      title: 'Optimization',
      icon: <FaLightbulb className="resource-category-icon" />,
      description: 'Improve your channel performance',
      articles: [
        { id: 'youtube-seo', title: 'YouTube SEO: Titles & Descriptions', slug: 'youtube-seo' },
        { id: 'click-thumbnails', title: 'Create Click-Worthy Thumbnails', slug: 'click-thumbnails' },
        { id: 'video-length', title: 'Best Video Length for Watch Time', slug: 'video-length' }
      ]
    },
    {
      id: 'growth',
      title: 'Growth Strategies',
      icon: <FaChartLine className="resource-category-icon" />,
      description: 'Grow your audience effectively',
      articles: [
        { id: 'first-1000-subs', title: 'Get Your First 1,000 Subscribers', slug: 'first-1000-subs' },
        { id: 'best-posting-times', title: 'Best Times to Post on YouTube', slug: 'best-posting-times' },
        { id: 'analyze-analytics', title: 'How to Analyze YouTube Analytics', slug: 'analyze-analytics' }
      ]
    },
    {
      id: 'monetization',
      title: 'Monetization',
      icon: <FaDollarSign className="resource-category-icon" />,
      description: 'Earn from your content',
      articles: [
        { id: 'ypp-requirements', title: 'YouTube Partner Program Guide', slug: 'ypp-requirements' },
        { id: 'affiliate-programs', title: 'Best Affiliate Programs', slug: 'affiliate-programs' },
        { id: 'brand-deals', title: 'How to Get Brand Deals', slug: 'brand-deals' }
      ]
    }
  ];

  return (
    <div className="resources-container">
      <Helmet>
        <title>YouTube Growth Resources - TubeHeadlines</title>
        <meta name="description" content="Free resources and guides to help you grow your YouTube channel in 2025. Learn about YouTube SEO, monetization, and growth strategies." />
      </Helmet>
      
      <header className="resources-header">
        <h1>YouTube Growth Hub</h1>
        <p className="subtitle">Free resources to help you grow your YouTube channel in 2025</p>
      </header>

      <div className="resource-categories">
        {categories.map((category) => (
          <div key={category.id} className="resource-category">
            <div className="category-header">
              <span className="category-icon">{category.icon}</span>
              <h2>{category.title}</h2>
              <p>{category.description}</p>
            </div>
            <ul className="article-list">
              {category.articles.map((article) => (
                <li key={article.id}>
                  <Link to={`/youtube-resources/${category.id}/${article.slug}`}>
                    {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourcesHub;
