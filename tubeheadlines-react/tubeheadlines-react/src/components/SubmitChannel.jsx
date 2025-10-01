import React from 'react';
import SEO from './SEO';
import '../styles/SubmitChannel.css';

const SubmitChannel = () => {
  return (
    <>
      <SEO 
        title="Submit Your Channel - TubeHeadlines"
        description="Are you a YouTube creator looking for more visibility? Submit your channel to be featured on TubeHeadlines and reach a wider audience."
        path="/submit"
        currentUrl="https://tubeheadlines.com/submit"
      />
      <div className="submit-channel-container">
        <div className="submit-header">
          <h1>Get Featured on TubeHeadlines</h1>
          <p className="submit-subtitle">
            We're on a mission to showcase quality content from emerging YouTube creators who deserve more visibility.
          </p>
        </div>

        <div className="submit-content">
          <div className="submit-info">
            <h2>Why Submit Your Channel?</h2>
            <ul className="benefits-list">
              <li>
                <strong>Increased Visibility:</strong> Get your content in front of thousands of viewers actively looking for quality videos.
              </li>
              <li>
                <strong>Quality Over Quantity:</strong> We focus on content quality, not just subscriber counts.
              </li>
              <li>
                <strong>Brand Opportunities:</strong> Featured creators get priority consideration for brand partnership opportunities.
              </li>
              <li>
                <strong>Community Support:</strong> Join a network of creators who are passionate about making great content.
              </li>
            </ul>

            <div className="what-we-look-for">
              <h3>What We Look For</h3>
              <p>We curate content across all categories including:</p>
              <ul>
                <li>Breaking News & Current Events</li>
                <li>Educational Content</li>
                <li>Entertainment & Lifestyle</li>
                <li>Technology & Innovation</li>
                <li>And much more...</li>
              </ul>
              <p className="quality-note">
                The most important factor is content quality and authenticity. We're looking for creators who bring unique perspectives and value to their audience.
              </p>
            </div>
          </div>

          <div className="form-container">
            <h2>Submit Your Channel</h2>
            <p className="form-intro">Fill out the form below and we'll review your channel within 48 hours.</p>
            <iframe 
              src="https://docs.google.com/forms/d/e/1FAIpQLSdEFFTdWR25nhPm8fk9/viewform?embedded=true" 
              width="100%" 
              height="800" 
              frameBorder="0" 
              marginHeight="0" 
              marginWidth="0"
              title="Creator Submission Form"
            >
              Loading…
            </iframe>
          </div>
        </div>

        <div className="submit-footer">
          <p>Questions? Email us at <a href="mailto:creators@tubeheadlines.com">creators@tubeheadlines.com</a></p>
        </div>
      </div>
    </>
  );
};

export default SubmitChannel;
