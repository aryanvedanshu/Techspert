// This file exposes Firebase config to the seeding script
// It will be injected by Vite during build/dev

// Try to get config from environment
const getFirebaseConfig = () => {
  // In Vite, we can access import.meta.env
  if (typeof import !== 'undefined' && import.meta && import.meta.env) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
  }
  return null;
};

// Expose to window for the seeding script
if (typeof window !== 'undefined') {
  window.FIREBASE_CONFIG = getFirebaseConfig();
}

