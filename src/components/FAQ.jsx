import React from 'react';

export default function FAQ() {
  return (
    <div style={{maxWidth: '800px', margin: '2rem auto', padding: '2rem', fontFamily: 'Arial, sans-serif'}}>
      <h1 style={{textAlign: 'center', marginBottom: '2rem'}}>Frequently Asked Questions (FAQ)</h1>
      
      <div style={{marginBottom: '2rem'}}>
        <h2 style={{color: '#333', marginBottom: '0.5rem'}}>What is TubeHeadlines?</h2>
        <p style={{color: '#555', lineHeight: '1.6'}}>TubeHeadlines is a video discovery platform that curates interesting YouTube videos from small creators (under 100k subscribers). We present them in a clean, headline format to help you discover quality content.</p>
      </div>

      <div style={{marginBottom: '2rem'}}>
        <h2 style={{color: '#333', marginBottom: '0.5rem'}}>How are videos selected?</h2>
        <p style={{color: '#555', lineHeight: '1.6'}}>Videos are manually curated based on quality, educational value, and entertainment factor. We focus exclusively on creators with under 100k subscribers to help small channels get discovered.</p>
      </div>

      <div style={{marginBottom: '2rem'}}>
        <h2 style={{color: '#333', marginBottom: '0.5rem'}}>Do you host the videos?</h2>
        <p style={{color: '#555', lineHeight: '1.6'}}>No, we don't host any videos. Every link takes you directly to the creator's YouTube channel. We're purely a discovery platform to help drive traffic to original creators.</p>
      </div>

      <div style={{marginBottom: '2rem'}}>
        <h2 style={{color: '#333', marginBottom: '0.5rem'}}>Is TubeHeadlines free?</h2>
        <p style={{color: '#555', lineHeight: '1.6'}}>Yes, completely free to use with no subscriptions or hidden fees.</p>
      </div>

      <div style={{marginBottom: '2rem'}}>
        <h2 style={{color: '#333', marginBottom: '0.5rem'}}>Can I suggest videos?</h2>
        <p style={{color: '#555', lineHeight: '1.6'}}>Currently we don't have a public submission system, but we're always looking for great content to feature.</p>
      </div>
    </div>
  );
}
