import React, { useState } from 'react';
import './GetFeatured.css'; // We will create this file next

const GetFeatured = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    channelUrl: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Submitting...');
    setError('');

    // Basic validation
    if (!formData.name || !formData.channelUrl) {
      setError('Please fill out all fields.');
      setMessage('');
      return;
    }

    // Validate YouTube URL format
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    if (!youtubeRegex.test(formData.channelUrl)) {
      setError('Please enter a valid YouTube channel URL (e.g., https://www.youtube.com/yourchannel)');
      setMessage('');
      return;
    }

    try {
      const response = await fetch('/api/addToWaitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Something went wrong. Please try again.');
      }

      setMessage("Thank you for your submission! We're excited to check out your channel.");
      setFormData({ name: '', email: '', channelUrl: '' });

    } catch (err) {
      setError(err.message);
      setMessage('');
    }
  };

  return (
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
          />
          <button type="submit" className="submit-button">Join Waitlist</button>
        </form>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default GetFeatured;
