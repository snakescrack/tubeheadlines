import React, { useState } from 'react';
import WelcomeBanner from './WelcomeBanner';
import '../App.css';
import './PaginationTest.css';

const BannerTest = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 18; // Example total pages
  return (
    <div className="app">
      <WelcomeBanner />
      <header>
        <h1>TUBE HEADLINES</h1>
        <div className="updated">Updated {new Date().toLocaleString()}</div>
      </header>
      <div style={{height: '1px', width: '100%', backgroundColor: '#ff0000', margin: '20px 0'}}></div>
      
      <div className="columns">
        <div className="column">
          <div className="column-header">
            <h3>BREAKING NEWS</h3>
          </div>
          <div className="video-item">
            <div className="video-link">
              <img src="https://via.placeholder.com/300x200?text=Sample+Video" alt="Sample Video" />
              <p>Sample Video Headline</p>
            </div>
          </div>
        </div>
        
        <div className="column">
          <div className="column-header">
            <h3>TRENDING NOW</h3>
          </div>
          <div className="video-item">
            <div className="video-link">
              <img src="https://via.placeholder.com/300x200?text=Sample+Video" alt="Sample Video" />
              <p>Sample Video Headline</p>
            </div>
          </div>
        </div>
        
        <div className="column">
          <div className="column-header">
            <h3>ENTERTAINMENT</h3>
          </div>
          <div className="video-item">
            <div className="video-link">
              <img src="https://via.placeholder.com/300x200?text=Sample+Video" alt="Sample Video" />
              <p>Sample Video Headline</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Improved Pagination Test */}
      <div style={{margin: '40px auto', maxWidth: '800px', textAlign: 'center'}}>
        <h3>Pagination Test</h3>
        <div className="pagination-test">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="page-button"
          >
            Previous
          </button>
          
          {/* Page Numbers */}
          <div className="page-numbers">
            {[...Array(totalPages)].map((_, index) => {
              const pageNum = index + 1;
              
              // Show first page, last page, current page, and 1 page before/after current
              if (
                pageNum === 1 || 
                pageNum === totalPages || 
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button 
                    key={pageNum} 
                    onClick={() => setCurrentPage(pageNum)}
                    className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              }
              
              // Show ellipsis for gaps
              if (pageNum === 2 || pageNum === totalPages - 1) {
                return <span key={pageNum} className="ellipsis">...</span>;
              }
              
              return null;
            })}
          </div>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="page-button"
          >
            Next
          </button>
        </div>
        <div className="page-info">
          Page {currentPage} of {totalPages}
        </div>
      </div>
      
      <div className="instructions" style={{margin: '40px auto', maxWidth: '800px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '5px'}}>
        <h3>Testing Instructions</h3>
        <p>This page demonstrates two new features:</p>
        <h4>1. Welcome Banner</h4>
        <p>The banner appears at the top of the page for first-time visitors.</p>
        <p>To test it again (simulate first visit):</p>
        <ol>
          <li>Open your browser's developer tools (F12)</li>
          <li>Go to Application tab (or Storage in some browsers)</li>
          <li>Find "Local Storage" on the left sidebar</li>
          <li>Delete the "th_visited" item</li>
          <li>Refresh the page</li>
        </ol>
        
        <h4>2. Improved Pagination</h4>
        <p>The pagination now includes clickable page numbers, allowing users to jump directly to specific pages.</p>
        <p>Try clicking on different page numbers to see how it works.</p>
      </div>
    </div>
  );
};

export default BannerTest;
