import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import './VisitCounter.css';

const VisitCounter = () => {
  const [visitCounts, setVisitCounts] = useState({
    past24Hours: 0,
    past31Days: 0,
    pastYear: 0
  });

  useEffect(() => {
    const updateVisits = async () => {
      try {
        const visitsRef = doc(db, 'stats', 'visits');
        const visitsDoc = await getDoc(visitsRef);
        
        if (!visitsDoc.exists()) {
          // Initialize visits document if it doesn't exist
          await setDoc(visitsRef, {
            past24Hours: 1,
            past31Days: 1,
            pastYear: 1,
            lastUpdated: new Date().toISOString()
          });
        } else {
          // Update visit counts
          const data = visitsDoc.data();
          const now = new Date();
          const lastUpdated = new Date(data.lastUpdated);
          
          // Only update if it's been at least 1 minute since last update
          if ((now - lastUpdated) > 60000) {
            await updateDoc(visitsRef, {
              past24Hours: data.past24Hours + 1,
              past31Days: data.past31Days + 1,
              pastYear: data.pastYear + 1,
              lastUpdated: now.toISOString()
            });
          }
        }

        // Get the latest counts
        const updatedDoc = await getDoc(visitsRef);
        const data = updatedDoc.data();
        setVisitCounts({
          past24Hours: data.past24Hours.toLocaleString(),
          past31Days: data.past31Days.toLocaleString(),
          pastYear: data.pastYear.toLocaleString()
        });
      } catch (error) {
        console.error('Error updating visit counts:', error);
      }
    };

    updateVisits();
  }, []);

  return (
    <div className="visit-counter">
      <div className="visit-header">VISITS TO TUBEHEADLINES {new Date().toLocaleDateString()}</div>
      <div className="visit-stats">
        <div>{visitCounts.past24Hours} PAST 24 HOURS</div>
        <div>{visitCounts.past31Days} PAST 31 DAYS</div>
        <div>{visitCounts.pastYear} PAST YEAR</div>
      </div>
    </div>
  );
};

export default VisitCounter;
