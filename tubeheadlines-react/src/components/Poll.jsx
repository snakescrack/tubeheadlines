import React, { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import '../styles/Poll.css';

const Poll = () => {
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [results, setResults] = useState({ yes: 0, no: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Check if user has already voted (using localStorage)
    const voted = localStorage.getItem('tubeheadlines_poll_voted');
    if (voted) {
      setHasVoted(true);
      setShowResults(true);
      loadResults();
    }
  }, []);

  const loadResults = async () => {
    try {
      const pollCollection = collection(db, 'poll_responses');
      const snapshot = await getDocs(pollCollection);
      
      let yesCount = 0;
      let noCount = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.response === 'yes') yesCount++;
        if (data.response === 'no') noCount++;
      });
      
      setResults({
        yes: yesCount,
        no: noCount,
        total: yesCount + noCount
      });
    } catch (error) {
      console.error('Error loading poll results:', error);
    }
  };

  const handleVote = async () => {
    if (!selectedOption || loading) return;
    
    setLoading(true);
    
    try {
      // Save vote to Firebase
      await addDoc(collection(db, 'poll_responses'), {
        response: selectedOption,
        timestamp: new Date(),
        userAgent: navigator.userAgent.substring(0, 100) // Basic analytics
      });
      
      // Mark as voted in localStorage
      localStorage.setItem('tubeheadlines_poll_voted', 'true');
      
      setHasVoted(true);
      setShowResults(true);
      await loadResults();
      
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('There was an error submitting your vote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPercentage = (count) => {
    if (results.total === 0) return 0;
    return Math.round((count / results.total) * 100);
  };

  return (
    <div className="poll-container">
      <h3 className="poll-title">Help Us Improve TubeHeadlines</h3>
      
      {!showResults ? (
        <div className="poll-voting">
          <p className="poll-question">
            Should we add a feature to let you request your video to be featured on TubeHeadlines?
          </p>
          
          <div className="poll-options">
            <label className="poll-option">
              <input
                type="radio"
                name="poll"
                value="yes"
                checked={selectedOption === 'yes'}
                onChange={(e) => setSelectedOption(e.target.value)}
              />
              <span>Yes, I'd love to request my videos be featured</span>
            </label>
            
            <label className="poll-option">
              <input
                type="radio"
                name="poll"
                value="no"
                checked={selectedOption === 'no'}
                onChange={(e) => setSelectedOption(e.target.value)}
              />
              <span>No, the current curation works fine</span>
            </label>
          </div>
          
          <button 
            className="poll-submit-btn"
            onClick={handleVote}
            disabled={!selectedOption || loading}
          >
            {loading ? 'Submitting...' : 'Submit Vote'}
          </button>
        </div>
      ) : (
        <div className="poll-results">
          <div className="poll-question">
            Should we add a feature to let you request your video to be featured on TubeHeadlines?
          </div>
          
          <div className="poll-result-item">
            <div className="poll-result-label">
              <span>Yes, I'd like to suggest videos</span>
              <span className="poll-percentage">{getPercentage(results.yes)}%</span>
            </div>
            <div className="poll-result-bar">
              <div 
                className="poll-result-fill poll-result-yes"
                style={{ width: `${getPercentage(results.yes)}%` }}
              ></div>
            </div>
            <span className="poll-vote-count">{results.yes} votes</span>
          </div>
          
          <div className="poll-result-item">
            <div className="poll-result-label">
              <span>No, the current system works fine</span>
              <span className="poll-percentage">{getPercentage(results.no)}%</span>
            </div>
            <div className="poll-result-bar">
              <div 
                className="poll-result-fill poll-result-no"
                style={{ width: `${getPercentage(results.no)}%` }}
              ></div>
            </div>
            <span className="poll-vote-count">{results.no} votes</span>
          </div>
          
          <p className="poll-total">Total votes: {results.total}</p>
          
          {hasVoted && (
            <p className="poll-thank-you">Thank you for your feedback!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Poll;
