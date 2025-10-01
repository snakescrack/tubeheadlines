import React from 'react';
import { Helmet } from 'react-helmet-async';
import '../styles/GetFeatured.css';

const GetFeatured = () => {
  return (
    <>
      <Helmet>
        <title>Creator Submissions | TubeHeadlines</title>
        <meta name="description" content="Submit your YouTube channel to be featured on TubeHeadlines." />
      </Helmet>
      <div className="get-featured-container">
        <div className="get-featured-card">
          <h2>Creator Submissions</h2>
          <p>Submit your YouTube channel for a chance to be featured on our homepage.</p>
          <div className="google-form-container">
            <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSfteL5ABW_mR209c8Sg9FNokURxgsaZ4WkZXDyB1-rQl5wYPw/viewform?embedded=true" width="100%" height="645" frameBorder="0" marginHeight="0" marginWidth="0">Loading…</iframe>
          </div>
        </div>
      </div>
    </>
  );
};

export default GetFeatured;