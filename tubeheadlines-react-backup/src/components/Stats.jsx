import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';

export default function Stats() {
  const [stats, setStats] = useState({
    past24Hours: 0,
    past31Days: 0,
    pastYear: 0
  });

  useEffect(() => {
    const updateStats = async () => {
      const statsRef = doc(db, 'stats', 'visits');
      
      // Get current stats
      const statsDoc = await getDoc(statsRef);
      if (statsDoc.exists()) {
        setStats(statsDoc.data());
      }

      // Increment visit count
      await setDoc(statsRef, {
        past24Hours: increment(1),
        past31Days: increment(1),
        pastYear: increment(1)
      }, { merge: true });
    };

    updateStats();
  }, []);

  // Reset counters daily/monthly/yearly
  useEffect(() => {
    const resetCounters = async () => {
      const statsRef = doc(db, 'stats', 'visits');
      const now = new Date();
      const lastResetRef = doc(db, 'stats', 'lastReset');
      const lastResetDoc = await getDoc(lastResetRef);
      const lastReset = lastResetDoc.exists() ? lastResetDoc.data() : {};

      // Reset 24-hour counter
      if (!lastReset.daily || new Date(lastReset.daily).getDate() !== now.getDate()) {
        await setDoc(statsRef, { past24Hours: 0 }, { merge: true });
        await setDoc(lastResetRef, { daily: now.toISOString() }, { merge: true });
      }

      // Reset 31-day counter
      if (!lastReset.monthly || new Date(lastReset.monthly).getMonth() !== now.getMonth()) {
        await setDoc(statsRef, { past31Days: 0 }, { merge: true });
        await setDoc(lastResetRef, { monthly: now.toISOString() }, { merge: true });
      }

      // Reset yearly counter
      if (!lastReset.yearly || new Date(lastReset.yearly).getFullYear() !== now.getFullYear()) {
        await setDoc(statsRef, { pastYear: 0 }, { merge: true });
        await setDoc(lastResetRef, { yearly: now.toISOString() }, { merge: true });
      }
    };

    resetCounters();
  }, []);

  return (
    <div className="stats">
      <div className="email">EMAIL: TUBEHEADLINES@GMAIL.COM</div>
      <div className="visits">
        <div>VISITS TO TUBEHEADLINES {new Date().toLocaleDateString()}</div>
        <div>{stats.past24Hours.toLocaleString()} PAST 24 HOURS</div>
        <div>{stats.past31Days.toLocaleString()} PAST 31 DAYS</div>
        <div>{stats.pastYear.toLocaleString()} PAST YEAR</div>
      </div>
      <div className="privacy">
        <a href="/privacy">PRIVACY POLICY</a>
      </div>
    </div>
  );
}
