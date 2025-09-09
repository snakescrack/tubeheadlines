import React, { useState } from 'react';
import SocialMeta from './SocialMeta';
import '../styles/GetFeatured.css';

const GetFeatured = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    channelUrl: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    if (!formData.name || !formData.channelUrl) {
      setError('Name and Channel URL are required.');
      setIsLoading(false);
      return;
    }

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!youtubeRegex.test(formData.channelUrl)) {
      setError('Please enter a valid YouTube channel URL.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/addToWaitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      setMessage('Thank you! Your submission has been received.');
      setFormData({ name: '', email: '', channelUrl: '' });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SocialMeta
        title="Get Featured on TubeHeadlines"
        description="Are you a YouTube creator? Join our waitlist for a chance to be featured on our homepage."
        url="https://tubeheadlines.com/get-featured"
      />
      <div className="get-featured-container">
        <div className="get-featured-card">
          <h2>Get Featured on TubeHeadlines</h2>
          <p>Are you a YouTube creator? Join our waitlist for a chance to be featured on our homepage.</p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name or Channel Name"
              className="form-input"
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email Address (Optional)"
              className="form-input"
            />
            <input
              type="text"
              name="channelUrl"
              value={formData.channelUrl}
              onChange={handleChange}
              placeholder="Your YouTube Channel URL"
              className="form-input"
              required
            />
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Join Waitlist'}
            </button>
          </form>
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </>
  );
};

export default GetFeatured;
