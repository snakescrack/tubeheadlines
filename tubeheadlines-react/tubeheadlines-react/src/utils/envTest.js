// Simple utility to check if environment variables are correctly loaded

export const checkEnvironmentVariables = () => {
  const variables = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };

  // Check if any variables are missing
  const missing = Object.entries(variables)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  return {
    variables: {
      // Only show first few characters of sensitive values
      apiKey: variables.apiKey ? `${variables.apiKey.substring(0, 8)}...` : undefined,
      authDomain: variables.authDomain,
      projectId: variables.projectId,
      storageBucket: variables.storageBucket,
      messagingSenderId: variables.messagingSenderId,
      appId: variables.appId ? `${variables.appId.substring(0, 10)}...` : undefined,
      measurementId: variables.measurementId
    },
    missing,
    allPresent: missing.length === 0
  };
};
