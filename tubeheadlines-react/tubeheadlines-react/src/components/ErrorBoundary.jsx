import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service here
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Oops! Something went wrong.</h2>
          <p>We're working on fixing this. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
