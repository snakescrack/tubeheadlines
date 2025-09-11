import React from 'react';
import { Helmet } from 'react-helmet-async';
import '../styles/GetFeatured.css';

const GetFeatured = () => {
  return (
    <>
      <Helmet>
        <title>Get Featured on TubeHeadlines</title>
        <meta
          name="description"
          content="Are you a YouTube creator? Join our waitlist for a chance to be featured on our homepage."
        />
      </Helmet>
      <div className="get-featured-container">
        <div className="get-featured-card">
          <h2>Get Featured on TubeHeadlines</h2>
          <p>Are you a YouTube creator? Submit your channel for a chance to be featured on our homepage.</p>
          <form name="get-featured" method="POST" data-netlify="true" netlify-honeypot="bot-field">
            {/* This hidden input is required for Netlify Forms */}
            <input type="hidden" name="form-name" value="get-featured" />
            <p className="hidden">
              <label>
                Don’t fill this out if you’re human: <input name="bot-field" />
              </label>
            </p>
            <input
              type="text"
              name="name"
              placeholder="Your Name or Channel Name"
              className="form-input"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email Address (Optional)"
              className="form-input"
            />
            <input
              type="url"
              name="channelUrl"
              placeholder="Your YouTube Channel URL"
              className="form-input"
              required
            />
            <button type="submit" className="submit-button">Join Waitlist</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default GetFeatured;
