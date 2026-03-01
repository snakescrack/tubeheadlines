import React from 'react';
import SEO from './SEO';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const toolsList = [
    {
        name: "Viral Idea Generator",
        description: "Generate high-converting YouTube video ideas based on tested psychological frameworks and current trends.",
        path: "/viral-idea-generator.html"
    },
    {
        name: "Video Description Generator",
        description: "Write SEO-optimized YouTube descriptions with chapters, timestamps, and social links in seconds.",
        path: "/description-generator.html"
    },
    {
        name: "YouTube Script Timer",
        description: "Calculate exactly how long your video will be based on your script length and reading speed.",
        path: "/script-timer.html"
    },
    {
        name: "YouTube Chapter Formatter",
        description: "Instantly create beautifully formatted YouTube timestamps and chapters that the algorithm loves.",
        path: "/youtube-chapter-formatter.html"
    },
    {
        name: "Thumbnail Visualizer",
        description: "Preview how your thumbnail and title will look in the YouTube algorithm before you publish.",
        path: "/youtube-thumbnail-visualizer.html"
    },
    {
        name: "YouTube Income Calculator",
        description: "Accurately estimate how much money a channel is making based on real-world CPM ranges.",
        path: "/youtube-income-calculator.html"
    },
    {
        name: "Shorts Revenue Estimator",
        description: "Calculate potential earnings from the highly competitive YouTube Shorts ecosystem.",
        path: "/youtube-shorts-revenue-estimator.html"
    },
    {
        name: "Sponsorship Calculator",
        description: "Find out exactly how much you should be charging brands for integrations and shoutouts.",
        path: "/youtube-sponsorship-calculator.html"
    },
    {
        name: "SEO Scorecard & Analyzer",
        description: "Grade your video's packaging and metadata against the most important ranking factors.",
        path: "/youtube-seo-scorecard.html"
    },
    {
        name: "Advertiser Friendly Checker",
        description: "Scan your title for words that might trigger a yellow 'limited ads' demonetization icon.",
        path: "/advertiser-friendly-title-checker.html"
    },
    {
        name: "Fair Use Disclaimer Generator",
        description: "Create a custom Section 107 legal disclaimer for your reaction and commentary videos.",
        path: "/youtube-fair-use-disclaimer-generator.html"
    },
    {
        name: "YouTube Teleprompter",
        description: "A free, browser-based native teleprompter to record your videos confidently without stuttering.",
        path: "/youtube-teleprompter.html"
    },
    {
        name: "Thumbnail Downloader",
        description: "Extract the highest resolution HD cover image from any YouTube video instantly.",
        path: "/youtube-thumbnail-downloader.html"
    }
];

export default function ToolsHub() {
    return (
        <>
            <SEO
                title="Free YouTube Tools for Creators - TubeHeadlines"
                description="Access 13+ free software tools for YouTubers. Generate video ideas, calculate your income, analyze your SEO, format chapters, and more."
                path="/tools"
            />
            <div className="tools-hub-page" style={{ maxWidth: '1200px', margin: '2rem auto', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>Free Creator Tools</h1>
                    <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
                        Everything you need to grow your channel, calculate your worth, and beat the YouTube algorithm. No paywalls, no sign-ups required.
                    </p>
                </div>

                <div className="tools-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '2rem',
                    padding: '1rem'
                }}>
                    {toolsList.map((tool, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                padding: '2rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                border: '1px solid #ebebeb'
                            }}
                        >
                            <h2 style={{ fontSize: '1.4rem', color: '#2b2b2b', marginBottom: '1rem' }}>
                                {tool.name}
                            </h2>
                            <p style={{ color: '#555', lineHeight: '1.5', marginBottom: '2rem', flexGrow: 1 }}>
                                {tool.description}
                            </p>
                            <a
                                href={tool.path}
                                style={{
                                    display: 'inline-block',
                                    backgroundColor: '#FF0000',
                                    color: 'white',
                                    padding: '12px 24px',
                                    borderRadius: '6px',
                                    textDecoration: 'none',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    transition: 'background-color 0.2s ease',
                                    boxShadow: '0 2px 4px rgba(255, 0, 0, 0.2)'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#cc0000'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#FF0000'}
                            >
                                Try Tool &rarr;
                            </a>
                        </motion.div>
                    ))}
                </div>
            </div>
        </>
    );
}
