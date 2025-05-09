import { useState } from 'react';
import './ShareButton.css';

export default function ShareButton() {
  const [showPopup, setShowPopup] = useState(false);
  
  const shareUrl = window.location.href;
  const title = 'TubeHeadlines';

  const shareOptions = {
    x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + shareUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareUrl)}`
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <>
      <button className="share-button" onClick={() => setShowPopup(true)}>
        SHARE
      </button>

      {showPopup && (
        <div className="share-popup">
          <div className="share-popup-content">
            <a href={shareOptions.x} target="_blank" rel="noopener noreferrer">X</a>
            <a href={shareOptions.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href={shareOptions.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a href={shareOptions.email}>Email</a>
            <button onClick={copyLink}>Copy Link</button>
            <button className="close-button" onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
