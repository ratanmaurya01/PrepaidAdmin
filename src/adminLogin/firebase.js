// firebase.js (or your Firebase initialization file)
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from '@firebase/app-check';

const firebaseConfig = {

  apiKey: "AIzaSyA-V6fIpm5Jff8p-pN3vf67nTBBa-gJdJU",
  authDomain: "mij-prepaid-meter.firebaseapp.com",
  databaseURL: "https://mij-prepaid-meter-default-rtdb.firebaseio.com",
  projectId: "mij-prepaid-meter",
  storageBucket: "mij-prepaid-meter.appspot.com",
  messagingSenderId: "288843518536",
  appId: "1:288843518536:web:3be929c9b42871b366fe7d",
  measurementId: "G-9THQD38NGC"

};

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);

const auth = getAuth(app);
const functions = getFunctions(app); // Initialize Firebase Functions with the Firebase app

const analytics = getAnalytics(app);

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider('6Lf2xj8pAAAAAPLYWM0no195q0oMmhLLOo6Y8o00'),

  // Other configurations if needed
});

const getMyAppCheckToken = async () => {
  try {
    // Get the token using the getToken method from initializeAppCheck
    const appCheckToken = await appCheck.getToken();
    return appCheckToken;
  } catch (error) {
    console.error('Error getting App Check token:', error);
    throw error;
  }
};

export { app, database, auth, functions, analytics, appCheck, httpsCallable, getMyAppCheckToken };

