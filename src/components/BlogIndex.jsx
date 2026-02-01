import React from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';

export default function BlogIndex() {
    const posts = [
        {
            title: "10 Free Tools Every Small YouTuber Needs in 2026",
            excerpt: "Stop paying for expensive software. Here are the 10 best free tools for YouTube creators, from script writing to thumbnail design.",
            date: "February 2, 2026",
            path: "/blog/10-free-tools-for-youtubers"
        },
        {
            title: "How to Go Viral on YouTube in 2024 (The Mathematical Approach)",
            excerpt: "Stop guessing and start growing. Learn the formula behind viral videos, based on millions of views.",
            date: "February 1, 2026",
            path: "/blog/viral-youtube-strategy"
        },
        {
            title: "Why I Built TubeHeadlines: A Better Way to Discover Great YouTube Videos",
            excerpt: "I built TubeHeadlines to fix YouTube discovery. Learn why manual curation and a focus on quality over algorithms makes for a better viewing experience.",
            date: "December 1, 2023",
            path: "/blog/why-i-built-tubeheadlines"
        }
    ];

    return (
        <>
            <SEO
                title="TubeHeadlines Blog - YouTube Growth Strategies & News"
                description="Expert tips on YouTube growth, viral strategies, and the latest platform news. Learn how to grow your channel with data-driven insights."
                path="/blog"
            />

            <main style={{ maxWidth: '1000px', margin: '2rem auto', padding: '2rem' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '2.5rem', color: '#333' }}>TubeHeadlines Blog</h1>
                <p style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '1.2rem', color: '#666' }}> Strategies, insights, and stories for the modern creator.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {posts.map((post, index) => (
                        <article key={index} style={{
                            border: '1px solid #eee',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            transition: 'transform 0.2s ease',
                            backgroundColor: 'white'
                        }}>
                            <Link to={post.path} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>{post.date}</div>
                                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', lineHeight: '1.3', color: '#222' }}>{post.title}</h2>
                                    <p style={{ color: '#555', lineHeight: '1.6' }}>{post.excerpt}</p>
                                    <div style={{ marginTop: '1.5rem', color: '#FF0000', fontWeight: '600' }}>Read Article &rarr;</div>
                                </div>
                            </Link>
                        </article>
                    ))}
                </div>
            </main>
        </>
    );
}
