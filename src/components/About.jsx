import React from 'react';
import SEO from './SEO';
import { Link } from 'react-router-dom';

export default function About() {
    return (
        <>
            <SEO
                title="About Us - TubeHeadlines"
                description="TubeHeadlines is the premier destination for curated YouTube news and viral video trends. Learn more about our mission."
                path="/about"
            />
            <div className="about-page" style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: '#333' }}>About TubeHeadlines</h1>

                <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    <strong>TubeHeadlines</strong> is the premier destination for curated YouTube news, viral trends, and creator insights. In an era of endless content scrolling, we filter the noise to bring you the stories that actually matter.
                </p>

                <h2 style={{ color: '#d32f2f', marginTop: '2rem' }}>Our Mission</h2>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                    We believe that online video is the most important medium of our time. However, finding high-quality content amidst the millions of daily uploads is becoming increasingly difficult.
                </p>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginTop: '1rem' }}>
                    <strong>Our core mission is to solve the discoverability crisis for small creators.</strong> The YouTube algorithm often favors established channels, leaving millions of incredible videos unseen. TubeHeadlines levels the playing field by curating content based on <em>quality</em>, not just subscriber count.
                </p>

                <h2 style={{ color: '#d32f2f', marginTop: '2rem' }}>Championing Emerging Talent</h2>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                    We are not just a news aggregator; we are a launchpad. By featuring videos from up-and-coming creators alongside major headlines, we provide a unique ecosystem where hidden gems can go viral. We believe that a great story deserves to be heard, whether it comes from a channel with 10 million subs or 100.
                </p>

                <h2 style={{ color: '#d32f2f', marginTop: '2rem' }}>What We Do</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
                    <div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Curated Headlines</h3>
                        <p>We track trending topics across the platform and present them in an easy-to-digest headline format, so you never miss a beat.</p>
                    </div>
                    <div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Creator Tools</h3>
                        <p>From income calculators to viral idea generators, we build free tools to help aspiring YouTubers grow their own channels.</p>
                    </div>
                    <div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Analytics & Insights</h3>
                        <p>We provide data-driven insights often missed by the algorithm, helping viewers discover hidden gems.</p>
                    </div>
                </div>

                <h2 style={{ color: '#d32f2f', marginTop: '3rem' }}>How It Works</h2>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    TubeHeadlines operates as a curated discovery engine. <strong>We do not host any video content.</strong> All videos are embedded directly from YouTube and link back to the original creator's channel. This ensures that every view, like, and subscription on our site counts directly towards the creator's YouTube metrics and monetization.
                </p>

                <h2 style={{ color: '#d32f2f', marginTop: '3rem' }}>Why It Matters</h2>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    Algorithms are great, but human curation is better. By organizing content into clear categories and adding context, we transform passive scrolling into active discovery. Whether you are a casual viewer or a dedicated creator, TubeHeadlines is your daily briefing for the video world.
                </p>

                <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#f0f0f0', borderRadius: '8px', textAlign: 'center' }}>
                    <h3>Join the Conversation</h3>
                    <p>Have a video that deserves to be seen? We accept submissions from our community.</p>
                    <Link to="/submit" style={{ display: 'inline-block', marginTop: '1rem', backgroundColor: '#d32f2f', color: 'white', padding: '10px 20px', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Submit a Channel</Link>
                </div>
            </div>
        </>
    );
}
