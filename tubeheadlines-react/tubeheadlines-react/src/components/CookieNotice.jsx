import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CookieNotice.css';

export default function CookieNotice() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem('cookiesAccepted');
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-notice">
      <span>
        This website uses cookies to improve your experience. By continuing to use this site, you accept our use of cookies. 
        See our <Link to="/privacy">Privacy Policy</Link> for details.
      </span>
      <button onClick={acceptCookies}>OK</button>
    </div>
  );
}
