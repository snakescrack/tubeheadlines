import React from 'react';
import SEO from './SEO';

export default function Contact() {
    return (
        <>
            <SEO
                title="Contact Us - TubeHeadlines"
                description="Get in touch with the TubeHeadlines team for inquiries, feedback, or support."
                path="/contact"
            />
            <div className="contact-page" style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: '#333' }}>Contact Us</h1>

                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                    We value your feedback and inquiries. Whether you have a question about a video, a suggestion for our platform, or a business inquiry, we're here to help.
                </p>

                <div style={{ backgroundColor: '#f9f9f9', padding: '2rem', borderRadius: '8px', border: '1px solid #eee' }}>
                    <h2 style={{ marginTop: 0, color: '#d32f2f' }}>Get in Touch</h2>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>General Inquiries</h3>
                        <p>For general questions, feedback, or support requests:</p>
                        <a href="mailto:info@tubeheadlines.com" style={{ fontSize: '1.2rem', color: '#0066cc', fontWeight: 'bold', textDecoration: 'none' }}>info@tubeheadlines.com</a>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Content Removal</h3>
                        <p>If you are a creator and wish to have your content removed from our directory, please email us with the subject line "Content Removal Request" and include the link to the page in question.</p>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Advertising & Partnerships</h3>
                        <p>For advertising opportunities or partnership proposals, please contact us at the email above.</p>
                    </div>
                </div>

                <div style={{ marginTop: '3rem', textAlign: 'center', color: '#666' }}>
                    <p>We aim to respond to all inquiries within 24-48 business hours.</p>
                </div>
            </div>
        </>
    );
}
