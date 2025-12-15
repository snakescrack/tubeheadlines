
import { fileURLToPath } from 'url';
import path from 'path';
import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const checkVideoStatus = async (videoId) => {
    try {
        // oEmbed is the most reliable way to check without an API key
        // If the video is private or deleted, this returns 401 or 404
        const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);

        if (response.status === 200) {
            return { status: 'alive' };
        } else {
            return { status: 'dead', code: response.status };
        }
    } catch (error) {
        return { status: 'error', error: error.message };
    }
};

const main = async () => {
    console.log('Fetching videos from Firestore...');
    const videosRef = collection(db, 'videos');
    const snapshot = await getDocs(videosRef);

    console.log(`Found ${snapshot.size} videos. Checking status...`);

    let deadCount = 0;
    let checkedCount = 0;
    const batchSize = 10; // Check in parallel batches

    // Convert to array
    const docs = snapshot.docs;

    for (let i = 0; i < docs.length; i += batchSize) {
        const batch = docs.slice(i, i + batchSize);
        const promises = batch.map(async (docSnap) => {
            const data = docSnap.data();
            const videoId = data.id; // Or extract from youtubeURL

            // Extract ID if not stored directly
            let realId = videoId;
            if (!realId || realId.length > 11) { // Basic check
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                const match = data.youtubeURL?.match(regExp);
                realId = (match && match[2].length === 11) ? match[2] : null;
            }

            if (!realId) {
                console.log(`❌ [${docSnap.id}] Invalid URL: ${data.youtubeURL}`);
                return;
            }

            const result = await checkVideoStatus(realId);
            if (result.status === 'dead') {
                console.log(`💀 [DEAD] ${data.customHeadline} (ID: ${realId})`);
                deadCount++;

                // UNCOMMENT TO ENABLE DELETION
                // await deleteDoc(doc(db, 'videos', docSnap.id));
                // console.log(`   Deleted document ${docSnap.id}`);
            } else if (result.status === 'error') {
                 console.log(`⚠️ [ERROR] ${data.customHeadline} (ID: ${realId}): ${result.error}`);
            } else {
                // process.stdout.write('.'); // Alive
            }
        });

        await Promise.all(promises);
        checkedCount += batch.length;
        if (checkedCount % 50 === 0) console.log(`\nChecked ${checkedCount}/${snapshot.size}...`);
    }

    console.log(`\nScan complete.`);
    console.log(`Total videos: ${snapshot.size}`);
    console.log(`Dead videos found: ${deadCount}`);
};

main().catch(console.error);
